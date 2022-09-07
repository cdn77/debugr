#!/usr/bin/env node

const semver = require('semver');
const { scanPackages } = require('../src/utils');

(async () => {
  const packages = await scanPackages();

  for (const { meta: pkg } of Object.values(packages)) {
    console.log(`Checking ${pkg.name}...`);

    for (const key of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
      if (!pkg[key]) {
        continue;
      }

      for (const [dep, version] of Object.entries(pkg[key])) {
        if (!/^@debugr\//.test(dep)) {
          continue;
        }

        if (!packages[dep]) {
          throw new Error(`${pkg.name} depends on nonexistent package ${dep}`);
        } else if (!semver.satisfies(packages[dep].meta.version, version)) {
          throw new Error(`${pkg.name} depends on invalid version ${version} of package ${dep}`);
        }
      }
    }
  }
})();
