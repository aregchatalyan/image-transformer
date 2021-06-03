const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const {readdir} = require('fs').promises;

let metadataSize, format = ['jpeg', 'png', 'webp', 'tiff', 'avif', 'heif'];

const byte = (bytes) => {
    if (bytes === 0) return '0';
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(1)) + ' ' + sizes[i];
}

async function* getFiles(dir) {
    const dirs = await readdir(dir, {withFileTypes: true});
    for (const d of dirs) {
        const res = path.resolve(dir, d.name);
        d.isDirectory() ? yield* getFiles(res) : yield res;
    }
}

(async (formatId, quality, width, height) => {
    for await (const filePath of getFiles('input')) {
        const fileFormat = format[formatId];
        const fileDir = path.parse(filePath).dir;
        const fileName = path.parse(filePath).name;

        fs.mkdirSync(`${fileDir.replace('input', 'output')}`, {recursive: true});
        fs.stat(filePath, (e, stat) => metadataSize = stat.size);

        sharp(filePath)
            .metadata((e, meta) => console.info({format: meta.format}, {width: meta.width}, {height: meta.height}, {size: byte(metadataSize)}, 'Before', fileName))
            .withMetadata()
            .resize({width, height})[fileFormat]({quality})
            .toFile(`${fileDir.replace('input', 'output')}/${fileName}.${fileFormat}`)
            .then((info) => console.info({format: info.format}, {width: info.width}, {height: info.height}, {size: byte(info.size)}, 'After', fileName))
            .catch((err) => console.error(err));
    }
})(2, 100, 3000, null); // on first launch, create input* and output* directories