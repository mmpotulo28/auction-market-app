import { Colors } from "@/constants/Colors";
import { iButtonProps } from "@/lib/types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

export interface iActionProps {
	actions?: iButtonProps[];
	fullWidth?: boolean;
	style?: ViewStyle;
}

const Actions: React.FC<iActionProps> = ({ actions, fullWidth = false, style }) => {
	return (
		<View style={[styles.actions, fullWidth && styles.fullWidth, style]}>
			{actions?.map((action) =>
				action.hide ? null : (
					<TouchableOpacity
						key={`${action.key ?? action.label}`}
						style={styles.button}
						onPress={action.click ? action.click : undefined}
						activeOpacity={0.8}>
						{action.iconStart && <View style={styles.icon}>{action.iconStart}</View>}
						<Text style={styles.label}>{action.label}</Text>
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
	},
	button: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 10,
		paddingHorizontal: 18,
		borderRadius: 6,
		margin: "auto",
		flexDirection: "row",
		alignItems: "center",
	},
	label: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
	icon: {
		marginRight: 6,
	},
});

export default Actions;
