import typescript from '@rollup/plugin-typescript';
import babel from '@rollup/plugin-babel';
import * as path from 'path';

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

export default [
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
