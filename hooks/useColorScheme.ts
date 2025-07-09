import { useEffect, useState } from "react";
import { useColorScheme as _useColorScheme } from "react-native";

// Store the color scheme in a module variable for global access
let _manualScheme: "light" | "dark" | null = null;
let listeners: ((scheme: "light" | "dark") => void)[] = [];

export function useColorScheme(): "light" | "dark" {
	const systemScheme = _useColorScheme();
	const [scheme, setScheme] = useState<"light" | "dark">(
		_manualScheme ?? (systemScheme === "dark" ? "dark" : "light"),
	);

	useEffect(() => {
		const handleChange = (newScheme: "light" | "dark") => setScheme(newScheme);
		listeners.push(handleChange);
		return () => {
			listeners = listeners.filter((fn) => fn !== handleChange);
		};
	}, []);

	useEffect(() => {
		if (_manualScheme === null && systemScheme) {
			setScheme(systemScheme === "dark" ? "dark" : "light");
		}
	}, [systemScheme]);

	return scheme;
}

export function setColorScheme(scheme: "light" | "dark") {
	_manualScheme = scheme;
	listeners.forEach((fn) => fn(scheme));
}
