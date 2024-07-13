import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const logger = (meta, size, fileName) => {
  console.log({
    format: meta.format,
    width: meta.width,
    height: meta.height,
    size: formatBytes(meta.size || size),
    fileName
  });
}

const getFilesList = async (dir, fileList = []) => {
  const files = await fs.promises.readdir(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await fs.promises.stat(filePath);

    if (stat.isFile()) {
      fileList.push(filePath);
    } else {
      await getFilesList(filePath, fileList);
    }
  }

  return fileList;
}

const formatBytes = (sizeInBytes) => {
  if (sizeInBytes <= 0) return '0B';

  const units = [ 'B', 'KB', 'MB', 'GB', 'TB' ];

  const unitIndex = Math.floor(Math.log(sizeInBytes) / Math.log(1024));

  return (sizeInBytes / Math.pow(1024, unitIndex)).toFixed(2) + units[unitIndex];
}

(async (input, format, quality, width, height) => {
  if (!input) return;

  const filesList = await getFilesList(input);

  for (const filePath of filesList) {
    const { name, dir } = path.parse(filePath);

    await fs.promises.mkdir(dir.replace('input', 'output'), { recursive: true });
    const { size } = await fs.promises.stat(filePath);

    try {
      const meta = await sharp(filePath)
        .withMetadata()
        .metadata((_, meta) => logger(meta, size, name))
        .resize({ width, height })[format]({ quality })
        .toFile(`${ dir.replace('input', 'output') }/${ name }.${ format }`);

      logger(meta, meta.size, name);
    } catch (e) {
      console.error(e);
    }
  }
})('input', 'jpeg', 100, 320, undefined);
