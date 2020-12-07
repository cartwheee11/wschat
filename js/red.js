let fs = require('fs');

let history = fs.readFileSync('history.json', 'utf-8');
history = JSON.parse(history);

let i = 0;
history.forEach(function(elem) {
	elem.id = i;
	i++;
});

console.log(history);

history = JSON.stringify(history);
fs.writeFileSync('history.json', history);