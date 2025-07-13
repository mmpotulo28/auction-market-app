import * as Clipboard from "expo-clipboard";
import { Check, Copy } from "lucide-react-native";
import React, { useState } from "react";
import { StyleSheet, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";
import { ThemedText } from "./ThemedText";

interface CopyElementProps {
	content: string;
	truncate?: boolean;
	truncateWidth?: number;
	style?: ViewStyle;
	textStyle?: TextStyle;
}

const CopyElement: React.FC<CopyElementProps> = ({
	content,
	truncate = false,
	truncateWidth = 200,
	style,
	textStyle,
}) => {
	const [copied, setCopied] = useState<string | null>(null);

	const handleCopy = async (text: string) => {
		await Clipboard.setStringAsync(text);
		setCopied(text);
		setTimeout(() => setCopied(null), 2000);
	};

	return (
		<View style={[styles.row, style]}>
			<ThemedText
				numberOfLines={truncate ? 1 : undefined}
				ellipsizeMode={truncate ? "tail" : undefined}
				style={[styles.text, truncate && { maxWidth: truncateWidth }, textStyle]}>
				{content}
			</ThemedText>
			<TouchableOpacity
				style={styles.iconBtn}
				onPress={() => handleCopy(content)}
				accessibilityLabel="Copy to clipboard"
				hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
				{copied === content ? (
					<Check size={16} color="#1976c5" />
				) : (
					<Copy size={16} color="#1976c5" />
				)}
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	text: {
		fontSize: 15,
	},
	iconBtn: {
		marginLeft: 4,
		padding: 2,
	},
});

export default CopyElement;
