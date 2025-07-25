#!/usr/bin/env node

/**
 * Module dependencies.
 */
import { createServer } from 'http';
import chalk from 'chalk';
const { PORT } = process.env;
import app from '../src/app.js';
/**
 * Normalize a port into a number, string, or false.
 */

const normalizePort = (val) => {
	const port = parseInt(val, 10);

	if (Number.isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
};

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(PORT || 4000);
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = createServer(app);

/**
 * Event listener for HTTP server "error" event.
 */

const onError = (error) => {
	if (error.syscall !== 'listen') {
		throw error;
	}

	const bind = typeof port === 'string' ? `Pipe ${port}` : `Port  ${port}`;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(`${bind} requires elevated privileges`);
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(`${bind} is already in use`);
			process.exit(1);
			break;
		default:
			throw error;
	}
};

/**
 * Event listener for HTTP server "listening" event.
 */
const onListening = () => {
	console.log(chalk.blueBright(`server listening on port ${port}`));
};

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
