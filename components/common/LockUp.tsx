import { Colors } from "@/constants/Colors";
import { iLockUpProps, iSize } from "@/lib/types";
import React from "react";
import { StyleSheet } from "react-native";
import { ThemedText } from "../ThemedText";
import { ThemedView } from "../ThemedView";

const truncate = (text?: string) => {
	if (!text) return "";
	return text.length > 256 ? `${text.substring(0, 253)}...` : text;
};

const LockUp: React.FC<iLockUpProps> = ({
	title = "LockUp Title",
	overline,
	subtitle,
	size = iSize.Large,
	centered = false,
	bold = false,
}) => (
	<ThemedView style={[styles.lockup, centered && styles.centered]}>
		{overline && (
			<ThemedText style={[styles.overline, bold && styles.bold]}>
				{truncate(overline)}
			</ThemedText>
		)}
		<ThemedText style={[styles.title, bold && styles.bold]}>{truncate(title)}</ThemedText>
		{subtitle && (
			<ThemedText style={[styles.subtitle, bold && styles.bold]}>
				{truncate(subtitle)}
			</ThemedText>
		)}
	</ThemedView>
);

const styles = StyleSheet.create({
	lockup: {
		flexDirection: "column",
		marginBottom: 12,
		backgroundColor: "transparent",
	},
	centered: {
		alignItems: "center",
		textAlign: "center",
	},
	bold: {
		fontWeight: "bold",
	},
	overline: {
		fontSize: 12,
		fontWeight: "600",
		color: Colors.light.tint,
		textTransform: "uppercase",
		marginBottom: 2,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 2,
	},
	subtitle: {
		fontSize: 16,
		color: "#ddd",
	},
});

export default LockUp;
