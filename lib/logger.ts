/**
 * Logger class replicating Sentry-like logging methods.
 */
type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

interface LogContext {
	[key: string]: any;
}

export class Logger {
	private static instance: Logger;
	private context: LogContext = {};

	private constructor() {}

	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	setContext(context: LogContext) {
		this.context = { ...this.context, ...context };
	}

	clearContext() {
		this.context = {};
	}

	captureMessage(message: string, level: LogLevel = "info", context?: LogContext) {
		this.log(level, message, context);
	}

	captureException(error: Error, context?: LogContext) {
		this.log("error", error.message, { ...context, stack: error.stack });
	}

	captureEvent(event: any, context?: LogContext) {
		this.log("info", "Event captured", { ...context, event });
	}

	debug(message: string, context?: LogContext) {
		this.log("debug", message, context);
	}

	info(message: string, context?: LogContext) {
		this.log("info", message, context);
	}

	warn(message: string, context?: LogContext) {
		this.log("warn", message, context);
	}

	error(message: string, context?: LogContext) {
		this.log("error", message, context);
	}

	fatal(message: string, context?: LogContext) {
		this.log("fatal", message, context);
	}

	private log(level: LogLevel, message: string, context?: LogContext) {
		const logEntry = {
			level,
			message,
			timestamp: new Date().toISOString(),
			...this.context,
			...context,
		};
		// Replace with integration to Sentry or other logging service if needed
		// For now, just log to console
		switch (level) {
			case "debug":
				console.debug(logEntry);
				break;
			case "info":
				console.info(logEntry);
				break;
			case "warn":
				console.warn(logEntry);
				break;
			case "error":
			case "fatal":
				console.error(logEntry);
				break;
			default:
				console.log(logEntry);
		}
	}
}

export default Logger.getInstance();
