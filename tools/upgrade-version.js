#!/usr/bin/env node

const { writeFile } = require('fs/promises');
const { resolve } = require('path');
const semver = require('semver');
const { scanPackages } = require('../src/utils');

function printUsage() {
  console.log(`Usage: ${process.argv[1]} <package> <major|minor|patch|premajor|preminor|prepatch|prerelease>`);
  process.exit(1);
}

if (process.argv.length < 4) {
  printUsage();
}

const target = /^@debugr\//.test(process.argv[2]) ? process.argv[2] : `@debugr/${process.argv[2]}`;
const type = process.argv[3];

if (!/^(major|minor|patch|premajor|preminor|prepatch|prerelease)$/.test(type)) {
  printUsage();
}

(async () => {
  const packages = await scanPackages();

  if (!packages[target]) {
    console.log(`Error: package ${target} doesn't exist`);
    process.exit(1);
  }

  const current = packages[target].meta.version;
  const next = semver.inc(current, type);
  console.log(`Bumping ${target} from ${current} to ${next}`);
  packages[target].meta.version = next;
  await writeFile(resolve(packages[target].path, 'package.json'), JSON.stringify(packages[target].meta, null, 2));

  for (const pkg of Object.values(packages)) {
    for (const key of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      if (pkg.meta[key] && pkg.meta[key][target]) {
        console.log(`Updating ${pkg.meta.name} ${key} to match`);
        pkg.meta[key][target] = `^${next}`;
        await writeFile(resolve(pkg.path, 'package.json'), JSON.stringify(pkg.meta, null, 2));
      }
    }
  }
})();
