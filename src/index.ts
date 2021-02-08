import { Options, run } from 'cordova-res';
import { existsSync, mkdtemp, rmdir } from 'fs';
import { tmpdir } from 'os';
import { join, sep } from 'path';
import { performance } from 'perf_hooks';
import { concat, defer, iif, of } from 'rxjs';
import { map, switchMap, tap, toArray } from 'rxjs/operators';
import { promisify } from 'util';
import { createImage } from './libs/images';
import { getParams } from './libs/params';
import { askForColor, askForConfirmation, askForPath, askForRatio } from './libs/prompts';

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
          tap(x => console.log(`🔹 Project Path set: ${x}`))
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
        () => !params['iconBgcolor'],
        askForColor('Enter icon background color'),
        of(params['iconBgcolor']).pipe(
          tap(x => console.log(`🔹 Icon background color set: ${x}`))
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
        () => !params['splashBgcolor'],
        askForColor('Enter splash screen background color'),
        of(params['splashBgcolor']).pipe(
          tap(p => console.log(`🔹 Splash background color set: ${p}`))
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
        () => !params['android'],
        askForConfirmation('Build resources for android'),
        of(params['android']).pipe(
          tap(p => console.log(`🔹 Building resources for android: ${p ? '👍' : '👎'}`))
        )
      ),
      iif(
        () => !params['ios'],
        askForConfirmation('Build resources for iOS'),
        of(params['ios']).pipe(
          tap(p => console.log(`🔹 Building resources for ios: ${p ? '👍' : '👎'}`))
        )
      ),
      defer(() => promisify(mkdtemp)(`${tmpdir()}${sep}capResources`))
    )
  ),
  toArray<any>(),
  map(([projectPath, iconImage, iconBgColor, iconRatio, splashImage, splashBgColor, splashRatio, android, ios, resourcesDirectory]) => {

    if (android && !existsSync(join(projectPath, 'android'))) {
      console.warn('🔴 No android platform folder found. (skipping)');
      android = false;
    }

    if (ios && !existsSync(join(projectPath, 'ios'))) {
      console.warn('🔴 No ios platform folder found. (skipping)');
      ios = false;
    }

    if (!android && !ios) {
      throw 'No platform selected. nothing to do.';
    }

    return {
      iconImage, iconBgColor, iconRatio, splashImage, splashBgColor, splashRatio, projectPath, android, ios, resourcesDirectory
    }
  }),
  switchMap(({ iconImage, iconBgColor, iconRatio, splashImage, splashBgColor, splashRatio, projectPath, android, ios, resourcesDirectory }) => {

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
        iconBgColor
      ),

      createImage(
        splashImage,
        splashPath,
        SPLASH_SIZE,
        splashRatio,
        splashBgColor
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

      defer(() => promisify(rmdir)(resourcesDirectory, { recursive: true }))

    )
  }
  )
).subscribe({

  complete: () => {
    console.log();
    console.log("🐳 All Good!", `[${Math.round(performance.now() - initTime)}ms]`);
    console.log();
    process.exit(0);
  },
  error: (error) => {
    console.log();
    console.error("💀 Unable to continue: ", error);
    process.exit(1);
  }
});
