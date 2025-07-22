import { Colors } from "@/constants/Colors";
import { TrophyIcon } from "lucide-react-native";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface WinConfettiProps {
	visible: boolean;
}

const WinConfetti: React.FC<WinConfettiProps> = ({ visible }) => {
	if (!visible) return null;

	return (
		<View style={styles.container} pointerEvents="none">
			<View style={styles.banner}>
				<TrophyIcon color="#FFC700" size={24} />
				<Text style={styles.bannerText}>Congratulations on your win!</Text>
			</View>
		</View>
	);
};
const styles = StyleSheet.create({
	container: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		alignItems: "center",
		zIndex: 10,
		pointerEvents: "none",
	},
	banner: {
		backgroundColor: Colors.light.card,
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginTop: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 3,
	},
	bannerText: {
		color: Colors.light.textPrimaryForeground,
		fontWeight: "bold",
		fontSize: 16,
		marginLeft: 8,
	},
});

export default WinConfetti;
