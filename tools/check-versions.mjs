#!/usr/bin/env node

import semver from 'semver';
import { scanPackages } from '../src/utils.mjs';

const packages = await scanPackages();

for (const { meta: pkg } of Object.values(packages)) {
  console.log(`Checking ${pkg.name} @ ${pkg.version}...`);

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

      const suffix = !semver.eq(packages[dep].meta.version, semver.minVersion(version)) ? ` (${packages[dep].meta.version})` : '';
      console.log(` - ${dep} @ ${version} ✓${suffix}`);
    }
  }
}
