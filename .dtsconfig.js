const path = require('path');
const pkg = require(path.resolve('package.json'));

const importedLibraries = [
  '@debugr/core',
  '@debugr/graphql-console-formatter',
  '@debugr/graphql-html-formatter',
  '@debugr/http-console-formatter',
  '@debugr/http-html-formatter',
  '@debugr/sql-console-formatter',
  '@debugr/sql-html-formatter',
  '@debugr/apollo',
  '@debugr/express',
  '@debugr/insaner',
  '@debugr/typeorm',
  '@debugr/elastic-handler',
  '@debugr/html-handler',
  '@debugr/console-handler',
  '@debugr/slack-handler',
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
