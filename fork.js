const fs = require('node:fs')
const path = require('path');

process.on('message', (message) => {
	const init = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
	const MEMORY = +process.execArgv[0].split('=')[1];

	const readStream = fs.createReadStream('text.txt', {highWaterMark: MEMORY})
	const writeStream = init.map((filename) => fs.createWriteStream(path.join(__dirname, 'utils', filename), {highWaterMark: MEMORY}))

	readStream.on('data', (chunk) => {
		const stringArray = chunk.toString().split(' ');
		stringArray.forEach((item) => {
			const word = item.at(0).toUpperCase();
			fs.writeFile(`./utils/${word}.txt`, item, console.log)
		})
	})

	readStream.on('end', () => {
		process.send('Hehehehheh!');
	});
});