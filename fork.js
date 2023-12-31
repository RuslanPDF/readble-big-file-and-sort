const fs = require('node:fs')
const path = require('path');
const EventEmitter = require('events')
const myEmitter = new EventEmitter()

process.on('message', (message) => {
	const restrictions_memory = message?.memory;
	const pathFiles = message?.pathFiles;

	// проверка не пустая ли переменная
	if (!restrictions_memory || !pathFiles) {
		return process.exit();
	}

	const readStream = fs.createReadStream(pathFiles.inputFile, {highWaterMark: restrictions_memory.max_size_read});
	// в объекте будем хранить createWriteStream
	// example - {
	//    "a.txt": createWriteStream
	// }
	const writeStreams = {};

	// получение имя файла
	function getFileName(word) {
		const firstLetter = word.charAt(0).toLowerCase();
		return `${firstLetter}.txt`
	}

	readStream.on('data', (chunk) => {
		// с Buffer я перевожу в читабельный вид и пробразую в массив
		// ['word', 'apple', 'банан']
		const wordArray = chunk.toString().split(' ');
		wordArray.forEach((word) => {
			// a.txt , b.txt
			const fileName = getFileName(word);
			// проверка есть ли в объекте такой стрим
			if (!writeStreams[fileName]) {
				writeStreams[fileName] = fs.createWriteStream(path.join(message.pathFiles.pathTemporaryFolder, fileName), {
					flags: 'a',
					encoding: 'utf-8',
					highWaterMark: restrictions_memory.max_size_write
				})
			}
			// вызываем стрим и записываем слово в файл
			// a.txt = apple
			writeStreams[fileName].write(` ${word}`)
		})
	})

	readStream.on('end', () => {
		for (const writeStream in writeStreams) {
			writeStreams[writeStream].destroy();
		}
		readStream.destroy();
		process.send('Успешно создали временные файлы!');
		myEmitter.emit('merge', message)
	});
});

myEmitter.on('merge', async (message) => {
	try {
		await readFileAndMerge(message);
		process.send('Финальный этап закончен!')
	}catch (e) {
		console.error(e)
	}finally {
		process.exit()
	}
})

async function readFileAndMerge(message) {
	return new Promise((resolve, reject) => {
		fs.readdir(message.pathFiles.pathTemporaryFolder, async (err, files) => {
			if (err) {
				console.error(err)
				reject(err)
			}

			const writeStream = fs.createWriteStream(message.pathFiles.outputFile, {
				flags: 'a',
				encoding: 'utf-8',
				highWaterMark: message.memory.max_size
			})
			// и хотя я получаю файлы в упорядочном виде благодаря windows 10 но я не знаю как поведет получение данных в других операционых системах и сортирую
			const sortedFiles = files.sort()

			for (const sortedFile of sortedFiles) {
				// получаем путь к файлу
				const filePath = path.join(message.pathFiles.pathTemporaryFolder, sortedFile)

				try {
					// читаем и записываем данные в файл res.txt
					await readAndWriteFile(filePath, writeStream, message.memory.max_size_read)
				}catch (e) {
					console.log(e)
				}
			}

			writeStream.end(() => {
				console.log('Запись завершена.');
				resolve();
			});
		})
	})
}

function readAndWriteFile(filePath, writeStream, highWaterMark){
	return new Promise((resolve, reject) => {
		const readStream = fs.createReadStream(filePath, {highWaterMark}
		)
		readStream.on("data", (chunk) => {
			console.log(chunk)
			// читаем и записываем чанк
			writeStream.write(chunk);
		})
		readStream.on('end', () => {
			readStream.destroy()
			resolve()
		})
		readStream.on('error', (err) => {
			console.error(err)
			readStream.destroy();
			reject(err)
		})
	})
}