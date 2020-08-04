const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const typescript = require('rollup-plugin-typescript');

function build() {
    const excludes = ['utils'];
    const srcPath = path.resolve(__dirname, '../src');

    fs.readdir(srcPath, (err, dirs) => {
        err || dirs.forEach(async dir => {
            if(!excludes.includes(dir)){
                const filePath = path.resolve(srcPath, dir, 'index.ts');
                const inputOptions = {
                    input: filePath,
                    plugins: [typescript()],
                };
                const outputOptions = {
                    file: `dist/umd/${dir}.development.js`,
                    name: `${dir}.development.js`,
                    format: 'umd',
                };
                (await rollup.rollup(inputOptions)).write(outputOptions);
            }
        });
    });

    fs.readdir(path.resolve(__dirname, '../test'), (err, files) => {
        err || files.forEach(async file => {
            const inputOptions = {
                input: path.resolve(__dirname, '../test/', file),
                plugins: [typescript()],
            };
            const outputOptions = {
                file: path.resolve(__dirname, '../dist/test/', file.replace(/\.ts$/, '.js')),
                name: file,
                format: 'umd',
            };
            (await rollup.rollup(inputOptions)).write(outputOptions);
        });
    });
}

build();
