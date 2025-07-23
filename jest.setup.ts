// Mock the entire logger module to avoid React Native dependencies
jest.mock("./lib/logger", () => ({
	__esModule: true,
	default: {
		info: jest.fn(),
		error: jest.fn(),
		warn: jest.fn(),
		debug: jest.fn(),
		fatal: jest.fn(),

		captureMessage: jest.fn(),
		captureException: jest.fn(),
		captureEvent: jest.fn(),
		setContext: jest.fn(),
		clearContext: jest.fn(),
	},
}));

// Mock axios
jest.mock("axios", () => ({
	get: jest.fn(() => Promise.resolve({ data: {} })),
	post: jest.fn(() => Promise.resolve({ data: {} })),
	isAxiosError: jest.fn(() => false),
}));

// Mock console methods to avoid noise in tests
console.debug = jest.fn();
console.info = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();

// mock sonner-native toast component
jest.mock("sonner-native", () => ({
	toast: jest.fn(),
}));
