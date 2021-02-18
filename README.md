# cap easy resources

A simple and intuitive cli tool designed for automatic generation of icon and splash screen for your hybrid **Capacitor** applications.

It's built on top of **[cordova-res](https://www.npmjs.com/package/cordova-res)**, and it only requires **one single image** for automatic generation of your app resouces.

![screencast](https://raw.githubusercontent.com/jabiinfante/cap-easy-resources/main/resources/sample.gif)


## Usage
cap-easy-resources can be use run fully unattended with params:
```
$ cap-easy-resources --help
cap-easy-resources [args]

Opciones:
      --version         Muestra número de versión                     [booleano]
      --icon-image      icon image path                   [cadena de caracteres]
      --icon-bgcolor    icon background color             [cadena de caracteres]
      --icon-ratio      icon size ratio                                 [número]
      --splash-image    splash image path                 [cadena de caracteres]
      --splash-bgcolor  splash background color           [cadena de caracteres]
      --splash-ratio    splash image size ratio                         [número]
  -p, --project-path    Capacitor project path            [cadena de caracteres]
  -i, --ios             create ios resources         [booleano] [defecto: false]
  -a, --android         create android resources     [booleano] [defecto: false]
      --help            Muestra ayuda                                 [booleano]

```
Or the tool it will prompt user for any missing parameters:

```
$ cap-easy-resources 
? Select capacitor project path .
? Enter icon image path batman.png
? Enter icon background color #fff00
? Enter icon size ratio 0.55
? Enter splash screen image path batman.png
? Enter splash screen background color #eee8aa
? Enter splash screen size ratio 0.45
? Build resources for android Yes
? Build resources for iOS Yes

About to run cordova-res:

Generated 24 resources for Android
Copied 31 resource items to Android
Generated 47 resources for iOS
Copied 21 resource items to iOS

🐳 All Good! [3552ms]
```


## Install
Just install the package globally on your sysmtem:
```bash
$ npm i -g cap-easy-resources
$ cap-easy-resources
```
Or use it with with **npx**:
```
npx cap-easy-resources
```

## External Links

- [https://github.com/ionic-team/cordova-res](https://github.com/ionic-team/cordova-res)
- [https://capacitorjs.com/docs/guides/splash-screens-and-icons](https://capacitorjs.com/docs/guides/splash-screens-and-icons)
