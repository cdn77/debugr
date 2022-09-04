const path = require('path');
const pkg = require(path.resolve('package.json'));

const importedLibraries = [
  '@debugr/apollo',
  '@debugr/console-handler',
  '@debugr/core',
  '@debugr/elastic-handler',
  '@debugr/express',
  '@debugr/graphql-common',
  '@debugr/html-handler',
  '@debugr/http-common',
  '@debugr/insaner',
  '@debugr/mikroorm',
  '@debugr/slack-handler',
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
