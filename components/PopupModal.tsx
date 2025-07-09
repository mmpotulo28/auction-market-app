import { Colors } from "@/constants/Colors";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface PopupModalProps {
	visible: boolean;
	title?: string;
	message: string;
	onConfirm: () => void;
	onCancel: () => void;
	confirmText?: string;
	cancelText?: string;
}

const PopupModal: React.FC<PopupModalProps> = ({
	visible,
	title,
	message,
	onConfirm,
	onCancel,
	confirmText = "Confirm",
	cancelText = "Cancel",
}) => (
	<Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
		<View style={styles.overlay}>
			<View style={styles.modal}>
				{title && <Text style={styles.title}>{title}</Text>}
				<Text style={styles.message}>{message}</Text>
				<View style={styles.actions}>
					<TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
						<Text style={styles.cancelText}>{cancelText}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
						<Text style={styles.confirmText}>{confirmText}</Text>
					</TouchableOpacity>
				</View>
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
		width: "80%",
		backgroundColor: "#fff",
		borderRadius: 16,
		padding: 24,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 4,
	},
	title: {
		fontWeight: "bold",
		fontSize: 18,
		marginBottom: 12,
		color: Colors.light.textPrimaryForeground,
		textAlign: "center",
	},
	message: {
		fontSize: 16,
		color: Colors.light.textSecondaryForeground,
		textAlign: "center",
		marginBottom: 24,
	},
	actions: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	cancelBtn: {
		flex: 1,
		paddingVertical: 10,
		marginRight: 8,
		borderRadius: 8,
		backgroundColor: Colors.light.muted,
		alignItems: "center",
	},
	confirmBtn: {
		flex: 1,
		paddingVertical: 10,
		marginLeft: 8,
		borderRadius: 8,
		backgroundColor: Colors.light.destructive,
		alignItems: "center",
	},
	cancelText: {
		color: Colors.light.textSecondaryForeground,
		fontWeight: "600",
		fontSize: 16,
	},
	confirmText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
});

export default PopupModal;
