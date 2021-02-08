import yargs from 'yargs';

export function getParams(): {
  $0: string,
  "iconImage": string,
  "iconBgcolor": string,
  "iconRatio": number,
  "splashImage": string,
  "splashBgcolor": string,
  "splashRatio": number,
  "projectPath": string,
  "android": boolean,
  "ios": boolean,
} {

  const _args = yargs(process.argv)
    .scriptName('cap-easy-resources')
    .usage('$0 [args]')
    .option('icon-image', {
      describe: 'icon image path',
      type: "string",
    })
    .option('icon-bgcolor', {
      describe: 'icon background color',
      type: "string"
    })
    .option('icon-ratio', {
      describe: 'icon size ratio',
      type: "number"
    })
    .option('splash-image', {
      describe: 'splash image path',
      type: "string"
    })
    .option('splash-bgcolor', {
      describe: 'splash background color',
      type: "string"
    })
    .option('splash-ratio', {
      describe: 'splash image size ratio',
      type: "number"
    })
    .option('p', {
      alias: 'project-path',
      describe: 'Capacitor project path',
      type: 'string'
    })
    .option('i', {
      alias: 'ios',
      describe: 'create ios resources',
      type: "boolean",
      default: false,
      nargs: 0
    })
    .option('a', {
      alias: 'android',
      describe: 'create android resources',
      type: 'boolean',
      default: false,
      nargs: 0
    })
  _args.help();
  return _args.argv as any;
}