'use strict';

const Hapi = require('@hapi/hapi');

const init = async () => {
	const server = Hapi.server({
		port: process.env.PORT || 3000,
		host: 'localhost',
	});

	server.route({
		method: 'GET',
		path: '/',
		handler: () => {
			return {
				currentDate: new Date(),
			};
		},
	});

	await server.start();
	console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
	console.log(err);
	process.exit(1);
});

init();
