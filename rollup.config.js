const typescript = require('@rollup/plugin-typescript');
const babel = require('@rollup/plugin-babel');
const path = require('path');

// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path.resolve('package.json'));

const tsOpts = {
  tsconfig: `${__dirname}/tsconfig.json`,
};

const babelOpts = {
  babelrc: false,
  presets: [['@babel/preset-env', { targets: { node: '12' } }]],
  plugins: ['@babel/plugin-transform-runtime'],
  babelHelpers: 'runtime',
};

const external = [/@babel\/runtime/, /@debugr\//];

if (pkg.build.externals) {
  external.push(...pkg.build.externals);
}

module.exports = [
  {
    input: pkg.build.src,

    plugins: [typescript(tsOpts), babel(babelOpts)],

    external,

    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
  },
  {
    input: pkg.build.src,

    plugins: [typescript(tsOpts)],

    external,

    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
  },
];
