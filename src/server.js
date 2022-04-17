'use strict';
if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

const Hapi = require('@hapi/hapi');
const getForumQuestion = require('./platzi/forum');
const getRankingInformation = require('./platzi/ranking');
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

	server.route({
		method: 'GET',
		path: '/ranking',
		handler: async (request) => {
			let result = {};
			if (process.env.RANKING_PWD === request.headers['x-platzi-token']) {
				try {
					result = await getRankingInformation();
				} catch (error) {
					result.error = error.message;
				}
				return {
					...result,
				};
			}
			return {
				message: 'nice try, but nope',
			};
		},
	});

	server.route({
		method: 'GET',
		path: '/forum-help',
		handler: async (request) => {
			if (process.env.RANKING_PWD === request.headers['x-platzi-token']) {
				let result = {};
				try {
					result = await getForumQuestion();
				} catch (error) {
					result.error = error.message;
				}
				return {
					...result,
				};
			}
			return {
				message: 'nice try, but nope',
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
