const path = require('path');
const sharp = require('sharp');
const {readdir, mkdir, stat} = require('fs').promises;
const {error, info, log} = console;

let metadataSize;
const format = ['jpeg', 'png', 'webp', 'tiff', 'avif', 'heif'];

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

const logs = (e, meta, fileName) => {
  meta
    ? info({format: meta.format}, {width: meta.width}, {height: meta.height}, {size: byte(metadataSize)}, 'Before', fileName)
    : log('Meta empty');
}

(async (formatId, quality, width, height) => {
  for await (const filePath of getFiles('input')) {
    const fileFormat = format[formatId];
    const fileDir = path.parse(filePath).dir;
    const fileName = path.parse(filePath).name;

    await mkdir(`${fileDir.replace('input', 'output')}`, {recursive: true});
    const {size} = await stat(filePath);
    if (size) metadataSize = size;

    await sharp(filePath)
      .withMetadata()
      .metadata((e, meta) => logs(e, meta, fileName))
      .resize({width, height})[fileFormat]({quality})
      .toFile(`${fileDir.replace('input', 'output')}/${fileName}.${fileFormat}`)
      .then((inf) => info({format: inf.format}, {width: inf.width}, {height: inf.height}, {size: byte(inf.size)}, 'After', fileName))
      .catch((err) => error(err));
  }
})(2, 100, 3840, null); // on first launch, create input* and output* directories