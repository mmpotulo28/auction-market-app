import React from "react";
import { ThemedView } from "../ThemedView";

// This is a shim for web and Android where the tab bar is generally opaque.
export default function TabBarBackground(): React.ReactNode {
	return <ThemedView style={{ flex: 1 }} />;
}

export function useBottomTabOverflow() {
	return 0;
}
