const { fork } = require('child_process');
const MAX_MEMORY_SIZE = 500 * 1024 * 1024; // кол-во ОЗУ которую мы выделили для fork ;)

const child = fork('fork.js', [], {
	execArgv: [`--max-old-space-size=${MAX_MEMORY_SIZE}`] // ограничиваем до 500 mb
});

child.on('message', (message) => {
	console.log('Message from child:', message);
});

child.send('Hello from parent!');

// // Условие:
// // Имеется файл размером 1 тб, состоящий из строк.
//
// // Задача:
// // Нужно написать программу, которая сможет отсортировать этот файл на машине, которой
// // доступно 500мб ОЗУ.
