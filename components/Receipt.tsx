import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { iTransaction } from "@/lib/types";
import * as Clipboard from "expo-clipboard";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { ChevronDown, ChevronUp, Copy, Download, X } from "lucide-react-native";
import React, { useRef, useState } from "react";
import {
	Alert,
	Modal,
	Platform,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";
import CopyElement from "./CopyElement";

interface ReceiptProps {
	transaction: iTransaction;
	visible: boolean;
	onClose: () => void;
}

const Receipt: React.FC<ReceiptProps> = ({ transaction, visible, onClose }) => {
	const [showFull, setShowFull] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const receiptRef = useRef<View>(null);

	if (!transaction) {
		return null;
	}

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

	const handleDownloadPDF = async () => {
		if (!transaction) return;
		setDownloading(true);
		try {
			// Generate HTML for the receipt
			const html = `
				<html>
				<head>
					<meta name="viewport" content="width=device-width, initial-scale=1.0">
					<style>
						body { font-family: monospace; background: #f6faff; color: #014b8b; margin: 0; padding: 0; }
						.receipt-container { background: #fff; border-radius: 18px; margin: 24px; padding: 24px 18px; box-shadow: 0 2px 12px rgba(1,75,139,0.13); }
						.logo { font-weight: bold; font-size: 22px; color: #1976c5; text-align: center; margin-bottom: 2px; }
						.title { font-size: 15px; color: #7fa1c0; text-align: center; margin-bottom: 12px; }
						.row { display: flex; justify-content: space-between; margin-bottom: 8px; }
						.label { font-weight: 600; color: #7fa1c0; }
						.value { font-weight: 600; color: #014b8b; text-align: right; }
						.bold { font-weight: 700; }
						.divider { border-bottom: 1px dashed #e0eaff; margin: 12px 0; }
						.thank { text-align: center; color: #7fa1c0; font-size: 13px; margin-top: 10px; }
						.powered { text-align: center; color: #b0b0b0; font-size: 11px; margin-bottom: 6px; }
					</style>
				</head>
				<body>
					<div class="receipt-container">
						<div class="logo">AUCTION MARKET SA</div>
						<div class="title">Transaction Receipt</div>
						<div class="divider"></div>
						<div class="row"><span class="label">Date</span><span class="value">${
							transaction.created_at
								? new Date(transaction.created_at).toLocaleString()
								: new Date().toLocaleString()
						}</span></div>
						<div class="row"><span class="label">Ref</span><span class="value">${
							transaction.m_payment_id || transaction.pf_payment_id
						}</span></div>
						<div class="row"><span class="label">Status</span><span class="value">${
							transaction.payment_status
						}</span></div>
						<div class="row"><span class="label">Item</span><span class="value">${
							transaction.item_name
						}</span></div>
						${
							transaction.custom_str2
								? `<div class="row"><span class="label">Order Id</span><span class="value">${transaction.custom_str2}</span></div>`
								: ""
						}
						${
							transaction.custom_str1
								? `<div class="row"><span class="label">User Id</span><span class="value">${transaction.custom_str1}</span></div>`
								: ""
						}
						${
							transaction.item_description
								? `<div class="row"><span class="label">Description</span><span class="value">${transaction.item_description}</span></div>`
								: ""
						}
						<div class="divider"></div>
						<div class="row"><span class="label bold">Net Amount</span><span class="value bold">R ${
							transaction.amount_net !== undefined
								? Number(transaction.amount_net).toFixed(2)
								: ""
						}</span></div>
						<div class="row"><span class="label">+ Fees</span><span class="value">R ${
							transaction.amount_fee !== undefined
								? Math.abs(Number(transaction.amount_fee)).toFixed(2)
								: ""
						}</span></div>
						<div class="row"><span class="label bold">Total Paid</span><span class="value bold">R ${
							transaction.amount_gross !== undefined
								? Number(transaction.amount_gross).toFixed(2)
								: ""
						}</span></div>
						<div class="divider"></div>
						<div class="thank">Thank you for shopping with us!</div>
						<div class="powered">Powered by Auction Market SA</div>
					</div>
				</body>
				</html>
			`;

			const { uri } = await Print.printToFileAsync({ html, base64: false });
			if (Platform.OS === "ios" || Platform.OS === "android") {
				await Sharing.shareAsync(uri, {
					UTI: "com.adobe.pdf",
					mimeType: "application/pdf",
				});
			} else {
				Alert.alert("PDF Generated", "PDF saved to: " + uri);
			}
		} catch (err: any) {
			Alert.alert("Error", err?.message || "Failed to generate PDF.");
		}
		setDownloading(false);
	};

	return (
		<Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.receiptPaper} ref={receiptRef}>
					{/* Close button at top right */}
					<TouchableOpacity
						style={styles.closeBtnTop}
						onPress={onClose}
						accessibilityLabel="Close">
						<X size={22} color={Colors.light.textMutedForeground} />
					</TouchableOpacity>
					<ScrollView contentContainerStyle={styles.scrollContent}>
						<View style={styles.receiptHeader}>
							<ThemedText style={styles.receiptLogo}>AUCTION MARKET SA</ThemedText>
							<ThemedText style={styles.receiptTitle}>Transaction Receipt</ThemedText>
						</View>
						<View style={styles.dashedDivider} />
						{!showFull ? (
							<>
								<View style={styles.row}>
									<ThemedText style={styles.label}>Item</ThemedText>
									<ThemedText style={styles.value} numberOfLines={1}>
										<CopyElement truncate content={transaction.item_name} />
									</ThemedText>
								</View>
								<View style={styles.row}>
									<ThemedText style={styles.label}>Ref</ThemedText>
									<ThemedText style={styles.value}>
										<CopyElement
											truncate
											content={
												transaction.m_payment_id ||
												transaction.pf_payment_id
											}
										/>
									</ThemedText>
								</View>
								<View style={[styles.row, styles.boldRow]}>
									<ThemedText style={[styles.label, styles.bold]}>
										Total Paid
									</ThemedText>
									<ThemedText style={[styles.value, styles.bold]}>
										R{" "}
										{transaction.amount_gross !== undefined
											? Number(transaction.amount_gross).toFixed(2)
											: ""}
									</ThemedText>
								</View>
								<View style={styles.actionsRow}>
									<TouchableOpacity
										style={styles.actionBtn}
										onPress={handleCopyReceipt}
										accessibilityLabel="Copy receipt">
										<Copy size={18} color={Colors.light.tint} />
										<ThemedText style={styles.actionBtnText}>Copy</ThemedText>
									</TouchableOpacity>
									<TouchableOpacity
										style={styles.actionBtn}
										onPress={handleDownloadPDF}
										disabled={downloading}
										accessibilityLabel="Download as PDF">
										<Download size={18} color={Colors.light.tint} />
										<ThemedText style={styles.actionBtnText}>
											{downloading ? "Downloading..." : "PDF"}
										</ThemedText>
									</TouchableOpacity>
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
										<CopyElement
											truncate
											content={
												transaction.m_payment_id ||
												transaction.pf_payment_id
											}
										/>
									</ThemedText>
								</View>
								<View style={styles.row}>
									<ThemedText style={styles.label}>Status</ThemedText>
									<ThemedText
										style={[
											styles.value,
											{
												color:
													transaction.payment_status?.toLowerCase() ===
														"complete" ||
													transaction.payment_status?.toLowerCase() ===
														"completed"
														? "#22c55e"
														: transaction.payment_status?.toLowerCase() ===
														  "cancelled"
														? "#c90000"
														: Colors.light.textPrimaryForeground,
											},
										]}>
										{transaction.payment_status}
									</ThemedText>
								</View>
								<View style={styles.row}>
									<ThemedText style={styles.label}>Item</ThemedText>
									<ThemedText style={styles.value} numberOfLines={1}>
										<CopyElement truncate content={transaction?.item_name} />
									</ThemedText>
								</View>
								{transaction.custom_str2 && (
									<View style={styles.row}>
										<ThemedText style={styles.label}>Order Id</ThemedText>
										<ThemedText style={styles.value} numberOfLines={1}>
											<CopyElement
												truncate
												content={transaction?.custom_str2}
											/>
										</ThemedText>
									</View>
								)}
								{transaction.custom_str1 && (
									<View style={styles.row}>
										<ThemedText style={styles.label}>User Id</ThemedText>
										<ThemedText style={styles.value} numberOfLines={1}>
											<CopyElement
												truncate
												content={transaction?.custom_str1}
											/>
										</ThemedText>
									</View>
								)}
								{transaction.item_description && (
									<View style={styles.row}>
										<ThemedText style={styles.label}>Description</ThemedText>
										<ThemedText style={styles.value} numberOfLines={2}>
											<CopyElement
												truncate
												content={transaction.item_description}
											/>
										</ThemedText>
									</View>
								)}
								<View style={styles.dashedDivider} />
								<View style={[styles.row, styles.boldRow]}>
									<ThemedText style={[styles.label, styles.bold]}>
										Net Amount
									</ThemedText>
									<ThemedText style={[styles.value, styles.bold]}>
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
									<ThemedText style={[styles.label, styles.bold]}>
										Total Paid
									</ThemedText>
									<ThemedText style={[styles.value, styles.bold]}>
										R{" "}
										{transaction.amount_gross !== undefined
											? Number(transaction.amount_gross).toFixed(2)
											: ""}
									</ThemedText>
								</View>
								<View style={styles.dashedDivider} />
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
									<TouchableOpacity
										style={styles.actionBtn}
										onPress={handleDownloadPDF}
										disabled={downloading}
										accessibilityLabel="Download as PDF">
										<Download size={18} color={Colors.light.tint} />
										<ThemedText style={styles.actionBtnText}>
											{downloading ? "Downloading..." : "PDF"}
										</ThemedText>
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
					</ScrollView>
					<View style={styles.paperTear} />
				</View>
			</View>
		</Modal>
	);
};

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
		backgroundColor: Colors.light.overlay,
		justifyContent: "center",
		alignItems: "center",
		minHeight: "100%",
		backdropFilter: "blur(5px)",
	},
	receiptPaper: {
		width: "92%",
		backgroundColor: "#f6faff",
		borderRadius: 18,
		padding: 0,
		alignItems: "center",
		overflow: "hidden",
		borderWidth: 1,
		borderColor: "#e0eaff",
		shadowColor: "#014b8b",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 6,
		position: "relative",
		backdropFilter: "blur(5px)",
	},
	closeBtnTop: {
		position: "absolute",
		top: 12,
		right: 12,
		zIndex: 10,
		backgroundColor: Colors.light.muted,
		borderRadius: 20,
		padding: 6,
		alignItems: "center",
		justifyContent: "center",
	},
	receiptHeader: {
		alignItems: "center",
		paddingTop: 32,
		paddingBottom: 8,
		backgroundColor: "#f6faff",
		width: "100%",
		borderTopLeftRadius: 18,
		borderTopRightRadius: 18,
	},
	receiptLogo: {
		fontWeight: "bold",
		fontSize: 20,
		letterSpacing: 1.2,
		color: Colors.light.tint,
		marginBottom: 2,
	},
	receiptTitle: {
		fontSize: 14,
		color: Colors.light.textMutedForeground,
		marginBottom: 2,
	},
	scrollContent: {
		minWidth: "100%",
		paddingHorizontal: 22,
		paddingBottom: 18,
		paddingTop: 12,
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
	bold: {
		fontWeight: "700",
	},
	boldRow: {
		// fontWeight handled in text
	},
	dashedDivider: {
		borderStyle: "dashed",
		borderBottomWidth: 1,
		borderColor: "#e0eaff",
		width: "100%",
		marginVertical: 10,
		opacity: 0.7,
	},
	thankYou: {
		textAlign: "center",
		color: Colors.light.textMutedForeground,
		fontSize: 13,
		marginBottom: 2,
		marginTop: 10,
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
		// not used, keep for compatibility
	},
	closeBtnText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	paperTear: {
		width: "100%",
		height: 16,
		backgroundColor: "#f6faff",
		borderBottomLeftRadius: 18,
		borderBottomRightRadius: 18,
		borderTopWidth: 1,
		borderColor: "#e0eaff",
		marginTop: -8,
	},
});

export default Receipt;
