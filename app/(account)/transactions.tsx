import CopyElement from "@/components/CopyElement";
import ReceiptModal from "@/components/Receipt";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { fetchTransactions } from "@/lib/helpers";
import { iTransaction } from "@/lib/types";
import { LinearGradient } from "expo-linear-gradient";
import { Eye, Receipt, RotateCcw } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	SafeAreaView,
	StyleSheet,
	TouchableOpacity,
	View,
} from "react-native";

const statusBadgeColor = (status: string) => {
	switch (status.toLowerCase()) {
		case "complete":
		case "completed":
		case "paid":
		case "success":
			return { backgroundColor: "#e0ffe6", color: "#22c55e" };
		case "pending":
			return { backgroundColor: "#fffbe6", color: "#eab308" };
		case "failed":
		case "cancelled":
			return { backgroundColor: "#ffeaea", color: "#c90000" };
		default:
			return { backgroundColor: "#e0eaff", color: Colors.light.textMutedForeground };
	}
};

export default function TransactionsScreen() {
	const [transactions, setTransactions] = useState<iTransaction[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedTransaction, setSelectedTransaction] = useState<iTransaction | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			// Simulate fetching data
			const res = await fetchTransactions({ page: 1, pageSize: 20 });
			if (res.error) {
				setError(res.error);
			} else {
				setTransactions(res.transactions);
			}
		} catch (err) {
			console.error("Error fetching transactions:", err);
			setError("Failed to load transactions. Please try again later.");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: Colors.light.background, paddingTop: 24 }}>
			<ThemedView style={styles.container}>
				<View style={styles.headerRow}>
					<ThemedText type="title" style={styles.heading}>
						My Transactions
					</ThemedText>
					<TouchableOpacity
						style={styles.refreshBtn}
						onPress={fetchData}
						disabled={loading}
						accessibilityLabel="Refresh transactions">
						<RotateCcw size={22} color={"#fff"} />
					</TouchableOpacity>
				</View>
				{error && (
					<View style={styles.errorCard}>
						<ThemedText style={styles.errorText}>{error}</ThemedText>
					</View>
				)}
				<View style={styles.card}>
					{loading ? (
						<ActivityIndicator
							size="large"
							color={Colors.light.tint}
							style={{ marginVertical: 32 }}
						/>
					) : transactions.length === 0 ? (
						<View style={styles.emptyState}>
							<ThemedText style={styles.emptyText}>No transactions found.</ThemedText>
						</View>
					) : (
						<FlatList
							data={transactions}
							keyExtractor={(item) => item.pf_payment_id}
							renderItem={({ item }) => {
								const badge = statusBadgeColor(item.payment_status);
								return (
									<LinearGradient
										colors={["#f6faff", "#eaf3fb"]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 1 }}
										style={styles.txCardGradient}>
										<View style={styles.txItem}>
											<View style={styles.txHeader}>
												<View style={styles.txHeaderLeft}>
													<Receipt size={22} color={Colors.light.tint} />
													<ThemedText style={styles.txIdText}>
														<CopyElement
															truncate
															content={
																item.m_payment_id ||
																item.pf_payment_id
															}
														/>
													</ThemedText>
												</View>
												<TouchableOpacity
													onPress={() => setSelectedTransaction(item)}
													style={styles.eyeBtn}
													accessibilityLabel="View Receipt">
													<Eye size={20} color={Colors.light.tint} />
												</TouchableOpacity>
											</View>
											<View style={styles.txDetailsRow}>
												<ThemedText style={styles.txLabel}>
													Date:
												</ThemedText>
												<ThemedText style={styles.txValue}>
													{item.created_at
														? new Date(item.created_at).toLocaleString()
														: "-"}
												</ThemedText>
											</View>
											<View style={styles.txDetailsRow}>
												<ThemedText style={styles.txLabel}>
													Status:
												</ThemedText>
												<View
													style={[
														styles.statusBadge,
														{ backgroundColor: badge.backgroundColor },
													]}>
													<ThemedText
														style={[
															styles.statusBadgeText,
															{ color: badge.color },
														]}>
														{item.payment_status}
													</ThemedText>
												</View>
											</View>
											<View style={styles.txDetailsRow}>
												<ThemedText style={styles.txLabel}>
													Item:
												</ThemedText>
												<ThemedText style={styles.txValue}>
													<CopyElement
														truncate
														content={item.item_name || "N/A"}
													/>
												</ThemedText>
											</View>
										</View>
									</LinearGradient>
								);
							}}
							contentContainerStyle={{ paddingVertical: 8 }}
						/>
					)}
				</View>
				<ReceiptModal
					transaction={selectedTransaction!}
					visible={!!selectedTransaction}
					onClose={() => setSelectedTransaction(null)}
				/>
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.light.border,
		paddingTop: 24,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginHorizontal: 18,
		marginBottom: 12,
	},
	heading: {
		fontSize: 28,
		fontWeight: "bold",
		letterSpacing: 0.2,
	},
	refreshBtn: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: Colors.light.accent,
		alignItems: "center",
		justifyContent: "center",
		boxShadow: "0 1px 4px rgba(1,75,139,0.07)",
	},
	card: {
		backgroundColor: Colors.light.background,
		borderRadius: 22,
		marginHorizontal: 12,
		padding: 6,
		boxShadow: "0 2px 12px rgba(1,75,139,0.09)",
		flex: 1,
	},
	txCardGradient: {
		borderRadius: 18,
		marginBottom: 16,
		overflow: "hidden",
		boxShadow: "0 2px 8px rgba(1,75,139,0.07)",
	},
	txItem: {
		backgroundColor: Colors.light.card,
		borderRadius: 18,
		padding: 18,
		boxShadow: "0 1px 4px rgba(1,75,139,0.06)",
	},
	txHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	txHeaderLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	txIdText: {
		fontWeight: "bold",
		fontSize: 18,
		color: Colors.light.textPrimaryForeground,
		marginLeft: 8,
	},
	eyeBtn: {
		backgroundColor: Colors.light.muted,
		borderRadius: 8,
		padding: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	txDetailsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	txLabel: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textMutedForeground,
	},
	txValue: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textPrimaryForeground,
	},
	statusBadge: {
		borderRadius: 8,
		paddingVertical: 4,
		paddingHorizontal: 14,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 4,
	},
	statusBadgeText: {
		fontWeight: "700",
		fontSize: 14,
	},
	emptyState: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 32,
	},
	emptyText: {
		color: Colors.light.textMutedForeground,
		fontSize: 16,
		marginTop: 8,
	},
	errorCard: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#ffeaea",
		borderRadius: 10,
		padding: 12,
		marginHorizontal: 18,
		marginBottom: 10,
		boxShadow: "0 1px 4px rgba(201,0,0,0.07)",
	},
	errorText: {
		color: Colors.light.destructive,
		fontWeight: "600",
		fontSize: 15,
		marginLeft: 8,
	},
	modal: {
		width: "90%",
		backgroundColor: "#fff",
		borderRadius: 18,
		padding: 20,
		alignItems: "center",
		boxShadow: "0 2px 12px rgba(1,75,139,0.13)",
	},
	overlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.25)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalTitle: {
		fontWeight: "bold",
		fontSize: 22,
		marginBottom: 18,
		color: Colors.light.textPrimaryForeground,
		textAlign: "center",
	},
	receiptContent: {
		width: "100%",
		marginBottom: 18,
	},
	receiptRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 6,
	},
	receiptLabel: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textMutedForeground,
	},
	receiptValue: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textPrimaryForeground,
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
