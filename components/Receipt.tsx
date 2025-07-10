import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { iTransaction } from "@/lib/types";
import * as Clipboard from "expo-clipboard";
import { ChevronDown, ChevronUp, Copy } from "lucide-react-native";
import React, { useState } from "react";
import { Alert, Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface ReceiptProps {
	transaction: iTransaction;
	visible: boolean;
	onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction, visible, onClose }) => {
	const [showFull, setShowFull] = useState(false);

	const handleCopyReceipt = async () => {
		if (!transaction) return;
		const lines = [
			"AUCTION MARKET SA - Transaction Receipt",
			`Date: ${
				transaction.created_at
					? new Date(transaction.created_at).toLocaleString()
					: new Date().toLocaleString()
			}`,
			`Ref: ${transaction.m_payment_id || transaction.pf_payment_id}`,
			`Status: ${transaction.payment_status}`,
			`Item: ${transaction.item_name}`,
			`Order ID: ${transaction.custom_str2 ?? ""}`,
			transaction.item_description ? `Description: ${transaction.item_description}` : "",
			`User Id: ${transaction.custom_str1 ?? ""}`,
			`Payment Id: ${transaction.pf_payment_id || transaction.m_payment_id}`,
			`Net Amount: R ${
				transaction.amount_net !== undefined
					? Number(transaction.amount_net).toFixed(2)
					: ""
			}`,
			`+ Fees: R ${
				transaction.amount_fee !== undefined
					? Math.abs(Number(transaction.amount_fee)).toFixed(2)
					: ""
			}`,
			`Total Paid: R ${
				transaction.amount_gross !== undefined
					? Number(transaction.amount_gross).toFixed(2)
					: ""
			}`,
			"Thank you for shopping with us!",
			"Powered by Auction Market SA",
		]
			.filter(Boolean)
			.join("\n");
		await Clipboard.setStringAsync(lines);
		Alert.alert("Copied!", "Receipt copied to clipboard.");
	};

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.modal}>
					<ScrollView contentContainerStyle={styles.scrollContent}>
						{!showFull ? (
							<>
								<View style={styles.row}>
									<ThemedText style={styles.label}>Item</ThemedText>
									<ThemedText style={styles.value} numberOfLines={1}>
										{transaction.item_name}
									</ThemedText>
								</View>
								<View style={styles.row}>
									<ThemedText style={styles.label}>Ref</ThemedText>
									<ThemedText style={styles.value}>
										{transaction.m_payment_id || transaction.pf_payment_id}
									</ThemedText>
								</View>
								<View style={[styles.row, styles.boldRow]}>
									<ThemedText style={[styles.label, { fontWeight: "700" }]}>
										Total Paid
									</ThemedText>
									<ThemedText style={[styles.value, { fontWeight: "700" }]}>
										R{" "}
										{transaction.amount_gross !== undefined
											? Number(transaction.amount_gross).toFixed(2)
											: ""}
									</ThemedText>
								</View>
								<TouchableOpacity
									style={styles.toggleBtn}
									onPress={() => setShowFull(true)}
									accessibilityLabel="Show full receipt">
									<ChevronDown size={24} color={Colors.light.tint} />
								</TouchableOpacity>
							</>
						) : (
							<>
								<ThemedText style={styles.receiptTitle}>
									AUCTION MARKET SA
								</ThemedText>
								<ThemedText style={styles.receiptSubtitle}>
									Transaction Receipt
								</ThemedText>
								<View style={styles.row}>
									<ThemedText style={styles.label}>Date</ThemedText>
									<ThemedText style={styles.value}>
										{transaction.created_at
											? new Date(transaction.created_at).toLocaleString()
											: new Date().toLocaleString()}
									</ThemedText>
								</View>
								<View style={styles.row}>
									<ThemedText style={styles.label}>Ref</ThemedText>
									<ThemedText style={styles.value}>
										{transaction.m_payment_id || transaction.pf_payment_id}
									</ThemedText>
								</View>
								<View style={styles.row}>
									<ThemedText style={styles.label}>Status</ThemedText>
									<ThemedText style={[styles.value, { color: "#22c55e" }]}>
										{transaction.payment_status}
									</ThemedText>
								</View>
								<View style={styles.row}>
									<ThemedText style={styles.label}>Item</ThemedText>
									<ThemedText style={styles.value} numberOfLines={1}>
										{transaction?.item_name}
									</ThemedText>
								</View>
								{transaction.custom_str2 && (
									<View style={styles.row}>
										<ThemedText style={styles.label}>Order Id</ThemedText>
										<ThemedText style={styles.value} numberOfLines={1}>
											{transaction?.custom_str2}
										</ThemedText>
									</View>
								)}
								{transaction.custom_str1 && (
									<View style={styles.row}>
										<ThemedText style={styles.label}>User Id</ThemedText>
										<ThemedText style={styles.value} numberOfLines={1}>
											{transaction?.custom_str1}
										</ThemedText>
									</View>
								)}
								<View style={styles.divider} />
								<View style={[styles.row, styles.boldRow]}>
									<ThemedText style={[styles.label, { fontWeight: "700" }]}>
										Net Amount
									</ThemedText>
									<ThemedText style={[styles.value, { fontWeight: "700" }]}>
										R{" "}
										{transaction.amount_net !== undefined
											? Number(transaction.amount_net).toFixed(2)
											: ""}
									</ThemedText>
								</View>
								<View style={styles.row}>
									<ThemedText style={styles.label}>+ Fees</ThemedText>
									<ThemedText style={styles.value}>
										R{" "}
										{transaction.amount_fee !== undefined
											? Math.abs(Number(transaction.amount_fee)).toFixed(2)
											: ""}
									</ThemedText>
								</View>
								<View style={[styles.row, styles.boldRow]}>
									<ThemedText style={styles.label}>Total Paid</ThemedText>
									<ThemedText style={styles.value}>
										R{" "}
										{transaction.amount_gross !== undefined
											? Number(transaction.amount_gross).toFixed(2)
											: ""}
									</ThemedText>
								</View>
								<View style={styles.divider} />
								<ThemedText style={styles.thankYou}>
									Thank you for shopping with us!
								</ThemedText>
								<ThemedText style={styles.poweredBy}>
									Powered by Auction Market SA
								</ThemedText>
								<View style={styles.actionsRow}>
									<TouchableOpacity
										style={styles.actionBtn}
										onPress={handleCopyReceipt}
										accessibilityLabel="Copy receipt">
										<Copy size={18} color={Colors.light.tint} />
										<ThemedText style={styles.actionBtnText}>Copy</ThemedText>
									</TouchableOpacity>
								</View>
								<TouchableOpacity
									style={styles.toggleBtn}
									onPress={() => setShowFull(false)}
									accessibilityLabel="Hide full receipt">
									<ChevronUp size={24} color={Colors.light.tint} />
								</TouchableOpacity>
							</>
						)}
						<TouchableOpacity style={styles.closeBtn} onPress={onClose}>
							<ThemedText style={styles.closeBtnText}>Close</ThemedText>
						</TouchableOpacity>
					</ScrollView>
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.25)",
		justifyContent: "center",
		alignItems: "center",
	},
	modal: {
		width: "90%",
		backgroundColor: "#fff",
		borderRadius: 18,
		padding: 20,
		alignItems: "center",
		boxShadow: "0 2px 12px rgba(1,75,139,0.13)",
	},
	scrollContent: {
		width: "100%",
		paddingBottom: 18,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 8,
	},
	label: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textMutedForeground,
	},
	value: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textPrimaryForeground,
		textAlign: "right",
		flex: 1,
		marginLeft: 8,
	},
	boldRow: {
		// fontWeight removed because it's not valid for View
	},
	divider: {
		height: 1,
		backgroundColor: "#e0eaff",
		marginVertical: 10,
		opacity: 0.7,
	},
	receiptTitle: {
		textAlign: "center",
		fontWeight: "bold",
		fontSize: 18,
		letterSpacing: 1.2,
		marginBottom: 2,
		color: Colors.light.textPrimaryForeground,
	},
	receiptSubtitle: {
		textAlign: "center",
		fontSize: 13,
		color: Colors.light.textMutedForeground,
		marginBottom: 10,
	},
	thankYou: {
		textAlign: "center",
		color: Colors.light.textMutedForeground,
		fontSize: 13,
		marginBottom: 2,
	},
	poweredBy: {
		textAlign: "center",
		color: "#b0b0b0",
		fontSize: 11,
		marginBottom: 6,
	},
	actionsRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 8,
		gap: 12,
	},
	actionBtn: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.light.muted,
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 18,
		marginHorizontal: 4,
	},
	actionBtnText: {
		marginLeft: 6,
		color: Colors.light.tint,
		fontWeight: "600",
		fontSize: 15,
	},
	toggleBtn: {
		alignSelf: "center",
		marginTop: 6,
		marginBottom: 2,
	},
	closeBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
	},
	closeBtnText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
});

export default Receipt;
