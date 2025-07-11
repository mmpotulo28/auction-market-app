import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useWebSocket } from "@/context/WebSocketProvider";
import { iAuction, iBid, iSize } from "@/lib/types";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { ChevronDown, ChevronUp, Filter, Minus, Plus, UserCheck, X } from "lucide-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	Modal,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";
import { toast } from "sonner-native";
import CountdownTimer from "./CountdownTimer";

interface AuctionItemListProps {
	auction?: iAuction;
	itemsPerPage?: number;
}

const AuctionItemList: React.FC<AuctionItemListProps> = ({ auction, itemsPerPage = 10 }) => {
	const { user } = useUser();
	const router = useRouter();
	const [showFilterModal, setShowFilterModal] = useState(false);
	const [selected, setSelected] = useState<string | null>(null);

	const { placeBid, highestBids, items, isLoading, error, categories } = useWebSocket();

	const [proposedBids, setProposedBids] = useState<iBid[]>([]);

	const [currentPage, setCurrentPage] = useState(1);
	const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);
	const [priceRange, setPriceRange] = useState<[number, number]>([0, 20000]);
	const [selectedConditions, setSelectedConditions] = useState<Set<string>>(
		new Set(["new", "used"]),
	);
	const [pendingBids, setPendingBids] = useState<string[]>([]);
	const [showBidHistory, setShowBidHistory] = useState(false);
	const [auctionNotStarted, setAuctionNotStarted] = useState(false);
	const [auctionClosed, setAuctionClosed] = useState(false);
	const [auctionEndTime, setAuctionEndTime] = useState<Date>(new Date());
	const [showTimerPopup, setShowTimerPopup] = useState(true);
	const [timerMinimized, setTimerMinimized] = useState(false);

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

	// User bid history
	const userBids = useMemo(() => {
		if (!user) return [];
		const allBids = Object.values(highestBids)
			.filter((bid) => bid.userId === user.id)
			.map((bid) => ({
				...bid,
				item: items.find((item) => item.id === bid.itemId),
			}))
			.filter((b) => b.item);
		return allBids;
	}, [highestBids, user, items]);

	const filteredItems = useMemo(
		() =>
			items.filter(
				(item) =>
					selectedCategories.includes(item.category) &&
					item.price >= priceRange[0] &&
					item.price <= priceRange[1] &&
					selectedConditions.has(item.condition),
			),
		[items, selectedCategories, priceRange, selectedConditions],
	);

	const totalPages = useMemo(
		() => Math.ceil(filteredItems.length / itemsPerPage),
		[filteredItems, itemsPerPage],
	);
	const paginatedItems = useMemo(
		() => filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
		[filteredItems, currentPage, itemsPerPage],
	);

	const toggleCategory = useCallback((category: string) => {
		setSelectedCategories((prev) =>
			prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category],
		);
	}, []);

	const toggleCondition = useCallback((condition: string) => {
		setSelectedConditions((prev) => {
			const newConditions = new Set(prev);
			if (newConditions.has(condition)) {
				newConditions.delete(condition);
			} else {
				newConditions.add(condition);
			}
			return newConditions;
		});
	}, []);

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
				toast("Login first to submit your bid", {
					description: "Please log in to place a bid.",
					action: {
						label: "Login",
						onClick: () => router.push("/auth?type=login&after_auth_return_to=/"),
					},
				});
				return;
			}

			const currentBid = proposedBids.find((bid) => bid.itemId === itemId)?.amount || 0;

			setPendingBids((prev) => [...prev, itemId]);
			await placeBid(itemId, currentBid, user.id);

			const highestBid = highestBids[itemId];
			if (highestBid?.userId === user.id) {
				toast("Congratulations, you now own this item!", {
					description: "You are the current owner of this item.",
					richColors: true,
				});
			}

			setPendingBids((prev) => prev.filter((bid) => bid !== itemId));
		},
		[proposedBids, user, placeBid, highestBids, router],
	);

	const ownedCount = useMemo(() => {
		if (!user) return 0;
		return Object.values(highestBids).filter((bid) => bid.userId === user.id).length;
	}, [highestBids, user]);

	// Only show timer popup if not closed and auction is not closed
	const renderTimerPopup = () => {
		if (auctionClosed) return null;
		if (!showTimerPopup) return null;

		const TimerContent = () => {
			const timeProps = auctionNotStarted
				? { label: "Starts in", date: auction?.start_time }
				: { label: "Ends in", date: auctionEndTime.toISOString() };

			return (
				<View style={styles.timerPopup}>
					<ThemedText style={styles.timerLabel}>{timeProps.label}</ThemedText>
					{timeProps.date && (
						<CountdownTimer
							minimized={timerMinimized}
							targetDate={timeProps.date}
							size={iSize.Small}
							onExpire={() => {
								if (auctionNotStarted) setAuctionNotStarted(false);
								else setAuctionClosed(true);
							}}
						/>
					)}
					<TouchableOpacity
						style={styles.timerPopupClose}
						onPress={() => {
							setTimerMinimized(!timerMinimized);
						}}
						accessibilityLabel="Minimize timer">
						{timerMinimized ? (
							<ChevronDown size={16} color={Colors.light.textMutedForeground} />
						) : (
							<ChevronUp size={16} color={Colors.light.textMutedForeground} />
						)}
					</TouchableOpacity>
				</View>
			);
		};

		return (
			<View style={styles.floatingTimer}>
				<TimerContent />
			</View>
		);
	};

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
			{/* Modern header with filter and timer */}
			<View style={styles.headerRow}>
				<View style={styles.headerLeft}>
					<ThemedText style={styles.heading}>{auction.name}</ThemedText>
					<ThemedText style={styles.subheading}>
						{auctionNotStarted
							? "Auction not started"
							: `Auction is live! Ends at: ${auction.start_time.toLocaleString()}`}
					</ThemedText>
				</View>
				<TouchableOpacity
					style={styles.filterBtn}
					onPress={() => setShowFilterModal(true)}
					accessibilityLabel="Show filters">
					<Filter size={22} color={Colors.light.tint} />
				</TouchableOpacity>
			</View>
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
			{/* Divider */}
			<View style={styles.dividerContainer}>
				<View style={styles.divider} />
			</View>
			{/* Timer Popup (only one at a time) */}
			{renderTimerPopup()}
			{/* All items grid */}
			<FlatList
				data={filteredItems}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				numColumns={2}
				columnWrapperStyle={styles.gridRow}
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
			{/* Filter Modal */}
			<Modal
				visible={showFilterModal}
				transparent
				animationType="slide"
				onRequestClose={() => setShowFilterModal(false)}>
				<View style={styles.filterModalOverlay}>
					<View style={styles.filterModal}>
						<View style={styles.filterModalHeader}>
							<ThemedText style={styles.filterModalTitle}>Filters</ThemedText>
							<TouchableOpacity onPress={() => setShowFilterModal(false)}>
								<X size={22} color={Colors.light.textMutedForeground} />
							</TouchableOpacity>
						</View>
						<View style={styles.filterSection}>
							<ThemedText style={styles.filterLabel}>Categories</ThemedText>
							<View style={styles.filterChipsRow}>
								{categories.map((cat) => (
									<TouchableOpacity
										key={cat}
										style={[
											styles.filterChip,
											selectedCategories.includes(cat) &&
												styles.filterChipActive,
										]}
										onPress={() => {
											setSelectedCategories((prev) =>
												prev.includes(cat)
													? prev.filter((c) => c !== cat)
													: [...prev, cat],
											);
										}}>
										<ThemedText
											style={[
												styles.filterChipText,
												selectedCategories.includes(cat) &&
													styles.filterChipTextActive,
											]}>
											{cat}
										</ThemedText>
									</TouchableOpacity>
								))}
							</View>
						</View>
						<TouchableOpacity
							style={styles.filterApplyBtn}
							onPress={() => setShowFilterModal(false)}>
							<ThemedText style={styles.filterApplyBtnText}>Apply</ThemedText>
						</TouchableOpacity>
					</View>
				</View>
			</Modal>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 12,
		backgroundColor: Colors.light.background,
		position: "relative", // ensure relative for absolute children
	},
	center: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: 32,
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 8,
		marginTop: 8,
		paddingHorizontal: 2,
	},
	headerLeft: {
		flex: 1,
	},
	heading: {
		fontSize: 24,
		fontWeight: "bold",
		color: Colors.light.textPrimaryForeground,
		marginBottom: 2,
	},
	subheading: {
		color: Colors.light.textMutedForeground,
		fontSize: 15,
	},
	filterBtn: {
		backgroundColor: Colors.light.muted,
		borderRadius: 8,
		padding: 10,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 8,
	},
	dividerContainer: {
		marginBottom: 18,
		marginTop: 8,
	},
	divider: {
		height: 1,
		width: "100%",
		alignSelf: "center",
		backgroundColor: "#e0eaff",
		opacity: 0.7,
	},
	floatingTimer: {
		position: "absolute",
		bottom: 24,
		right: 18,
		zIndex: 100,
	},
	timerPopup: {
		display: "flex",
		flexDirection: "column",
		backgroundColor: "#fff",
		borderRadius: 16,
		paddingVertical: 6,
		paddingHorizontal: 14,
		alignItems: "center",
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		gap: 2,
		maxWidth: "90%",
		minWidth: 110,
	},
	timerPopupMin: {
		display: "flex",
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#fff",
		borderRadius: 16,
		paddingVertical: 4,
		paddingHorizontal: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		gap: 6,
		minWidth: 90,
	},
	timerPopupClose: {
		marginLeft: 8,
		padding: 2,
		borderRadius: 8,
		backgroundColor: Colors.light.muted,
		alignItems: "center",
		justifyContent: "center",
		position: "absolute",
		top: 6,
		right: 6,
		zIndex: 1,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
	},
	timerPopupExpand: {
		marginLeft: 6,
		padding: 2,
		borderRadius: 8,
		backgroundColor: Colors.light.muted,
		alignItems: "center",
		justifyContent: "center",
	},
	timerLabel: {
		color: Colors.light.textMutedForeground,
		fontSize: 14,
		marginRight: 4,
		fontWeight: "600",
		position: "absolute",
		top: 1,
		left: 10,
	},
	timerSecondsOnly: {
		// Optionally, you can add a style to shrink/hide all but seconds in CountdownTimer
	},
	gridRow: {
		flexDirection: "column",
		justifyContent: "space-between",
		gap: 12,
	},
	card: {
		backgroundColor: Colors.light.card,
		borderRadius: 16,
		padding: 16,
		marginBottom: 18,

		marginHorizontal: 6,
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
		height: 120,
		borderRadius: 12,
		marginBottom: 8,
		backgroundColor: Colors.light.muted,
	},
	imagePlaceholder: {
		width: "100%",
		height: 120,
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
		paddingHorizontal: 12,
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
	errorCard: {
		backgroundColor: "#ffeaea",
		borderRadius: 10,
		padding: 12,
		marginBottom: 10,
	},
	// Filter Modal styles
	filterModalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.25)",
		justifyContent: "center",
		alignItems: "center",
	},
	filterModal: {
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
	filterModalHeader: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 18,
	},
	filterModalTitle: {
		fontWeight: "bold",
		fontSize: 20,
		color: Colors.light.textPrimaryForeground,
	},
	filterSection: {
		width: "100%",
		marginBottom: 18,
	},
	filterLabel: {
		fontWeight: "600",
		fontSize: 16,
		marginBottom: 8,
		color: Colors.light.textMutedForeground,
	},
	filterChipsRow: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
	},
	filterChip: {
		backgroundColor: Colors.light.muted,
		borderRadius: 16,
		paddingVertical: 8,
		paddingHorizontal: 16,
		marginBottom: 8,
	},
	filterChipActive: {
		backgroundColor: Colors.light.tint,
	},
	filterChipText: {
		color: Colors.light.textMutedForeground,
		fontWeight: "600",
	},
	filterChipTextActive: {
		color: "#fff",
	},
	filterApplyBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
	},
	filterApplyBtnText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	errorText: {
		color: Colors.light.destructive,
	},
});

export default AuctionItemList;
