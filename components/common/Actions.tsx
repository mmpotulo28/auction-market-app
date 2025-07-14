import { Colors } from "@/constants/Colors";
import { iButtonProps, iButtonType, iVariant } from "@/lib/types";
import React from "react";
import { Linking, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

export interface iActionProps {
	actions?: iButtonProps[];
	fullWidth?: boolean;
	style?: ViewStyle;
}

const getButtonStyle = (variant = iVariant.Primary, fullWidth = false) => {
	switch (variant) {
		case iVariant.Primary:
			return [styles.button, styles.primary, fullWidth && styles.fullWidthButton];
		case iVariant.Secondary:
			return [styles.button, styles.secondary, fullWidth && styles.fullWidthButton];
		case iVariant.Tertiary:
			return [styles.button, styles.tertiary, fullWidth && styles.fullWidthButton];
		case iVariant.Quaternary:
			return [styles.button, styles.quaternary, fullWidth && styles.fullWidthButton];
		case iVariant.Quinary:
			return [styles.button, styles.quinary, fullWidth && styles.fullWidthButton];
		default:
			return [styles.button, fullWidth && styles.fullWidthButton];
	}
};

const getLabelStyle = (variant = iVariant.Primary) => {
	switch (variant) {
		case iVariant.Primary:
			return styles.labelPrimary;
		case iVariant.Secondary:
			return styles.labelSecondary;
		case iVariant.Tertiary:
			return styles.labelTertiary;
		case iVariant.Quaternary:
			return styles.labelQuaternary;
		case iVariant.Quinary:
			return styles.labelQuinary;
		default:
			return styles.label;
	}
};

const Actions: React.FC<iActionProps> = ({ actions, fullWidth = false, style }) => {
	const handlePress = (action: iButtonProps) => {
		if (action.disabled) return;
		if (action.type === iButtonType.Link && action.url?.link) {
			Linking.openURL(action.url.link);
		} else if (action.click) {
			action.click();
		}
	};

	return (
		<View style={[styles.actions, fullWidth && styles.fullWidth, style]}>
			{actions?.map((action) =>
				action.hide ? null : (
					<TouchableOpacity
						key={`${action.key ?? action.label}`}
						style={getButtonStyle(action.variant, fullWidth)}
						onPress={() => handlePress(action)}
						activeOpacity={0.8}
						disabled={action.disabled || action.isLoading}>
						{action.iconStart && <View style={styles.icon}>{action.iconStart}</View>}
						{action.label && (
							<Text style={getLabelStyle(action.variant)}>{action.label}</Text>
						)}
						{action.iconEnd && <View style={styles.icon}>{action.iconEnd}</View>}
					</TouchableOpacity>
				),
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	actions: {
		flexDirection: "row",
		gap: 8,
	},
	fullWidth: {
		width: "100%",
		flexDirection: "column",
	},
	button: {
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 6,
		margin: "auto",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
		flex: 1,
	},
	fullWidthButton: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		borderRadius: 8,
		marginVertical: 4,
		width: "100%",
	},
	primary: {
		backgroundColor: Colors.light.tint,
	},
	secondary: {
		backgroundColor: Colors.light.card,
		borderWidth: 1,
		borderColor: Colors.light.tint,
	},
	tertiary: {
		backgroundColor: Colors.light.muted,
	},
	quaternary: {
		backgroundColor: Colors.light.destructive,
	},
	quinary: {
		backgroundColor: Colors.light.chart2,
	},
	label: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
	labelPrimary: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	labelSecondary: {
		color: Colors.light.tint,
		fontWeight: "700",
		fontSize: 16,
	},
	labelTertiary: {
		color: Colors.light.textPrimaryForeground,
		fontWeight: "600",
		fontSize: 16,
	},
	labelQuaternary: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	labelQuinary: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	icon: {
		alignItems: "center",
		justifyContent: "center",
	},
});

export default Actions;
