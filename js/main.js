
window.onload = function() {

	let ws = new WebSocket('ws://chat:8081');

	let chatContainerDOM = document.querySelector('.chat-container');
	let mainContainerDOM = document.querySelector('.main-container');

	let history;

	let loaderDOM = document.querySelector('.loader');

	isLockedDown = false;
	function lockDown() {
		mainContainerDOM.scrollTop = 9999999999;
		isLockedDown = true;
	}


	function appendMessages(arr) {
		arr.forEach(function(elem) {
			let nickname = elem.nickname;
			let text = elem.text;
			let date = elem.date;
			let id = elem.id;

			let newMessageDOM = document.createElement('div');
			newMessageDOM.className = 'message-container';

			newMessageDOM.innerHTML = `
				<span class="message-nickname">${nickname}</span><br>
				<span class="message-text">${text}</snan>
				<span class="message-date">${date}</span>
			`;

			chatContainerDOM.append(newMessageDOM)
		});
		if(isLockedDown) lockDown();
	}

	function prependNewMessages(arr) {
		// arr.forEach(function(elem) 
		for(let i = arr.length - 1; i >= 0; i = i - 1){
			console.log(i)
			let elem = arr[i];
			let nickname = elem.nickname;
			let text = elem.text;
			let date = elem.date;
			let id = elem.id;

			let newMessageDOM = document.createElement('div');
			newMessageDOM.className = 'message-container';

			newMessageDOM.innerHTML = `
				<span class="message-nickname">${nickname}</span><br>
				<span class="message-text">${text}</snan>
				<span class="message-date">${date}</span>
			`;

			chatContainerDOM.prepend(newMessageDOM)
		}


	}

	ws.onopen = function() {
		console.log('подключение совершено успешно');
	}

	ws.onmessage = function(message) {

		message = JSON.parse(message.data);
		if(message.type == 'on-connection-history') {
			history = message.data;
			console.log(history);
			appendMessages(history);
			lockDown();
			if(mainContainerDOM.scrollTop == 0) {
				loaderDOM.className = 'loader hidden-loader';
			}
		} else if(message.type == 'new-message') {
			appendMessages([message.data]);
			history.push(message.data);
		} else if(message.type == 'prepend-messages') {
			// console.log('сработало')
			let messages = message.data;
			// history.unshift(messages);
			// console.log(history);
			history = messages.concat(history);
			console.log(history);

			let h = mainContainerDOM.scrollHeight;
			prependNewMessages(messages);
			let h2 = mainContainerDOM.scrollHeight;
			mainContainerDOM.scrollTop = h2 - h;
		} else if(message.type == 'no-more-messages') {
			// loaderDOM.parentNode.removeChild(loaderDOM);
			loaderDOM.className = 'loader hidden-loader';
		}
	}

	let previousScrollTop = 0;
	mainContainerDOM.addEventListener('scroll', function(event) {
		// console.log(event.originalEvent.detail);
		if(previousScrollTop < this.scrollTop) {
			// крутим вниз
			console.log('крутим вниз');
			if(this.scrollTop + this.clientHeight == this.scrollHeight) {
				console.log('залочить');
				isLockedDown = true;
			}
		} else if(previousScrollTop > this.scrollTop) {
			isLockedDown = false;
			// крутим вверх
			console.log('крутим вверх')
			console.log(this.scrollTop)
			if(this.scrollTop == 0) {
				console.log(history);
				let query = {
					type : 'scrolled-top',
				 	data : history[0].id
				}
				ws.send(JSON.stringify(query));
			}
		} else {
			//стоим наместе
			console.log('крутим наместе')
		}

		previousScrollTop = this.scrollTop;
	});	

	document.addEventListener('keydown', function(event) {

		if(event.key == 'd') {
			console.log('попытка проскролить вниз')
			// lockDown();
		}

		if(event.key == 'Enter') {

			let nickname = document.querySelector('input.nickname').value;
			let text = document.querySelector('input.text').value;
			let textDOM = document.querySelector('input.text');
			let d = new Date();
			let time = d.toISOString().slice(0, 10).replaceAll('-', '.');
			time = time + ' ' + d.getHours() + ':' + d.getMinutes();

			nickname = nickname.trim();

			if(nickname.length > 40) {

			} else if(nickname == '') {

			} else if(text == '') { 

			} else if(text.length > 400) {

			} else {
				let message = {
					type : 'new-message',
					data : {
						nickname : nickname,
						text : text,
						date : time
					}
				}

				textDOM.value = '';

				ws.send(JSON.stringify(message));
				console.log('сообщение ' + message + ' отправлено');
			}
		}
	});
}

