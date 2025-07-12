import CopyElement from "@/components/CopyElement";
import OrderView from "@/components/OrderView";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { fetchOrders } from "@/lib/helpers";
import { iGroupedOrder, iOrderStatus } from "@/lib/types";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Receipt, RotateCcw } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";

const statusBadgeColor = (status: iOrderStatus) => {
	switch (status) {
		case iOrderStatus.Completed:
			return { backgroundColor: "#e0ffe6", color: "#22c55e" };
		case iOrderStatus.Pending:
			return { backgroundColor: "#fffbe6", color: "#eab308" };
		case iOrderStatus.Failed:
		case iOrderStatus.Cancelled:
			return { backgroundColor: "#ffeaea", color: "#c90000" };
		default:
			return { backgroundColor: "#e0eaff", color: Colors.light.textMutedForeground };
	}
};

export default function OrdersScreen() {
	const [orders, setOrders] = useState<iGroupedOrder[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [page, setPage] = useState(1);
	const [selectedOrder, setSelectedOrder] = useState<iGroupedOrder | null>(null);

	const fetchData = useCallback(async () => {
		setLoading(true);
		setError(null);
		fetchOrders({ page, pageSize: 10 })
			.then((data) => {
				const { groupedOrders } = data;
				if (data.error) {
					setError(data.error);
				}
				setOrders(groupedOrders);
				setLoading(false);
			})
			.catch((err) => {
				console.error("Error fetching orders:", err);
				setError("Failed to fetch orders.");
				setLoading(false);
			});
	}, [page]);

	useEffect(() => {
		fetchData();
	}, [fetchData, page]);

	const totalPages = 1; // For dummy data, only 1 page

	return (
		<ThemedView style={styles.container}>
			<View style={styles.headerRow}>
				<ThemedText type="title" style={styles.heading}>
					My Orders
				</ThemedText>
				<TouchableOpacity
					style={styles.refreshBtn}
					onPress={fetchData}
					disabled={loading}
					accessibilityLabel="Refresh orders">
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
				) : orders.length === 0 ? (
					<View style={styles.emptyState}>
						<ThemedText style={styles.emptyText}>No orders found.</ThemedText>
					</View>
				) : (
					<FlatList
						data={orders}
						keyExtractor={(item) => item.order_id}
						renderItem={({ item }) => {
							const badge = statusBadgeColor(item.order_status);
							return (
								<LinearGradient
									colors={["#f6faff", "#eaf3fb"]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 1 }}
									style={styles.orderCardGradient}>
									<TouchableOpacity
										activeOpacity={0.92}
										onPress={() => setSelectedOrder(item)}
										style={styles.orderItem}>
										<View style={styles.orderHeader}>
											<View style={styles.orderHeaderLeft}>
												<Receipt size={22} color={Colors.light.tint} />
												<ThemedText style={styles.orderIdText}>
													<CopyElement truncate content={item.order_id} />
												</ThemedText>
											</View>
											<ChevronRight
												size={22}
												color={Colors.light.textMutedForeground}
											/>
										</View>
										<View style={styles.orderDetailsRow}>
											<ThemedText style={styles.orderLabel}>
												Txn Ref:{" "}
											</ThemedText>
											<ThemedText style={styles.orderValue}>
												<CopyElement truncate content={item.payment_id} />
											</ThemedText>
										</View>
										<View style={styles.orderDetailsRow}>
											<ThemedText style={styles.orderLabel}>User:</ThemedText>
											<ThemedText style={styles.orderValue}>
												{item.user_name}
											</ThemedText>
										</View>

										<View style={styles.orderDetailsRow}>
											<ThemedText style={styles.orderLabel}>
												Order Date:
											</ThemedText>
											<ThemedText style={styles.orderValue}>
												{item.created_at
													? new Date(item.created_at).toLocaleString()
													: "-"}
											</ThemedText>
										</View>

										<View style={styles.orderDetailsRow}>
											<ThemedText style={styles.orderLabel}>
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
													{item.order_status}
												</ThemedText>
											</View>
										</View>
									</TouchableOpacity>
								</LinearGradient>
							);
						}}
						contentContainerStyle={{ paddingVertical: 8 }}
					/>
				)}
			</View>
			{/* Pagination (for real data, update totalPages and enable buttons) */}
			<View style={styles.paginationRow}>
				<TouchableOpacity
					style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
					onPress={() => setPage((p) => Math.max(1, p - 1))}
					disabled={page === 1}>
					<ThemedText style={styles.pageBtnText}>Previous</ThemedText>
				</TouchableOpacity>
				<ThemedText style={styles.pageNumText}>{page}</ThemedText>
				<TouchableOpacity
					style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
					onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
					disabled={page === totalPages}>
					<ThemedText style={styles.pageBtnText}>Next</ThemedText>
				</TouchableOpacity>
			</View>
			{selectedOrder && (
				<OrderView group={selectedOrder} onClose={() => setSelectedOrder(null)} />
			)}
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 44,
		paddingBottom: 22,
		backgroundColor: Colors.light.border,
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
		// boxShadow replaces shadow* props
		boxShadow: "0 1px 4px rgba(1,75,139,0.07)",
		color: Colors.light.textPrimaryForeground,
	},
	card: {
		backgroundColor: Colors.light.background,
		borderRadius: 22,
		marginHorizontal: 12,
		padding: 6,
		// boxShadow replaces shadow* props
		boxShadow: "0 2px 12px rgba(1,75,139,0.09)",
		flex: 1,
	},
	orderCardGradient: {
		borderRadius: 18,
		marginBottom: 16,
		overflow: "hidden",
		// boxShadow replaces shadow* props
		boxShadow: "0 2px 8px rgba(1,75,139,0.07)",
	},
	orderItem: {
		backgroundColor: Colors.light.card,
		borderRadius: 18,
		padding: 18,
		// boxShadow replaces shadow* props
		boxShadow: "0 1px 4px rgba(1,75,139,0.06)",
	},
	orderHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 10,
	},
	orderHeaderLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	orderIdText: {
		fontWeight: "bold",
		fontSize: 18,
		color: Colors.light.textPrimaryForeground,
		marginLeft: 8,
	},
	orderDetailsRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 4,
	},
	orderLabel: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textMutedForeground,
	},
	orderValue: {
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
		// boxShadow replaces shadow* props
		boxShadow: "0 1px 4px rgba(201,0,0,0.07)",
	},
	errorText: {
		color: Colors.light.destructive,
		fontWeight: "600",
		fontSize: 15,
		marginLeft: 8,
	},
	paginationRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 16,
		gap: 16,
	},
	pageBtn: {
		backgroundColor: Colors.light.accent,
		paddingVertical: 8,
		paddingHorizontal: 18,
		borderRadius: 8,
	},
	pageBtnDisabled: {
		backgroundColor: Colors.light.muted,
	},
	pageBtnText: {
		color: Colors.light.textPrimaryForeground,
		fontWeight: "600",
		fontSize: 15,
	},
	pageNumText: {
		fontWeight: "700",
		fontSize: 16,
		color: Colors.light.textPrimaryForeground,
	},
});
