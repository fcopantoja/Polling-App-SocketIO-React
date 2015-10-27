var express = require('express');
var _ = require('underscore');
var app = express();

var connections = [];
var title = 'Untitled Presentation';
var audience = [];
var speaker = {};

app.use(express.static('./public'));
app.use(express.static('./node_modules/bootstrap/dist'));

var server = app.listen(4000);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket) {
	
	socket.once('disconnect', function() {
		var member = _.findWhere(audience, { id: this.id });

		if(member) {
			audience.splice(audience.indexOf(member), 1);
			io.sockets.emit('audience', audience);
			console.log('Left: %s (% audience members)', member.name, audience.length);
		}

		connections.splice(connections.indexOf(socket), 1);
		socket.disconnect();
		console.log('Disconnected: %s sockets remaining', connections.length);
	});

	socket.on('start', function(payload) {
		speaker.name = payload.name;
		speaker.id = this.id; 
		speaker.type = 'speaker';
		this.emit('joined', speaker);
		console.log('Presentation started: "%s", by %s', payload.title, payload.name);

	})

	socket.emit('welcome', {
		title: title
	});

	socket.on('join', function(payload) {
		console.log('Audience joined: %s', payload.name);
		var newMember = {
			id: this.id,
			name: payload.name,
			type: 'member'
		};		
		audience.push(newMember);

		io.sockets.emit('audience', audience);
		this.emit('joined', newMember);
	});




	connections.push(socket);
	console.log("Connected: %s sockets connected", connections.length)
	


});



console.log('Polling server running, localhost:4000')