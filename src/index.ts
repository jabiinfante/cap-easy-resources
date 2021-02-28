import { Options, run } from 'cordova-res';
import { existsSync, mkdtemp, rmdir } from 'fs';
import hexRgb from 'hex-rgb';
import { tmpdir } from 'os';
import { join, sep } from 'path';
import { performance } from 'perf_hooks';
import { concat, defer, iif, of } from 'rxjs';
import { finalize, map, switchMap, tap, toArray } from 'rxjs/operators';
import { promisify } from 'util';
import { Gradient } from './interfaces/background';
import { createImage } from './libs/images';
import { createCmd, getParams } from './libs/params';
import { askForColor, askForConfirmation, askForGradient, askForList, askForPath, askForRatio } from './libs/prompts';

const ICON_SIZE = 1024;
const SPLASH_SIZE = 2732;
let initTime;

of(getParams()).pipe(

  switchMap(params =>
    concat(
      iif(
        () => !params['projectPath'],
        askForPath('Select capacitor project path', 'directory'),
        of(params['projectPath']).pipe(
          tap(path => console.log(`🔹 Project Path set: ${path}`))
        )
      ),
      iif(
        () => !params['iconImage'],
        askForPath('Enter icon image path'),
        of(params['iconImage']).pipe(
          tap(x => console.log(`🔹 Icon image path set: ${x}`))
        )
      ),
      iif(
        () => !params.iconBgcolor && !params.iconBgGradColor1 && !params.iconBgGradColor2 && !params.iconBgGradAngle,
        askForList('Select background type for icon', ['solid color', 'gradient']).pipe(
          switchMap(choice =>
            iif(
              () => choice === 'solid color',
              askForColor('Enter icon background color'),
              askForGradient('Enter icon background gradient')
            )
          )
        ),
        iif(
          () => !!params.iconBgcolor,
          of(params.iconBgcolor).pipe(
            map(color => {
              color = color[0] !== '#' ? `#${color}` : color;
              const parsedColor = hexRgb(color);
              if (!parsedColor) {
                throw 'Invalid color for icon background.';
              } else {
                const { red: r, green: g, blue: b } = parsedColor;
                return { r, g, b };
              }
            }),
            tap(p => console.log(`🔹 Icon background set: rgb(${Object.values(p)})`))
          ),
          of({ color1: params.iconBgGradColor1, color2: params.iconBgGradColor2, angle: parseInt(params.iconBgGradAngle, 10) }).pipe(
            tap((p: Gradient) => console.log(`🔹 Icon image background gradient set: ${p.color1}, ${p.color2} (${p.angle}deg)`))
          )
        )
      ),
      iif(
        () => !params['iconRatio'],
        askForRatio('Enter icon size ratio', { default: 0.60 }),
        of(params['iconRatio']).pipe(
          tap(p => console.log(`🔹 Icon size ratio set: ${p}`))
        )
      ),
      iif(
        () => !params['splashImage'],
        askForPath('Enter splash screen image path'),
        of(params['splashImage']).pipe(
          tap(p => console.log(`🔹 Splash image path set: ${p}`))
        )
      ),
      iif(
        () => !params.splashBgcolor && !params.splashBgGradColor1 && !params.splashBgGradColor2 && !params.splashBgGradAngle,
        askForList('Select background type for splash screen', ['solid color', 'gradient']).pipe(
          switchMap(choice =>
            iif(
              () => choice === 'solid color',
              askForColor('Enter splash screen background color'),
              askForGradient('Enter splash screen background gradient')
            )
          )
        ),
        iif(
          () => !!params.splashBgcolor,
          of(params.splashBgcolor).pipe(
            map(color => {
              color = color[0] !== '#' ? `#${color}` : color;
              const parsedColor = hexRgb(color);
              if (!parsedColor) {
                throw 'Invalid color for splash background.';
              } else {
                const { red: r, green: g, blue: b } = parsedColor;
                return { r, g, b };
              }
            }),
            tap(p => console.log(`🔹 Splash image background set: rgb(${Object.values(p)})`))
          ),
          of({ color1: params.splashBgGradColor1, color2: params.splashBgGradColor2, angle: parseInt(params.splashBgGradAngle, 10) }).pipe(
            tap((p: Gradient) => console.log(`🔹 Splash image background gradient set: ${p.color1}, ${p.color2} (${p.angle}deg)`))
          )
        )
      ),
      iif(
        () => !params['splashRatio'],
        askForRatio('Enter splash screen size ratio', { default: 0.45 }),
        of(params['splashRatio']).pipe(
          tap(p => console.log(`🔹 Splash size ratio set: ${p}`))
        )
      ),
      iif(
        () => params['android'] === null,
        askForConfirmation('Build resources for android'),
        of(params['android']).pipe(
          tap(p => console.log(`🔹 Building resources for android: ${p ? '✅' : '❌'}`))
        )
      ),
      iif(
        () => params['ios'] === null,
        askForConfirmation('Build resources for iOS'),
        of(params['ios']).pipe(
          tap(p => console.log(`🔹 Building resources for ios: ${p ? '✅' : '❌'}`))
        )
      ),
      defer(() => promisify(mkdtemp)(`${tmpdir()}${sep}capResources`))
    )
  ),
  toArray<any>(),
  map(([projectPath, iconImage, iconBg, iconRatio, splashImage, splashBg, splashRatio, android, ios, resourcesDirectory]) => {

    if (android && !existsSync(join(projectPath, 'android'))) {
      console.warn('🔴 No android platform folder found. (skipping)');
      android = false;
    }

    if (ios && !existsSync(join(projectPath, 'ios'))) {
      console.warn('🔴 No ios platform folder found. (skipping)');
      ios = false;
    }

    if (!android && !ios) {
      throw '🤷 No platform selected. Nothing to do.';
    }

    return {
      iconImage, iconBg, iconRatio, splashImage, splashBg, splashRatio, projectPath, android, ios, resourcesDirectory
    }
  }),
  switchMap(({ iconImage, iconBg, iconRatio, splashImage, splashBg, splashRatio, projectPath, android, ios, resourcesDirectory }) => {


    const commandLine = createCmd(iconImage, iconBg, iconRatio, splashImage, splashBg, splashRatio, projectPath, android, ios);

    const projectConfig = {};
    const platforms = {};

    const iconPath = join(resourcesDirectory, 'icon.png');
    const splashPath = join(resourcesDirectory, 'splash.png');

    if (android) {
      projectConfig['android'] = {
        directory: join(projectPath, 'android')
      }

      platforms['android'] = {
        "adaptive-icon": {
          icon: { sources: [iconPath] },
          background: { sources: [iconPath] },
          foreground: { sources: [iconPath] }
        },
        splash: { sources: [splashPath] }
      }
    }

    if (ios) {
      projectConfig['ios'] = {
        directory: join(projectPath, 'ios')
      }

      platforms['ios'] = {
        icon: { sources: [iconPath] },
        splash: { sources: [splashPath] }
      }
    }

    initTime = performance.now();

    return concat(
      createImage(
        iconImage,
        iconPath,
        ICON_SIZE,
        iconRatio,
        iconBg
      ),

      createImage(
        splashImage,
        splashPath,
        SPLASH_SIZE,
        splashRatio,
        splashBg
      ),
      defer(() => {
        console.log();
        console.log("About to run cordova-res:")
        console.log();

        return run({
          resourcesDirectory,
          copy: true,
          projectConfig,
          skipConfig: true,
          logstream: process.stdout, // Any WritableStream
          platforms
        } as Options);
      }),

      defer(() => {

        console.log();
        console.log('🗑 Deleting temp files');

        return promisify(rmdir)(resourcesDirectory, { recursive: true });
      })
    ).pipe(
      finalize(() => {
        console.log();
        console.log("🔳 Hands-free command:");
        console.log(`${commandLine}`);
        console.log();

        process.exit(0);
      }
      )
    )
  }
  )
).subscribe({

  complete: () => {
    console.log();
    console.log("🐳 All Good!", `[${Math.round(performance.now() - initTime)}ms]`);
    console.log();

  },
  error: (error) => {
    console.log();
    console.error("💀 Unable to continue: ", error);
    process.exit(1);
  }
});
