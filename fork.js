const fs = require('node:fs')
const path = require('path');

process.on('message', (message) => {
	const restrictions_memory = message?.memory;
	const pathFiles = message?.pathFiles;

	if (!restrictions_memory || !pathFiles) {
		return process.exit();
	}

	const readStream = fs.createReadStream(pathFiles.inputFile, {highWaterMark: restrictions_memory.max_size_read});
	const writeStreams = {};

	function getFileName(word) {
		const firstLetter = word.charAt(0).toLowerCase();
		return `${firstLetter}.txt`
	}

	readStream.on('data', (chunk) => {
		const wordArray = chunk.toString().split(' ');
		wordArray.forEach((word) => {
			const fileName = getFileName(word);
			if (!writeStreams[fileName]) {
				const res = path.join(__dirname, 'results', fileName)
				writeStreams[fileName] = fs.createWriteStream(res, {
					flags: 'a',
					encoding: 'utf-8',
					highWaterMark: restrictions_memory.max_size_write
				})
			}
			writeStreams[fileName].write(` ${word}`)
		})
	})

	readStream.on('end', () => {
		for (const writeStream in writeStreams) {
			writeStreams[writeStream].destroy();
		}
		readStream.destroy();
		process.send('Сортировка файла закончено!');
		process.exit();
	});
});

// const init = [
//   'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
//   'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
// ];
// const initFileName = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
// const writeStream = init.map((filename) => fs.createWriteStream(path.join(__dirname, 'utils', filename), {highWaterMark: MEMORY}))
