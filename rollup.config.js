import typescript from '@rollup/plugin-typescript';
import babel from 'rollup-plugin-babel';
import * as path from 'path';

// eslint-disable-next-line import/no-dynamic-require
const pkg = require(path.resolve('package.json'));

const tsOpts = {
  tsconfig: `${__dirname}/tsconfig.json`,
};

const babelOpts = {
  babelrc: false,
  presets: [['@babel/preset-env', { targets: { node: '12' } }]],
};

export default [
  {
    input: pkg.build.src,

    plugins: [typescript(tsOpts), babel(babelOpts)],

    external: pkg.build.externals,

    output: {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
  },
  {
    input: pkg.build.src,

    plugins: [typescript(tsOpts)],

    external: pkg.build.externals,

    output: {
      file: pkg.module,
      format: 'esm',
      sourcemap: true,
    },
  },
];
