import { Colors } from "@/constants/Colors";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ThemedText } from "./ThemedText";

interface AboutModalProps {
	visible: boolean;
	onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ visible, onClose }) => (
	<Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
		<View style={styles.overlay}>
			<View style={styles.modal}>
				<ThemedText type="title" style={styles.title}>
					About Auction App
				</ThemedText>
				<Text style={styles.body}>
					Auction App is a modern platform for real-time auctions, secure transactions,
					and seamless bidding. Manage your profile, browse items, and enjoy 24/7 support.
					Your privacy and experience are our top priorities.
				</Text>
				<Text style={styles.version}>Version 1.0.0</Text>
				<TouchableOpacity style={styles.closeBtn} onPress={onClose}>
					<Text style={styles.closeText}>Close</Text>
				</TouchableOpacity>
			</View>
		</View>
	</Modal>
);

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.35)",
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		width: "85%",
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 26,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 4,
	},
	title: {
		fontWeight: "bold",
		fontSize: 22,
		marginBottom: 14,
		color: Colors.light.textPrimaryForeground,
		textAlign: "center",
	},
	body: {
		fontSize: 16,
		color: Colors.light.textSecondaryForeground,
		textAlign: "center",
		marginBottom: 18,
	},
	version: {
		fontSize: 13,
		color: Colors.light.textMutedForeground,
		marginBottom: 18,
	},
	closeBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 10,
		paddingHorizontal: 32,
		borderRadius: 8,
		alignItems: "center",
	},
	closeText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
});

export default AboutModal;
