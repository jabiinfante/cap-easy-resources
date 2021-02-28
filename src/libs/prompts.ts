import chalkPipe from 'chalk-pipe';
import hexRgb from 'hex-rgb';
import * as inquirer from 'inquirer';
import * as fuzzyPath from 'inquirer-fuzzy-path';
import { resolve } from 'path';
import { defer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Gradient, SolidBackground } from '../interfaces/background';

inquirer.registerPrompt('fuzzypath', fuzzyPath);

export function askForPath(message: string, itemType: 'file' | 'directory' = 'file', opts: { [index: string]: unknown } = {}): Observable<string> {
  return defer(() =>
    inquirer.prompt([{
      type: 'fuzzypath',
      name: 'path',
      excludePath: nodePath => nodePath.startsWith('node_modules'),
      excludeFilter: nodePath => nodePath.match(/^\.(.+)|\/\./),
      itemType,
      message,
      suggestOnly: false,
      depthLimit: 7,
      ...opts
    }])
  ).pipe(
    map(({ path }) => resolve(path))
  );
}

export function askForColor(message: string): Observable<SolidBackground> {
  return defer(() =>
    inquirer.prompt([_getColorPrompt(message, 'color')])
  ).pipe(
    map(({ color }) => {
      const { red: r, green: g, blue: b } = hexRgb(color);
      return { r, g, b };
    })
  );
}

export function askForRatio(message: string, opts: { [index: string]: unknown } = {}): Observable<string> {
  return defer(() =>
    inquirer.prompt([{
      type: 'number',
      name: 'ratio',
      message,
      transformer: function (ratio) {
        return ratio > 1 ? ratio / 100 : ratio;
      },
      ...opts
    }])
  ).pipe(
    map(({ ratio }) => ratio > 1 ? ratio / 100 : ratio)
  );
}

export function askForConfirmation(message: string, opts: { [index: string]: unknown } = {}): Observable<boolean> {
  return defer(() =>
    inquirer.prompt([{
      message,
      type: 'confirm',
      name: 'confirmation',
      ...opts
    }])
  ).pipe(
    map(({ confirmation }) => !!confirmation)
  );
}

export function askForList(message: string, choices: Array<string>): Observable<string> {
  return defer(() =>
    inquirer.prompt([{
      message,
      type: 'list',
      name: 'choice',
      choices
    }])
  ).pipe(
    map(({ choice }) => choice)
  );
}

export function askForGradient(message: string): Observable<Gradient> {
  return defer(() =>
    inquirer.prompt([
      _getColorPrompt(`${message} (color1)`, 'color1'),
      _getColorPrompt(`${message} (color2)`, 'color2'),
      {
        type: 'number',
        name: 'angle',
        message: `${message} (angle)`,
        transformer: function (ratio) {
          return ratio >= 0 
            ? ratio > 360 ? 360 : ratio
            : ratio < -360 ? -360 : ratio;
        }
      }
    ])
  ).pipe(
    map(({ color1, color2, angle}) => ({color1, color2, angle}))
  );
}


function _getColorPrompt(message: string, name: string): { [index: string]: unknown } {
  return {
    type: 'string',
    message,
    name,
    transformer: function (color) {
      color = color[0] !== '#' ? `#${color}` : color;
      return chalkPipe(color)(color);
    },
    validate: function (color) {
      return !!hexRgb(color);
    }
  };
}