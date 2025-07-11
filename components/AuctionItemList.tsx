import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useWebSocket } from "@/context/WebSocketProvider";
import { iAuction, iBid } from "@/lib/types";
import { useUser } from "@clerk/clerk-expo";
import { Minus, Plus, UserCheck } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

interface AuctionItemListProps {
	auction?: iAuction;
	itemsPerPage?: number;
}

const AuctionItemList: React.FC<AuctionItemListProps> = ({ auction, itemsPerPage = 10 }) => {
	const { user } = useUser();
	const { placeBid, highestBids, items, isLoading, error, categories } = useWebSocket();

	const [proposedBids, setProposedBids] = useState<iBid[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);
	const [pendingBids, setPendingBids] = useState<string[]>([]);
	const [auctionNotStarted, setAuctionNotStarted] = useState(false);
	const [auctionClosed, setAuctionClosed] = useState(false);
	const [auctionEndTime, setAuctionEndTime] = useState<Date>(new Date());
	const [selected, setSelected] = useState<string | null>(null);

	useEffect(() => {
		if (auction) {
			const auctionStart = new Date(auction.start_time).getTime();
			const auctionEnd = auctionStart + (auction.duration || 0) * 60 * 1000;
			const now = Date.now();
			setAuctionNotStarted(now < auctionStart);
			setAuctionClosed(now > auctionEnd);
			setAuctionEndTime(new Date(auctionEnd));
		}
	}, [auction]);

	const filteredItems = useMemo(
		() =>
			items.filter((item) =>
				selectedCategories.length > 0 ? selectedCategories.includes(item.category) : true,
			),
		[items, selectedCategories],
	);

	const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
	const paginatedItems = filteredItems.slice(
		(currentPage - 1) * itemsPerPage,
		currentPage * itemsPerPage,
	);

	const adjustBid = useCallback(
		(id: string, delta: number) => {
			setProposedBids((prevBids) => {
				const existingBid = prevBids.find((bid) => bid.itemId === id);
				if (existingBid) {
					return prevBids.map((bid) =>
						bid.itemId === id
							? {
									...bid,
									amount: Math.max(
										bid.amount + delta,
										items.find((item) => item.id === id)?.price || 0,
									),
							  }
							: bid,
					);
				} else {
					const highestBidAmount = highestBids[id]?.amount || 0;
					const itemPrice = items.find((item) => item.id === id)?.price || 0;
					return [
						...prevBids,
						{
							itemId: id,
							amount: Math.max(highestBidAmount, itemPrice) + delta,
							userId: user?.id || "",
							timestamp: new Date().toISOString(),
						},
					];
				}
			});
		},
		[items, highestBids, user],
	);

	const submitBid = useCallback(
		async (itemId: string) => {
			if (!user) {
				Alert.alert("Login required", "Please log in to place a bid.");
				return;
			}
			const currentBid = proposedBids.find((bid) => bid.itemId === itemId)?.amount || 0;
			setPendingBids((prev) => [...prev, itemId]);
			await placeBid(itemId, currentBid, user.id);
			setPendingBids((prev) => prev.filter((bid) => bid !== itemId));
		},
		[proposedBids, user, placeBid],
	);

	const ownedCount = useMemo(() => {
		if (!user) return 0;
		return Object.values(highestBids).filter((bid) => bid.userId === user.id).length;
	}, [highestBids, user]);

	if (!auction) {
		return (
			<ThemedView style={styles.center}>
				<ThemedText style={styles.errorText}>No auction data available.</ThemedText>
			</ThemedView>
		);
	}

	if (auctionClosed) {
		return (
			<ThemedView style={styles.center}>
				<View style={styles.closedCard}>
					<ThemedText style={styles.closedTitle}>Auction Closed</ThemedText>
					<ThemedText>
						You have <Text style={styles.bold}>{ownedCount}</Text> item
						{ownedCount !== 1 && "s"} in your cart.
					</ThemedText>
					<TouchableOpacity style={styles.cartBtn} onPress={() => {}}>
						<ThemedText style={styles.cartBtnText}>Go to Cart</ThemedText>
					</TouchableOpacity>
				</View>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			{isLoading && (
				<View style={styles.loadingRow}>
					<ActivityIndicator size="large" color={Colors.light.tint} />
					<ThemedText style={styles.loadingText}>Loading auction items...</ThemedText>
				</View>
			)}
			{error && error.length > 0 && (
				<View style={styles.errorCard}>
					{error.map((err, idx) => (
						<ThemedText key={idx} style={styles.errorText}>
							{err}
						</ThemedText>
					))}
				</View>
			)}
			<FlatList
				data={paginatedItems}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				ListHeaderComponent={
					<View style={styles.header}>
						<ThemedText style={styles.heading}>{auction.name}</ThemedText>
						<ThemedText style={styles.subheading}>
							{auctionNotStarted
								? "Auction not started"
								: `Auction is live! Ends at: ${auctionEndTime.toLocaleString()}`}
						</ThemedText>
					</View>
				}
				renderItem={({ item }) => {
					const highestBid = highestBids[item.id];
					const currentBid =
						proposedBids.find((bid) => bid.itemId === item.id)?.amount ||
						highestBid?.amount ||
						item.price;
					const isOwner = highestBid?.userId === user?.id;
					const isSelected = selected === item.id;
					return (
						<TouchableOpacity
							style={[
								styles.card,
								isSelected && { borderColor: Colors.light.tint, borderWidth: 2 },
							]}
							activeOpacity={0.96}
							onPress={() => setSelected(item.id)}>
							{isOwner && (
								<View style={styles.ownerIcon}>
									<UserCheck size={18} color={Colors.light.tint} />
								</View>
							)}
							<View style={styles.cardHeader}>
								<ThemedText style={styles.title}>{item.title}</ThemedText>
								<View style={styles.tagsRow}>
									<View style={styles.badge}>
										<ThemedText style={styles.badgeText}>
											Highest Bid: R{" "}
											{Number(highestBid?.amount || item.price).toFixed(2)}
										</ThemedText>
									</View>
									<View style={[styles.badge, styles.badgeSecondary]}>
										<ThemedText style={styles.badgeText}>
											{item.condition?.toUpperCase()}
										</ThemedText>
									</View>
								</View>
							</View>
							<View style={styles.cardContent}>
								{item.image ? (
									<Image
										source={{ uri: item.image }}
										style={styles.image}
										resizeMode="cover"
									/>
								) : (
									<View style={styles.imagePlaceholder}>
										<ThemedText>No Image</ThemedText>
									</View>
								)}
								<ThemedText style={styles.description}>
									{item.description}
								</ThemedText>
							</View>
							<View style={styles.cardFooter}>
								<TouchableOpacity
									style={styles.bidBtn}
									onPress={() => adjustBid(item.id, -10)}
									disabled={
										currentBid <= (highestBid?.amount || item.price) ||
										auctionClosed ||
										auctionNotStarted
									}>
									<Minus size={18} color={Colors.light.tint} />
								</TouchableOpacity>
								<TouchableOpacity
									style={[styles.bidBtn, styles.bidBtnMain]}
									onPress={() => submitBid(item.id)}
									disabled={
										currentBid <= (highestBid?.amount || item.price) ||
										pendingBids.includes(item.id) ||
										auctionClosed ||
										auctionNotStarted
									}>
									<ThemedText style={styles.bidBtnText}>
										{currentBid > (highestBid?.amount || item.price) &&
											!pendingBids.includes(item.id) &&
											"Submit "}
										R {Number(currentBid).toFixed(2)}
									</ThemedText>
									{pendingBids.includes(item.id) && (
										<ActivityIndicator
											size="small"
											color="#fff"
											style={{ marginLeft: 6 }}
										/>
									)}
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.bidBtn}
									onPress={() => adjustBid(item.id, 10)}
									disabled={auctionClosed || auctionNotStarted}>
									<Plus size={18} color={Colors.light.tint} />
								</TouchableOpacity>
							</View>
						</TouchableOpacity>
					);
				}}
				ListFooterComponent={
					<View style={styles.paginationRow}>
						<TouchableOpacity
							style={[styles.pageBtn, currentPage === 1 && styles.pageBtnDisabled]}
							onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
							disabled={currentPage === 1}>
							<ThemedText style={styles.pageBtnText}>Previous</ThemedText>
						</TouchableOpacity>
						<ThemedText style={styles.pageNumText}>{currentPage}</ThemedText>
						<TouchableOpacity
							style={[
								styles.pageBtn,
								currentPage === totalPages && styles.pageBtnDisabled,
							]}
							onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}>
							<ThemedText style={styles.pageBtnText}>Next</ThemedText>
						</TouchableOpacity>
					</View>
				}
			/>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 12,
		backgroundColor: Colors.light.background,
	},
	center: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
	},
	errorCard: {
		backgroundColor: "#ffeaea",
		borderRadius: 10,
		padding: 12,
		marginBottom: 10,
	},
	errorText: {
		color: Colors.light.destructive,
		fontWeight: "600",
		fontSize: 15,
	},
	header: {
		marginBottom: 18,
		alignItems: "center",
	},
	heading: {
		fontSize: 24,
		fontWeight: "bold",
		color: Colors.light.textPrimaryForeground,
		marginBottom: 4,
	},
	subheading: {
		color: Colors.light.textMutedForeground,
		fontSize: 15,
	},
	card: {
		backgroundColor: Colors.light.card,
		borderRadius: 16,
		padding: 16,
		marginBottom: 18,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	cardHeader: {
		marginBottom: 8,
	},
	title: {
		fontWeight: "bold",
		fontSize: 18,
		color: Colors.light.textPrimaryForeground,
	},
	tagsRow: {
		flexDirection: "row",
		gap: 8,
		marginTop: 4,
	},
	badge: {
		backgroundColor: "#e0eaff",
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 4,
		marginRight: 6,
	},
	badgeSecondary: {
		backgroundColor: Colors.light.secondary,
	},
	badgeText: {
		fontWeight: "600",
		fontSize: 13,
		color: Colors.light.textMutedForeground,
	},
	cardContent: {
		marginBottom: 8,
	},
	image: {
		width: "100%",
		height: 180,
		borderRadius: 12,
		marginBottom: 8,
		backgroundColor: Colors.light.muted,
	},
	imagePlaceholder: {
		width: "100%",
		height: 180,
		borderRadius: 12,
		marginBottom: 8,
		backgroundColor: Colors.light.muted,
		alignItems: "center",
		justifyContent: "center",
	},
	description: {
		color: Colors.light.textSecondaryForeground,
		fontSize: 15,
	},
	cardFooter: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 8,
	},
	bidBtn: {
		backgroundColor: Colors.light.muted,
		borderRadius: 8,
		paddingVertical: 8,
		paddingHorizontal: 18,
		alignItems: "center",
		justifyContent: "center",
		marginHorizontal: 2,
		flexDirection: "row",
	},
	bidBtnMain: {
		backgroundColor: Colors.light.tint,
	},
	bidBtnText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 15,
	},
	ownerIcon: {
		position: "absolute",
		top: 10,
		right: 10,
		backgroundColor: "#e0ffe6",
		borderRadius: 12,
		padding: 4,
		zIndex: 2,
	},
	paginationRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 12,
		gap: 16,
	},
	pageBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 8,
		paddingHorizontal: 18,
		borderRadius: 8,
	},
	pageBtnDisabled: {
		backgroundColor: Colors.light.muted,
	},
	pageBtnText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 15,
	},
	pageNumText: {
		fontWeight: "700",
		fontSize: 16,
		color: Colors.light.textPrimaryForeground,
	},
	closedCard: {
		backgroundColor: "#ffeaea",
		borderRadius: 16,
		padding: 32,
		alignItems: "center",
	},
	closedTitle: {
		fontWeight: "bold",
		fontSize: 22,
		marginBottom: 8,
		color: Colors.light.destructive,
	},
	bold: {
		fontWeight: "bold",
	},
	cartBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 18,
	},
	cartBtnText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	listContent: {
		paddingBottom: 24,
	},
	loadingRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 16,
	},
	loadingText: {
		marginLeft: 10,
		color: Colors.light.textMutedForeground,
		fontSize: 16,
	},
});

export default AuctionItemList;
