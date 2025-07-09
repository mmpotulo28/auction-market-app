import { Colors } from "@/constants/Colors";
import { iLockUpProps, iSize } from "@/lib/types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
	<View style={[styles.lockup, centered && styles.centered]}>
		{overline ? (
			<Text style={[styles.overline, bold && styles.bold]}>{truncate(overline)}</Text>
		) : null}
		<Text style={[styles.title, bold && styles.bold]}>{truncate(title)}</Text>
		{subtitle ? (
			<Text style={[styles.subtitle, bold && styles.bold]}>{truncate(subtitle)}</Text>
		) : null}
	</View>
);

const styles = StyleSheet.create({
	lockup: {
		flexDirection: "column",
		marginBottom: 12,
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
		color: "#222",
		marginBottom: 2,
	},
	subtitle: {
		fontSize: 16,
		color: "#555",
	},
});

export default LockUp;
