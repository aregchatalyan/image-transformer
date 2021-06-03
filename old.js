// const transform = (formatId, quality, width, height) => {
//     fs.readdir('input', (err, files) => {
//         for (let file of files) {
//             const filePath = path.join(__dirname, 'input', path.basename(file));
//             const fileName = path.parse(file).name;
//             const fileFormat = format[formatId];
//
//             fs.stat(filePath, (e, stat) => metadataSize = stat.size)
//
//             sharp(filePath)
//                 .metadata((e, meta) => console.info(fileName, 'Before', {format: meta.format}, {width: meta.width}, {height: meta.height}, {size: byte(metadataSize)}))
//                 .withMetadata()
//                 .resize({width, height})[fileFormat]({quality})
//                 .toFile(`output/${fileName}.${fileFormat}`)
//                 .then((info) => console.info(fileName, 'After', {format: info.format}, {width: info.width}, {height: info.height}, {size: byte(info.size)}))
//                 .catch((err) => console.error(err));
//         }
//     });
// }

// transform(2, 100, 459, null);
// transform(format_index, quality, width, height);