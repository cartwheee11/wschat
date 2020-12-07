
let fs = require('fs');
let ws = require('ws');
console.log('привет, как дела?');

let history = [];

function updateHistory() {
	let file = fs.readFileSync('history.json', 'utf-8')
	history = JSON.parse(file);
}

updateHistory();

let clients = new Set();

let server = new ws.Server({port : 8081});

function handleMessage(message, ws) {
	message = JSON.parse(message);
	console.log(message)
	if(message.type == 'new-message') {
		// console.log('сработало');
		updateHistory();
		let id = history.length;
		message.data.id = id;
		history.push(message.data);
		fs.writeFileSync('history.json', JSON.stringify(history));
		for(let client of clients) {
			let query = {
				type : 'new-message',
				data : message.data
			}

			client.send(JSON.stringify(query));
		}
	} else if(message.type == 'scrolled-top') {
		let messages = [];
		let id = message.data;
		let num = 10;
		
		let okypay = JSON;
		if(id < num) {
			messages = history.slice(0, id);
			ws.send(okypay.stringify({
				type : 'no-more-messages'
			}));
		} else {
			messages = history.slice(id - num, id);	
		}
		console.log(messages);
			
		
		let query = {
			type : 'prepend-messages',
			data : messages
		}

		ws.send(JSON.stringify(query));
	}
}

server.on('connection', function(ws) {
	console.log('к нам подключился новый клиент');
	clients.add(ws);
	updateHistory();
	let onConnectionHistory = history.slice(history.length - 10);
	let message = {
		type : 'on-connection-history',
		data : onConnectionHistory
	};
	ws.send(JSON.stringify(message));

	ws.on('message', function(message) {
		handleMessage(message, ws);
	})

});

server.on('close', function(ws) {

	clints.delete(ws);
	console.log("пользователь отключился");
});


