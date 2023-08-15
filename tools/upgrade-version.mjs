#!/usr/bin/env node

import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { resolve } from 'path';
import semver from 'semver';
import { parseArgs } from 'util';
import { scanPackages } from '../src/utils.mjs';

function printUsage() {
  console.log(`Usage: ${process.argv[1]} [--dry-run|-d] <packages> <major|minor|patch|premajor|preminor|prepatch|prerelease>`);
  process.exit(1);
}

const argv = parseArgs({
  options: {
    'dry-run': {
      short: 'd',
      type: 'boolean',
      default: false,
    },
  },
  strict: true,
  allowPositionals: true,
});

if (argv.positionals.length < 2) {
  printUsage();
}

const targetPattern = argv.positionals[0]
    .replace(/^@debugr\//, '')
    .replace(/[/\-\\^$*+?.()|[\]{}]/g, '\\$&')
    .replace(/\\\*/g, '.*')
    .replace(/,/g, '|');

const type = argv.positionals[1];
const dry = argv.values['dry-run'];

if (!/^(major|minor|patch|premajor|preminor|prepatch|prerelease)$/.test(type)) {
  printUsage();
}

const packages = await scanPackages();
const pattern = new RegExp(`^@debugr/(?:${targetPattern})$`);
const targets = Object.entries(packages).filter(([name]) => pattern.test(name));

if (!targets.length) {
  console.log(`Error: package specifier '${argv.positionals[0]}' doesn't match any packages`);
  process.exit(1);
}

if (dry) {
  console.log('Dry run - nothing will be written to disk.');
}

for (const [name, info] of targets) {
  const current = info.meta.version;
  const next = semver.inc(current, type);
  console.log(`Bumping ${name} from ${current} to ${next}`);
  info.meta.version = next;

  if (!dry) {
    await writeFile(resolve(info.path, 'package.json'), JSON.stringify(info.meta, null, 2));
  }

  for (const pkg of Object.values(packages)) {
    for (const key of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      if (pkg.meta[key] && pkg.meta[key][name]) {
        console.log(`  Updating ${pkg.meta.name} ${key} to match`);
        pkg.meta[key][name] = `^${next}`;

        if (!dry) {
          await writeFile(resolve(pkg.path, 'package.json'), JSON.stringify(pkg.meta, null, 2));
        }
      }
    }
  }
}

if (!dry) {
  console.log('Updating package-lock.json...');

  await new Promise((resolve, reject) => {
    exec('npm install --package-lock-only', { encoding: 'utf-8' }, (err, stdout, stderr) => {
      if (err) {
        console.log('Failed to update package-lock.json:');
        console.log(stdout || stderr);
        reject();
      } else {
        resolve();
      }
    });
  });
}
