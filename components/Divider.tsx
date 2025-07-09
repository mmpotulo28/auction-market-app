import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";

interface DividerProps {
	style?: ViewStyle;
}

const Divider: React.FC<DividerProps> = ({ style }) => <View style={[styles.divider, style]} />;

const styles = StyleSheet.create({
	divider: {
		height: 1,
		width: "90%",
		alignSelf: "center",
		backgroundColor: "#e0eaff",
		marginVertical: 24,
		opacity: 0.7,
	},
});

export default Divider;
