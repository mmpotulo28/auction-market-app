import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/Colors";
import { iGroupedOrder, iOrder } from "@/lib/types";
import { Receipt, X } from "lucide-react-native";
import React from "react";
import { Modal, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

interface OrderViewProps {
	group: iGroupedOrder;
	onClose: () => void;
}

const statusBadgeColor = (status: string) => {
	switch (status.toLowerCase()) {
		case "completed":
		case "complete":
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

const OrderView: React.FC<OrderViewProps> = ({ group, onClose }) => {
	const badge = statusBadgeColor(group.order_status);

	return (
		<Modal visible={true} transparent animationType="slide" onRequestClose={onClose}>
			<View style={styles.overlay}>
				<View style={styles.modal}>
					<View style={styles.header}>
						<View style={styles.headerLeft}>
							<Receipt size={22} color={Colors.light.tint} />
							<ThemedText style={styles.headerTitle}>{group.order_id}</ThemedText>
						</View>
						<TouchableOpacity onPress={onClose} style={styles.closeBtn}>
							<X size={22} color={Colors.light.textMutedForeground} />
						</TouchableOpacity>
					</View>
					<View style={[styles.statusBadge, { backgroundColor: badge.backgroundColor }]}>
						<ThemedText style={[styles.statusBadgeText, { color: badge.color }]}>
							{group.order_status}
						</ThemedText>
					</View>
					<ScrollView contentContainerStyle={styles.scrollContent}>
						<View style={styles.infoCard}>
							<View style={styles.infoRow}>
								<ThemedText style={styles.infoLabel}>Customer:</ThemedText>
								<ThemedText style={styles.infoValue}>{group.user_name}</ThemedText>
							</View>
							<View style={styles.infoRow}>
								<ThemedText style={styles.infoLabel}>Email:</ThemedText>
								<ThemedText style={styles.infoValue}>{group.user_email}</ThemedText>
							</View>
							<View style={styles.infoRow}>
								<ThemedText style={styles.infoLabel}>Created At:</ThemedText>
								<ThemedText style={styles.infoValue}>
									{group.created_at
										? new Date(group.created_at).toLocaleString()
										: "-"}
								</ThemedText>
							</View>
							<View style={styles.infoRow}>
								<ThemedText style={styles.infoLabel}>Payment Ref:</ThemedText>
								<ThemedText style={styles.infoValue}>{group.payment_id}</ThemedText>
							</View>
							<View style={styles.infoRow}>
								<ThemedText style={styles.infoLabel}>Items Count:</ThemedText>
								<ThemedText style={styles.infoValue}>
									{group.items_count}
								</ThemedText>
							</View>
							<View style={styles.infoRow}>
								<ThemedText style={styles.infoLabel}>Total Amount:</ThemedText>
								<ThemedText style={styles.infoValue}>
									R {Number(group.total_amount).toFixed(2)}
								</ThemedText>
							</View>
						</View>
						<View style={styles.itemsSection}>
							<ThemedText style={styles.itemsTitle}>Order Items</ThemedText>
							{group.orders && group.orders.length > 0 ? (
								group.orders.map((order: iOrder) => (
									<View key={order.id} style={styles.itemCard}>
										<View style={styles.itemRow}>
											<ThemedText style={styles.itemName}>
												{order.item_name}
											</ThemedText>
											<ThemedText style={styles.itemPrice}>
												R {Number(order.price).toFixed(2)}
											</ThemedText>
										</View>
										<View style={styles.itemRow}>
											<ThemedText style={styles.itemStatus}>
												{order.order_status}
											</ThemedText>
										</View>
									</View>
								))
							) : (
								<ThemedText style={styles.noItemsText}>
									No items found for this order.
								</ThemedText>
							)}
						</View>
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
		width: "92%",
		maxHeight: "90%",
		backgroundColor: "#fff",
		borderRadius: 22,
		paddingTop: 0,
		paddingBottom: 16,
		paddingHorizontal: 0,
		alignItems: "center",
		boxShadow: "0 2px 12px rgba(1,75,139,0.13)",
		elevation: 8,
	},
	header: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 18,
		paddingTop: 18,
		paddingBottom: 8,
		borderTopLeftRadius: 22,
		borderTopRightRadius: 22,
		backgroundColor: "#eaf3fb",
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	headerTitle: {
		fontWeight: "bold",
		fontSize: 20,
		color: Colors.light.textPrimaryForeground,
		marginLeft: 8,
	},
	closeBtn: {
		padding: 6,
		borderRadius: 8,
		backgroundColor: Colors.light.muted,
		alignItems: "center",
		justifyContent: "center",
	},
	statusBadge: {
		alignSelf: "center",
		borderRadius: 8,
		paddingVertical: 6,
		paddingHorizontal: 18,
		marginTop: 8,
		marginBottom: 10,
	},
	statusBadgeText: {
		fontWeight: "700",
		fontSize: 15,
	},
	scrollContent: {
		paddingBottom: 24,
		paddingHorizontal: 18,
		minWidth: "100%",
	},
	infoCard: {
		backgroundColor: Colors.light.secondary,
		borderRadius: 14,
		padding: 16,
		marginBottom: 18,
		width: "100%",
		boxShadow: "0 1px 4px rgba(1,75,139,0.06)",
	},
	infoRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 6,
	},
	infoLabel: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textMutedForeground,
	},
	infoValue: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textPrimaryForeground,
	},
	itemsSection: {
		width: "100%",
		marginBottom: 10,
	},
	itemsTitle: {
		fontWeight: "700",
		fontSize: 16,
		marginBottom: 8,
		color: Colors.light.textPrimaryForeground,
	},
	itemCard: {
		backgroundColor: Colors.light.muted,
		borderRadius: 10,
		padding: 12,
		marginBottom: 8,
		boxShadow: "0 1px 4px rgba(1,75,139,0.04)",
	},
	itemRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	itemName: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textPrimaryForeground,
		flex: 2,
	},
	itemPrice: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textSecondaryForeground,
		flex: 1,
		textAlign: "right",
	},
	itemStatus: {
		fontWeight: "600",
		fontSize: 13,
		color: Colors.light.textMutedForeground,
		flex: 1,
		textAlign: "right",
	},
	noItemsText: {
		color: Colors.light.textMutedForeground,
		fontSize: 15,
		textAlign: "center",
		marginTop: 8,
	},
});

export default OrderView;
