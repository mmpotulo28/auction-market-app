import PopupModal from "@/components/PopupModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useWebSocket } from "@/context/WebSocketProvider";
import { iAuctionItem } from "@/lib/types";
import { useUser } from "@clerk/clerk-expo";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	Linking,
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const TWENTY_MINUTES = 20 * 60; // seconds

const CartScreen = () => {
	const { user } = useUser();
	const { items, highestBids, isLoading: auctionLoading } = useWebSocket();

	const [secondsLeft, setSecondsLeft] = useState(TWENTY_MINUTES);
	const [expired, setExpired] = useState(false);
	const [clearError, setClearError] = useState<string | null>(null);
	const [payfastLoading, setPayfastLoading] = useState(false);
	const [wonItems, setWonItems] = useState<iAuctionItem[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [previewItem, setPreviewItem] = useState<iAuctionItem | null>(null);
	const [showConsent, setShowConsent] = useState(false);

	// Compute won items from websocket context
	useEffect(() => {
		if (!user) return;
		if (!items || !highestBids) return;
		setIsLoading(true);

		const w = items
			.map((item) => {
				if (highestBids[item.id]?.userId === user.id) {
					return {
						...item,
						price: highestBids[item.id].amount,
					};
				}
			})
			.filter((item): item is iAuctionItem => item !== undefined);

		setWonItems(w);
		setIsLoading(false);
	}, [items, highestBids, user]);

	// Timer logic
	useEffect(() => {
		if (expired) return;
		if (secondsLeft <= 0) {
			setExpired(true);
			return;
		}
		const timer = setInterval(() => setSecondsLeft((s) => s - 1), 1000);
		return () => clearInterval(timer);
	}, [secondsLeft, expired]);

	const handleCheckout = async () => {
		// Guard: don't open if another modal is already open
		if (previewItem) return;
		setShowConsent(true);
	};

	const handleConsentConfirm = async () => {
		setShowConsent(false);
		setPayfastLoading(true);
		try {
			// Redirect to web cart page for payment
			await Linking.openURL("https://auctionmarket.tech/cart");
		} catch (e: any) {
			setClearError(e?.message || "Failed to open payment page. Please try again.");
			Alert.alert("Error", e?.message || "Failed to open payment page. Please try again.");
		}
		setPayfastLoading(false);
	};

	const formatTime = (secs: number) => {
		const m = Math.floor(secs / 60)
			.toString()
			.padStart(2, "0");
		const s = (secs % 60).toString().padStart(2, "0");
		return `${m}:${s}`;
	};

	return (
		<ThemedView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				<ThemedText style={styles.heading}>Your Cart</ThemedText>
				{expired ? (
					<View style={styles.alertCard}>
						<ThemedText style={styles.alertTitle}>Time Expired!</ThemedText>
						<ThemedText style={styles.alertDesc}>
							Your cart session has expired. All items have been released for the next
							auction.
						</ThemedText>
						{clearError && (
							<ThemedText style={styles.errorText}>{clearError}</ThemedText>
						)}
					</View>
				) : (
					<>
						<View style={styles.timerRow}>
							<ThemedText style={styles.timerLabel}>
								Time left to checkout:
							</ThemedText>
							<Text style={styles.timerText}>{formatTime(secondsLeft)}</Text>
						</View>
						<TouchableOpacity
							style={[
								styles.checkoutBtn,
								(wonItems.length === 0 || payfastLoading) && { opacity: 0.6 },
							]}
							onPress={handleCheckout}
							disabled={wonItems.length === 0 || payfastLoading}>
							<ThemedText style={styles.checkoutBtnText}>
								{payfastLoading ? "Redirecting..." : "Checkout"}
							</ThemedText>
						</TouchableOpacity>
						{(isLoading || auctionLoading) && (
							<ActivityIndicator
								size="large"
								color={Colors.light.tint}
								style={{ marginVertical: 24 }}
							/>
						)}
						{wonItems.length === 0 && !isLoading && !auctionLoading ? (
							<ThemedText style={styles.emptyText}>
								You have no items in your cart.
							</ThemedText>
						) : (
							<View style={styles.tableCard}>
								<View style={styles.tableHeader}>
									<Text style={styles.tableHead}>Image</Text>
									<Text style={styles.tableHead}>Title</Text>
									<Text style={styles.tableHead}>Description</Text>
									<Text style={styles.tableHead}>Price</Text>
								</View>
								{wonItems.map((item) => (
									<TouchableOpacity
										key={item.id}
										style={styles.tableRow}
										onPress={() => {
											// Guard: don't open if another modal is already open
											if (showConsent) return;
											setPreviewItem(item);
										}}
										activeOpacity={0.85}>
										<Image
											source={{ uri: item.image }}
											style={styles.itemImage}
											resizeMode="cover"
										/>
										<Text style={styles.tableCellTitle}>{item.title}</Text>
										<Text style={styles.tableCellDesc} numberOfLines={2}>
											{item.description}
										</Text>
										<Text style={styles.tableCellPrice}>R {item.price}</Text>
									</TouchableOpacity>
								))}
							</View>
						)}
					</>
				)}
			</ScrollView>
			{/* Preview Modal */}
			<Modal
				visible={!!previewItem}
				transparent
				animationType="fade"
				onRequestClose={() => setPreviewItem(null)}>
				<View style={styles.previewOverlay}>
					<View style={styles.previewModal}>
						<TouchableOpacity
							style={styles.previewCloseBtn}
							onPress={() => setPreviewItem(null)}>
							<Text style={styles.previewCloseText}>Close</Text>
						</TouchableOpacity>
						{previewItem && (
							<>
								<Text style={styles.previewTitle}>{previewItem.title}</Text>
								<Image
									source={{ uri: previewItem.image }}
									style={styles.previewImage}
									resizeMode="contain"
								/>
								<Text style={styles.previewDesc}>{previewItem.description}</Text>
								<Text style={styles.previewPrice}>R {previewItem.price}</Text>
							</>
						)}
					</View>
				</View>
			</Modal>
			{/* Consent Popup */}
			<PopupModal
				visible={showConsent}
				title="Complete Payment on Web"
				message="To complete your purchase, you will be redirected to our secure web checkout. Do you want to continue?"
				onConfirm={handleConsentConfirm}
				onCancel={() => setShowConsent(false)}
				confirmText="Continue"
				cancelText="Cancel"
			/>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 24,
		backgroundColor: Colors.light.background,
	},
	content: {
		padding: 18,
	},
	heading: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 18,
		color: Colors.light.textPrimaryForeground,
	},
	timerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 16,
	},
	timerLabel: {
		fontSize: 16,
		color: Colors.light.textMutedForeground,
	},
	timerText: {
		fontWeight: "bold",
		color: "#c90000",
		fontSize: 18,
	},
	checkoutBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
		marginBottom: 18,
	},
	checkoutBtnText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	alertCard: {
		backgroundColor: "#ffeaea",
		borderRadius: 12,
		padding: 24,
		alignItems: "center",
		marginBottom: 18,
	},
	alertTitle: {
		fontWeight: "bold",
		fontSize: 20,
		color: Colors.light.destructive,
		marginBottom: 8,
	},
	alertDesc: {
		color: Colors.light.textMutedForeground,
		fontSize: 15,
		textAlign: "center",
	},
	errorText: {
		color: Colors.light.destructive,
		marginTop: 8,
	},
	emptyText: {
		color: Colors.light.textMutedForeground,
		fontSize: 16,
		textAlign: "center",
		marginTop: 24,
	},
	tableCard: {
		backgroundColor: Colors.light.card,
		borderRadius: 14,
		padding: 0,
		marginTop: 8,
		overflow: "hidden",
	},
	tableHeader: {
		flexDirection: "row",
		backgroundColor: Colors.light.secondary,
		paddingVertical: 10,
		paddingHorizontal: 8,
	},
	tableHead: {
		flex: 1,
		fontWeight: "bold",
		fontSize: 15,
		color: Colors.light.textPrimaryForeground,
	},
	tableRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 12,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.light.muted,
	},
	itemImage: {
		width: 48,
		height: 48,
		borderRadius: 8,
		marginRight: 8,
	},
	tableCellTitle: {
		flex: 1,
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textPrimaryForeground,
	},
	tableCellDesc: {
		flex: 2,
		color: Colors.light.textSecondaryForeground,
		fontSize: 14,
		marginLeft: 8,
	},
	tableCellPrice: {
		flex: 1,
		fontWeight: "bold",
		fontSize: 15,
		color: Colors.light.tint,
		textAlign: "right",
	},
	previewOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.25)",
		justifyContent: "center",
		alignItems: "center",
	},
	previewModal: {
		width: "90%",
		backgroundColor: "#fff",
		borderRadius: 18,
		padding: 24,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.12,
		shadowRadius: 8,
		elevation: 6,
	},
	previewCloseBtn: {
		alignSelf: "flex-end",
		marginBottom: 8,
	},
	previewCloseText: {
		color: Colors.light.tint,
		fontWeight: "600",
		fontSize: 15,
	},
	previewTitle: {
		fontWeight: "bold",
		fontSize: 20,
		marginBottom: 8,
		color: Colors.light.textPrimaryForeground,
	},
	previewImage: {
		width: 260,
		height: 260,
		borderRadius: 10,
		marginBottom: 12,
	},
	previewDesc: {
		color: Colors.light.textSecondaryForeground,
		fontSize: 15,
		marginBottom: 8,
		textAlign: "center",
	},
	previewPrice: {
		fontWeight: "bold",
		fontSize: 18,
		color: Colors.light.tint,
	},
});

export default CartScreen;
