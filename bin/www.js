 
import { createServer } from "http";
import chalk from "chalk";
import { performance } from "node:perf_hooks";

import app, { initializeApp } from "../src/app.js";

const startupStart = performance.now();

const normalizePort = (value) => {
    const port = Number.parseInt(value, 10);

    if (Number.isNaN(port)) {
        return value;
    }

    if (port >= 0) {
        return port;
    }

    return false;
};

const port = normalizePort(process.env.PORT || "4000");

app.set("port", port);

const server = createServer(app);

const onError = (error) => {
    if (error.syscall !== "listen") {
        throw error;
    }

    const bind =
        typeof port === "string"
            ? `Pipe ${port}`
            : `Port ${port}`;

    switch (error.code) {
        case "EACCES":
            console.error(`${bind} requires elevated privileges`);
            process.exit(1);
            break;

        case "EADDRINUSE":
            console.error(`${bind} is already in use`);
            process.exit(1);
            break;

        default:
            throw error;
    }
};

server.on("error", onError);

server.on("listening", () => {
    console.log(
        chalk.blueBright(`Server listening on port ${port}`)
    );

    console.log(
        `Total startup time: ${(performance.now() - startupStart).toFixed(2)} ms`
    );
	async function initializeWorkers() {
		if (process.env.NODE_ENV === "development") {
		// await new Promise((resolve) => setTimeout(resolve, 30_000));
		console.log("Starting workers...");

		const { startAirwallexPaymentIntentWorker } = await import(
			"../src/workers/airwallexPaymentIntent.worker.js"
		);
		startAirwallexPaymentIntentWorker();

		const { walletTransactionsUpdateWorker } = await import(
			"../src/workers/airWallexWalletUpdateWorker.js"
		);
		walletTransactionsUpdateWorker();

		const { startAirWallexRefundWorker } = await import(
			"../src/workers/airWallexRefundWorker.js"
		);
		startAirWallexRefundWorker();

		const { startPushNotificationWorker } = await import(
			"../src/workers/pushNotification.worker.js"
		);
		startPushNotificationWorker();
	}
} 
    // initializeWorkers();
});

async function startServer() {
    try {
        console.log("Starting application...");
        console.log("Node.js version:", process.version);

        const initStart = performance.now();

        await initializeApp();

        console.log(
            `Application initialization completed in ${(performance.now() - initStart).toFixed(2)} ms`
        );

        server.listen(port, "127.0.0.1");
    } catch (error) {
        console.error("Failed to initialize application:", error);

        process.exitCode = 1;
    }
}

startServer();
 