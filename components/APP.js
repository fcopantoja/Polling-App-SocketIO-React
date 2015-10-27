var React = require('react');
var Router = require('react-router');
var RouteHandler = Router.RouteHandler;

var io = require('socket.io-client');
var Header = require('./Header');


var APP = React.createClass({
	getInitialState() {
		return {
			status: 'disconnected',
			title: '',
			member: {},
			audience: []
		}
	},

	componentWillMount() {
		this.socket = io('http://localhost:4000');
		this.socket.on('connect', this.connect);
		this.socket.on('disconnect', this.disconnect);
		this.socket.on('welcome', this.welcome);
		this.socket.on('joined', this.joined);
		this.socket.on('audience', this.updateAudience);
	},
	
	connect() {

		var member = (sessionStorage.member) ? JSON.parse(sessionStorage.member) : null;

		if(member) {
			this.emit('join', member);
		}

		this.setState({ status:'connected' });
	},

	disconnect() {
		this.setState({ status:'disconnected' });
	},

	welcome(serverState) {
		this.setState({title: serverState.title});
	},

	emit(eventName, payload) {
		this.socket.emit(eventName, payload);
	},

	joined(member) {
		this.setState({member: member});
		sessionStorage.member = JSON.stringify(member);
	},

	updateAudience(newAudience) {
		this.setState({audience: newAudience});
	},
	
	render () {
		return (
			<div>
				<Header title={this.state.title} status={this.state.status}/>
				<RouteHandler {... this.state} emit={this.emit} />
			</div>
		);
	}
})

module.exports = APP;