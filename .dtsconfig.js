const path = require('path');
const pkg = require(path.resolve('package.json'));

const importedLibraries = [
  '@debugr/apollo',
  '@debugr/console',
  '@debugr/core',
  '@debugr/elastic',
  '@debugr/express',
  '@debugr/graphql-common',
  '@debugr/html',
  '@debugr/http-common',
  '@debugr/insaner',
  '@debugr/mikroorm',
  '@debugr/sentry',
  '@debugr/slack',
  '@debugr/sql-common',
];

if (pkg.build.externals) {
  importedLibraries.push(...pkg.build.externals);
}

module.exports = {
  compilationOptions: {
    followSymlinks: false
  },
  entries: [
    {
      filePath: path.resolve(pkg.build.src),
      outFile: path.resolve(pkg.types),
      libraries: {
        importedLibraries,
      },
      output: {
        inlineDeclareGlobals: true,
        inlineDeclareExternals: true
      }
    }
  ]
};
