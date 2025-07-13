import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { AlertTriangle, Bell, CheckCircle2, Info, RotateCcw, XCircle } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	SafeAreaView,
	StyleSheet,
	Switch,
	TouchableOpacity,
	View,
} from "react-native";

type NotificationType = "info" | "warning" | "error" | "success" | "default";

interface Notification {
	id: string;
	message: string;
	type: NotificationType;
	read: boolean;
	created_at?: string;
}

const typeIcon = {
	info: <Info size={22} color="#1976c5" />,
	warning: <AlertTriangle size={22} color="#eab308" />,
	error: <XCircle size={22} color="#c90000" />,
	success: <CheckCircle2 size={22} color="#22c55e" />,
	default: <Bell size={22} color={Colors.light.textMutedForeground} />,
};

const DUMMY_NOTIFICATIONS: Notification[] = [
	{
		id: "1",
		message: "Your order #1234 has been shipped.",
		type: "success",
		read: false,
		created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
	},
	{
		id: "2",
		message: "Payment for order #1233 failed.",
		type: "error",
		read: false,
		created_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
	},
	{
		id: "3",
		message: "Welcome to Auction Market SA!",
		type: "info",
		read: true,
		created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
	},
	{
		id: "4",
		message: "Your bid was outbid on item #567.",
		type: "warning",
		read: true,
		created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
	},
];

export default function NotificationsScreen() {
	const [notifications, setNotifications] = useState<Notification[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [showOld, setShowOld] = useState(false);

	useEffect(() => {
		fetchNotifications();
	}, []);

	const fetchNotifications = async () => {
		setLoading(true);
		setError(null);
		// Simulate API call
		setTimeout(() => {
			setNotifications(DUMMY_NOTIFICATIONS);
			setLoading(false);
		}, 800);
	};

	const markAsRead = (id: string) => {
		setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
	};

	const now = Date.now();
	const filteredNotifications = notifications.filter((n) => {
		const created = n.created_at ? new Date(n.created_at).getTime() : 0;
		const isOld = n.read && now - created > 5 * 60 * 1000;
		const isNew = !isOld;
		return showOld ? isOld : isNew;
	});

	return (
		<SafeAreaView style={{ flex: 1, paddingTop: 24 }}>
			<ThemedView style={styles.container}>
				<View style={styles.headerRow}>
					<View style={styles.headerLeft}>
						<Bell size={28} color={Colors.light.tint} />
						<ThemedText type="title" style={styles.heading}>
							Notifications
						</ThemedText>
					</View>
					<View style={styles.headerControls}>
						<View style={styles.switchRow}>
							<Switch
								value={showOld}
								onValueChange={setShowOld}
								thumbColor={Colors.light.tint}
								trackColor={{ false: "#e0eaff", true: Colors.light.tint }}
							/>
							<ThemedText style={styles.switchLabel}>
								{showOld ? "Show Old" : "Show New"}
							</ThemedText>
						</View>
						<TouchableOpacity
							style={styles.refreshBtn}
							onPress={fetchNotifications}
							disabled={loading}
							accessibilityLabel="Refresh notifications">
							<RotateCcw size={22} color={Colors.light.tint} />
						</TouchableOpacity>
					</View>
				</View>
				{error && (
					<View style={styles.errorCard}>
						<XCircle size={20} color={Colors.light.destructive} />
						<ThemedText style={styles.errorText}>{error}</ThemedText>
					</View>
				)}
				<ThemedView type="card" style={styles.card}>
					{loading ? (
						<ActivityIndicator
							size="large"
							color={Colors.light.tint}
							style={{ marginVertical: 32 }}
						/>
					) : filteredNotifications.length === 0 ? (
						<View style={styles.emptyState}>
							<Bell size={40} color={Colors.light.textMutedForeground} />
							<ThemedText style={styles.emptyText}>
								No notifications found.
							</ThemedText>
						</View>
					) : (
						<FlatList
							data={filteredNotifications}
							keyExtractor={(item) => item.id}
							renderItem={({ item }) => (
								<View
									style={[
										styles.notificationItem,
										item.read
											? styles.notificationRead
											: styles.notificationUnread,
									]}>
									<View style={styles.notificationIcon}>
										{typeIcon[item.type] || typeIcon.default}
									</View>
									<View style={styles.notificationContent}>
										<View style={styles.notificationMessageRow}>
											<ThemedText style={styles.notificationMessage}>
												{item.message}
											</ThemedText>
											{item.read && (
												<CheckCircle2
													size={18}
													color="#22c55e"
													style={{ marginLeft: 6 }}
												/>
											)}
										</View>
										<ThemedText style={styles.notificationDate}>
											{item.created_at
												? new Date(item.created_at).toLocaleString()
												: "-"}
										</ThemedText>
									</View>
									{!item.read && (
										<TouchableOpacity
											style={styles.markReadBtn}
											onPress={() => markAsRead(item.id)}>
											<ThemedText style={styles.markReadBtnText}>
												Mark as read
											</ThemedText>
										</TouchableOpacity>
									)}
								</View>
							)}
							contentContainerStyle={{ paddingVertical: 8 }}
						/>
					)}
				</ThemedView>
			</ThemedView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingVertical: 24,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginHorizontal: 18,
		marginBottom: 12,
	},
	headerLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	heading: {
		fontSize: 24,
		fontWeight: "bold",
		marginLeft: 8,
	},
	headerControls: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	switchRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		marginRight: 8,
	},
	switchLabel: {
		fontSize: 15,
		color: Colors.light.textMutedForeground,
		marginLeft: 4,
	},
	refreshBtn: {
		padding: 8,
		borderRadius: 8,
		backgroundColor: Colors.light.muted,
		alignItems: "center",
		justifyContent: "center",
	},
	card: {
		borderRadius: 18,
		marginHorizontal: 18,
		padding: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
		flex: 1,
	},
	notificationItem: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 14,
		paddingHorizontal: 8,
		borderRadius: 12,
		marginBottom: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.04,
		shadowRadius: 2,
		elevation: 1,
	},
	notificationUnread: {
		borderLeftWidth: 4,
		borderLeftColor: Colors.light.tint,
		opacity: 1,
	},
	notificationRead: {
		borderLeftWidth: 4,
		borderLeftColor: "#e0eaff",
		opacity: 0.6,
	},
	notificationIcon: {
		marginRight: 14,
	},
	notificationContent: {
		flex: 1,
	},
	notificationMessageRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 2,
	},
	notificationMessage: {
		fontWeight: "600",
		fontSize: 16,
		color: Colors.light.textPrimaryForeground,
	},
	notificationDate: {
		fontSize: 13,
		color: Colors.light.textMutedForeground,
		marginTop: 2,
	},
	markReadBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 8,
		marginLeft: 10,
	},
	markReadBtnText: {
		color: "#fff",
		fontWeight: "600",
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
	},
	errorText: {
		color: Colors.light.destructive,
		fontWeight: "600",
		fontSize: 15,
		marginLeft: 8,
	},
});
