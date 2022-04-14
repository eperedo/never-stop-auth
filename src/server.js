'use strict';

const Hapi = require('@hapi/hapi');
const getStudentInformation = require('./platzi/student');

const init = async () => {
	const server = Hapi.server({
		port: process.env.PORT || 3000,
		host: 'localhost',
	});

	server.route({
		method: 'GET',
		path: '/',
		handler: async () => {
			return {
				currentDate: new Date(),
			};
		},
	});

	server.route({
		method: 'GET',
		path: '/students/{username}',
		handler: async (request) => {
			const { username } = request.params;
			let result = {};
			try {
				result = await getStudentInformation(username);
			} catch (error) {
				result.error = error.message;
			}
			return {
				...result,
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
