import CopyElement from "@/components/CopyElement";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAccountContext } from "@/context/AccountContext";
import { useWebSocket } from "@/context/WebSocketProvider";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { Bell, CreditCard, LogOut, Receipt, User2 } from "lucide-react-native";
import React from "react";
import { Alert, Image, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const QuickActions = [
	{
		icon: Receipt,
		label: "Orders",
		navigateTo: "/(account)/orders",
	},
	{
		icon: CreditCard,
		label: "Transactions",
		navigateTo: "/(account)/transactions",
	},
	{
		icon: Bell,
		label: "Notifications",
		navigateTo: "/(account)/notifications",
	},
];

interface AccountData {
	bids: {
		id: string;
		label: string;
		subLabel: string;
		date: string;
	}[];
	orders: {
		id: string;
		label: string;
		subLabel: string;
		date: string;
	}[];
	transactions: {
		id: string;
		label: string;
		subLabel: string;
		date: string;
	}[];
}

const AccountCards = [
	{
		icon: User2,
		label: "Bids",
		dataKey: "bids",
		navigateTo: "/(account)/profile",
	},
	{
		icon: Receipt,
		label: "Orders",
		dataKey: "orders",
		navigateTo: "/(account)/orders",
	},
	{
		icon: CreditCard,
		label: "Transactions",
		dataKey: "transactions",
		navigateTo: "/(account)/transactions",
	},
];

const AccountScreen = () => {
	const { user } = useUser();
	const { orders, transactions } = useAccountContext();
	const { bids, items } = useWebSocket();

	const data: AccountData = {
		bids:
			bids?.map((bid) => ({
				id: bid.itemId,
				label: items.find((item) => item.id === bid.itemId)?.title || "Unknown Item",
				subLabel: `R ${bid.amount.toFixed(2)}`,
				date: bid.timestamp ? new Date(bid.timestamp).toLocaleString() : "-",
			})) || [],
		orders: orders.map((order) => ({
			id: order.order_id,
			label: order.order_id,
			subLabel: `R${order.total_amount} - ${order.order_status}`,
			date: order.created_at ? new Date(order.created_at).toLocaleString() : "-",
		})),
		transactions: transactions.map((tx) => ({
			id: tx.pf_payment_id as string,
			label: tx.m_payment_id as string,
			subLabel: tx.payment_status as string,
			date: tx.created_at ? new Date(tx.created_at).toLocaleString() : ("-" as string),
		})),
	};

	const { signOut } = useAuth();
	const router = useRouter();

	const handleLogout = async () => {
		try {
			await signOut();
			// Optionally clear AsyncStorage or any other app state here
			router.replace("/(auth)/sign-in");
		} catch (e) {
			console.error("Logout error:", e);
			Alert.alert("Error", "Failed to log out.");
		}
	};

	return (
		<ThemedView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				{/* Profile Card */}
				<ThemedView type="card" style={styles.card}>
					<View style={styles.profileRow}>
						{user?.imageUrl ? (
							<Image source={{ uri: user.imageUrl }} style={styles.avatar} />
						) : (
							<View style={styles.avatarPlaceholder}>
								<User2 size={38} color={Colors.light.tint} />
							</View>
						)}
						<View style={styles.profileInfo}>
							<ThemedText style={styles.profileName}>
								{user?.fullName || "Your Name"}
							</ThemedText>
							<ThemedText style={styles.profileEmail}>
								{user?.primaryEmailAddress?.emailAddress || "your@email.com"}
							</ThemedText>
						</View>
					</View>
					<TouchableOpacity
						style={styles.editProfileBtn}
						onPress={() => router.push("/(account)/profile")}>
						<ThemedText style={styles.editProfileText}>Edit Profile</ThemedText>
					</TouchableOpacity>
				</ThemedView>

				{/* Quick Actions */}
				<ThemedView style={styles.quickActions}>
					{QuickActions.map((action) => (
						<ThemedView
							key={action.label}
							type="card"
							style={{ flex: 1, borderRadius: 14 }}>
							<TouchableOpacity
								style={styles.actionCard}
								onPress={() => router.push(action.navigateTo as any)}>
								<action.icon size={28} color={Colors.light.accent} />
								<ThemedText style={styles.actionLabel}>{action.label}</ThemedText>
							</TouchableOpacity>
						</ThemedView>
					))}
				</ThemedView>

				{AccountCards?.map((card) => (
					<ThemedView type="card" key={card.dataKey} style={styles.accountCard}>
						<ThemedView type="card" style={styles.accountCardHeader}>
							<card.icon
								size={22}
								color={Colors.light.tint}
								style={styles.accountCardIcon}
							/>
							<ThemedText style={styles.sectionTitle}>Recent {card.label}</ThemedText>
						</ThemedView>
						<View style={styles.accountCardList}>
							{data[card.dataKey as keyof AccountData]?.length > 0 ? (
								data[card.dataKey as keyof AccountData]
									?.slice(0, 3)
									?.map((item, index) => (
										<View key={item.id} style={styles.accountCardItem}>
											<View style={styles.accountCardItemText}>
												<ThemedText style={styles.accountCardItemLabel}>
													<CopyElement truncate content={item.label} />
												</ThemedText>
												<ThemedText style={styles.accountCardItemSubLabel}>
													{item.subLabel}
												</ThemedText>
											</View>
											<ThemedText style={styles.accountCardItemDate}>
												{item.date}
											</ThemedText>
										</View>
									))
							) : (
								<View style={styles.accountCardEmpty}>
									<ThemedText style={styles.accountCardEmptyText}>
										No recent {card.label.toLowerCase()} found.
									</ThemedText>
								</View>
							)}
						</View>
						<TouchableOpacity
							onPress={() => router.push(card.navigateTo as any)}
							style={styles.sectionBtn}>
							<ThemedText style={styles.sectionBtnText}>
								View All {card.label}
							</ThemedText>
						</TouchableOpacity>
					</ThemedView>
				))}

				{/* Log Out */}
				<View style={styles.section}>
					<TouchableOpacity
						style={styles.logoutBtn}
						activeOpacity={0.8}
						onPress={handleLogout}>
						<LogOut size={20} color="#fff" style={{ marginRight: 8 }} />
						<ThemedText style={styles.logoutText}>Log Out</ThemedText>
					</TouchableOpacity>
				</View>
			</ScrollView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 44,
	},
	scrollContent: {
		paddingBottom: 32,
	},
	card: {
		borderRadius: 18,
		padding: 20,
		marginHorizontal: 18,
		marginBottom: 18,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	profileRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 12,
	},
	avatar: {
		width: 64,
		height: 64,
		borderRadius: 32,
		marginRight: 16,
		backgroundColor: Colors.light.muted,
	},
	avatarPlaceholder: {
		width: 64,
		height: 64,
		borderRadius: 32,
		marginRight: 16,
		backgroundColor: Colors.light.muted,
		alignItems: "center",
		justifyContent: "center",
	},
	profileInfo: {
		flex: 1,
	},
	profileName: {
		fontWeight: "bold",
		fontSize: 20,
		color: Colors.light.textPrimaryForeground,
	},
	profileEmail: {
		color: Colors.light.textMutedForeground,
		fontSize: 15,
		marginTop: 2,
	},
	editProfileBtn: {
		alignSelf: "flex-end",
		backgroundColor: Colors.light.tint,
		paddingVertical: 8,
		paddingHorizontal: 18,
		borderRadius: 8,
	},
	editProfileText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 15,
	},
	quickActions: {
		flexDirection: "row",
		marginHorizontal: 18,
		gap: 12,
		marginBottom: 24,
	},
	actionCard: {
		flex: 1,
		borderRadius: 14,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		width: "100%",
	},
	actionLabel: {
		marginTop: 8,
		fontWeight: "600",
		fontSize: 15,
	},
	section: {
		borderRadius: 16,
		marginHorizontal: 18,
		marginBottom: 18,
		padding: 18,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
	},
	sectionTitle: {
		fontWeight: "700",
		fontSize: 16,
	},
	placeholderCard: {
		borderRadius: 10,
		padding: 16,
		alignItems: "center",
		marginBottom: 8,
	},
	placeholderText: {
		color: Colors.light.textMutedForeground,
		fontSize: 15,
		marginBottom: 8,
		textAlign: "center",
	},
	sectionBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 8,
		paddingHorizontal: 18,
		borderRadius: "0 0 8 8",
	},
	sectionBtnText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 14,
	},
	logoutBtn: {
		marginTop: 8,
		backgroundColor: Colors.light.destructive,
		paddingVertical: 14,
		borderRadius: 10,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
	},
	logoutText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	accountCard: {
		borderRadius: 18,
		marginHorizontal: 18,
		marginBottom: 18,
		padding: 0,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
		overflow: "hidden",
	},
	accountCardHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-start",
		paddingHorizontal: 18,
		paddingTop: 18,
		paddingBottom: 8,
		borderBottomWidth: 0.5,
		borderBottomColor: Colors.light.muted,
		gap: 10,
	},
	accountCardIcon: {
		padding: 0,
	},
	accountCardList: {
		paddingHorizontal: 18,
		paddingVertical: 10,
	},
	accountCardItem: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 10,
		borderBottomWidth: 0,
		borderBottomColor: "#f0f0f0",
	},
	accountCardItemText: {
		flex: 1,
	},
	accountCardItemLabel: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textPrimaryForeground,
	},
	accountCardItemSubLabel: {
		fontSize: 13,
		color: Colors.light.textMutedForeground,
		marginTop: 2,
	},
	accountCardItemDate: {
		fontSize: 12,
		color: Colors.light.textMutedForeground,
		marginLeft: 10,
		textAlign: "right",
		maxWidth: 110,
	},
	accountCardEmpty: {
		alignItems: "center",
		paddingVertical: 18,
	},
	accountCardEmptyText: {
		color: Colors.light.textMutedForeground,
		fontSize: 15,
		fontStyle: "italic",
	},
});

export default AccountScreen;
