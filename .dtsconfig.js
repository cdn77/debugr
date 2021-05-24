const path = require('path');
const pkg = require(path.resolve('package.json'));

const importedLibraries = [
  '@debugr/core',
  '@debugr/graphql-formatter',
  '@debugr/http-formatter',
  '@debugr/sql-formatter',
  '@debugr/apollo',
  '@debugr/express',
  '@debugr/typeorm',
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
