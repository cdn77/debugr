const path = require('path');
const pkg = require(path.resolve('package.json'));

module.exports = {
  compilationOptions: {
    followSymlinks: false
  },
  entries: [
    {
      filePath: path.resolve(pkg.build.src),
      outFile: path.resolve(pkg.types),
      libraries: {
        importedLibraries: pkg.build.externals,
      },
      output: {
        inlineDeclareGlobals: true,
        inlineDeclareExternals: true
      }
    }
  ]
};
