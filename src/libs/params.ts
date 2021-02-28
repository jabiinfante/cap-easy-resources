import { isGradient } from '../interfaces/background';
import yargs from 'yargs';
import rgbHex from 'rgb-hex';

const SCRIPT_NAME = 'cap-easy-resources';

export function getParams(): {
  $0: string,
  'iconImage': string,
  'iconBgcolor': string,
  'iconBgGradColor1'?: string,
  'iconBgGradColor2'?: string,
  'iconBgGradAngle'?: string,
  'iconRatio': number,
  'splashImage': string,
  'splashBgcolor'?: string,
  'splashBgGradColor1'?: string,
  'splashBgGradColor2'?: string,
  'splashBgGradAngle'?: string,
  'splashRatio': number,
  'projectPath': string,
  'android': boolean,
  'ios': boolean,
} {

  const _args = yargs(process.argv)
    .scriptName(SCRIPT_NAME)
    .usage('$0 [args]')
    .option('icon-image', {
      describe: 'icon image path',
      type: 'string',
    })
    .option('icon-bgcolor', {
      describe: 'icon background solid color',
      type: 'string'
    })
    .option('icon-bg-grad-color1', {
      describe: 'icon background initial color for gradient',
      type: 'string',
      conflicts: ['icon-bgcolor']
    })
    .option('icon-bg-grad-color2', {
      describe: 'icon background final color for gradient',
      type: 'string',
      conflicts: ['icon-bgcolor']
    })
    .option('icon-bg-grad-angle', {
      describe: 'icon background angle for gradient',
      type: 'string',
      conflicts: ['icon-bgcolor']
    })
    .option('icon-ratio', {
      describe: 'icon size ratio',
      type: 'number'
    })
    .option('splash-image', {
      describe: 'splash image path',
      type: 'string'
    })
    .option('splash-bgcolor', {
      describe: 'splash background color',
      type: 'string',
      conflicts: ['splash-bg-grad-color1', 'splash-bg-grad-color2', 'splash-bg-grad-angle']
    })
    .option('splash-bg-grad-color1', {
      describe: 'splash background initial color for gradient',
      type: 'string',
      conflicts: ['splash-bgcolor']
    })
    .option('splash-bg-grad-color2', {
      describe: 'splash background final color for gradient',
      type: 'string',
      conflicts: ['splash-bgcolor']
    })
    .option('splash-bg-grad-angle', {
      describe: 'splash background angle for gradient',
      type: 'string',
      conflicts: ['splash-bgcolor']
    })
    .option('splash-ratio', {
      describe: 'splash image size ratio',
      type: 'number'
    })
    .option('p', {
      alias: 'project-path',
      describe: 'Capacitor project path',
      type: 'string'
    })
    .option('i', {
      alias: 'ios',
      describe: 'create ios resources',
      type: 'boolean',
      default: null
    })
    .option('a', {
      alias: 'android',
      describe: 'create android resources',
      type: 'boolean',
      default: null
    })
    .help()
    .check((argv) => {
      argv = checkBackgroundGradientParams(argv, 'icon');
      argv = checkBackgroundGradientParams(argv, 'splash');
      return argv;
    });
  return _args.argv as any;
}


function checkBackgroundGradientParams(argv, type) {

  const pseudoXOR = (!!argv[`${type}BgGradColor1`]? 1:0) + (!!argv[`${type}BgGradColor2`]? 1:0) + (!!argv[`${type}BgGradAngle`]? 1:0) ;

  if (pseudoXOR > 0 && pseudoXOR <3) {
    argv[`${type}BgGradColor1`] = null;
    argv[`${type}BgGradColor2`] = null;
    argv[`${type}BgGradAngle`] = null;
    console.warn(`⚠ Incomplete gradient values for ${type} background. Will be ignored.\n`);
  }
  return argv;
}

export function createCmd(iconImage, iconBg, iconRatio, splashImage, splashBg, splashRatio, projectPath, android, ios): string {

  const cmd = [];
  cmd.push(SCRIPT_NAME);
  cmd.push(`--project-path=${projectPath}`);

  cmd.push(`--icon-image=${iconImage}`);
  cmd.push(`--icon-ratio=${iconRatio}`);
  if (isGradient(iconBg)) {
    cmd.push(`--icon-bg-grad-color1=#${iconBg.color1}`);
    cmd.push(`--icon-bg-grad-color2=#${iconBg.color2}`);
    cmd.push(`--icon-bg-grad-angle=${iconBg.angle}`);
  } else {
    cmd.push(`--icon-bgcolor=#${rgbHex(`rgb(${Object.values(iconBg).join(', ')})`)}`);
  }
  
  cmd.push(`--splash-image=${splashImage}`);
  cmd.push(`--splash-ratio=${splashRatio}`);
  if (isGradient(splashBg)) {
    cmd.push(`--splash-bg-grad-color1=#${splashBg.color1}`);
    cmd.push(`--splash-bg-grad-color2=#${splashBg.color2}`);
    cmd.push(`--splash-bg-grad-angle=${splashBg.angle}`);
  } else {
    cmd.push(`--splash-bgcolor=#${rgbHex(`rgb(${Object.values(splashBg).join(', ')})`)}`);
  }

  cmd.push(`--ios=${ios}`);
  cmd.push(`--android=${android}`);
 
  return cmd.join(' ');

}