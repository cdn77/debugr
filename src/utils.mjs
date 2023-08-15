import { readdir, readFile } from 'fs/promises';
import { resolve, relative } from 'path';

export async function scanPackages() {
  const rootDir = new URL('..', import.meta.url).pathname;
  const packagesDir = resolve(rootDir, 'packages');
  const packages = {};

  for (const file of await readdir(packagesDir, { withFileTypes: true })) {
    if (!file.isDirectory()) {
      continue;
    }

    const path = resolve(packagesDir, file.name);

    try {
      const meta = JSON.parse(await readFile(resolve(path, 'package.json'), 'utf-8'));
      packages[meta.name] = { path, meta };
    } catch (e) {
      console.log(`Warning: unable to read package.json in ${relative(rootDir, path)}`)
    }
  }

  return packages;
}
