const {fork} = require('child_process');
const path = require("path");
const MAX_MEMORY_SIZE = 500 * 1024 * 1024; // кол-во ОЗУ которую мы выделили для fork ;)
const MAX_MEMORY_SIZE_READ = MAX_MEMORY_SIZE;
const MAX_MEMORY_SIZE_WRITE = 15 * 1024 * 1024;

const child = fork('fork.js', []);

child.on('message', (message) => {
	console.log('Message from child:', message);
});

child.send({
	memory: {
		max_size: MAX_MEMORY_SIZE,
		max_size_read: MAX_MEMORY_SIZE_READ,
		max_size_write: MAX_MEMORY_SIZE_WRITE,
	},
	pathFiles: {
		inputFile: path.join(__dirname, 'text.txt'),
		outputFile: path.join(__dirname, 'res.txt'),
		pathTemporaryFolder: path.join(__dirname, 'results')
	}
});

// // Условие:
// // Имеется файл размером 1 тб, состоящий из строк.
//
// // Задача:
// // Нужно написать программу, которая сможет отсортировать этот файл на машине, которой
// // доступно 500мб ОЗУ.
