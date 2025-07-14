import { toast } from "sonner-native";

/**
 * Logger class replicating Sentry-like logging methods.
 */
type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

export class Logger {
	private static instance: Logger;
	private context: any = {};

	private constructor() {}

	static getInstance(): Logger {
		if (!Logger.instance) {
			Logger.instance = new Logger();
		}
		return Logger.instance;
	}

	setContext(context: any) {
		this.context = { ...this.context, ...context };
	}

	clearContext() {
		this.context = {};
	}

	captureMessage(message: string, level: LogLevel = "info", context?: any) {
		this.log(level, message, context);
	}

	captureException(error: Error, context?: any) {
		this.log("error", error.message, { ...context, stack: error.stack });
	}

	captureEvent(event: any, context?: any) {
		this.log("info", "Event captured", { ...context, event });
	}

	debug(message: string, context?: any) {
		this.log("debug", message, context);
	}

	info(message: string, context?: any) {
		this.log("info", message, context);
	}

	warn(message: string, context?: any) {
		this.log("warn", message, context);
	}

	error(message: string, context?: any) {
		this.log("error", message, context);
	}

	fatal(message: string, context?: any) {
		this.log("fatal", message, context);
	}

	private log(level: LogLevel, message: string, context?: any) {
		const logEntry = {
			level,
			message,
			timestamp: new Date().toISOString(),
			context: context,
			...this.context,
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
				toast.error(logEntry.message, {
					description: logEntry.context?.stack || "An error occurred",
				});
				console.error(logEntry);
				break;
			default:
				console.log(logEntry);
		}
	}
}

export default Logger.getInstance();
