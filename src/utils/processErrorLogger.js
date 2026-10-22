function registerProcessErrorHandlers() {

  process.on("uncaughtExceptionMonitor", (error, origin) => {
    console.error("[UNCAUGHT EXCEPTION]", {
      origin,
      message: error?.message,
      stack: error?.stack,
    });
  });

  process.on("unhandledRejection", (reason) => {
    console.error("[UNHANDLED REJECTION]", reason);
  });
}
registerProcessErrorHandlers();
