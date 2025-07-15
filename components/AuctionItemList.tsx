import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useWebSocket } from "@/context/WebSocketProvider";
import { iAuction, iBid, iSize } from "@/lib/types";
import { useUser } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import {
	ChevronDown,
	ChevronUp,
	Filter,
	Minus,
	Plus,
	TimerIcon,
	UserCheck,
	X,
} from "lucide-react-native";
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
import { CountdownTimer } from "./CountdownTimer";

interface AuctionItemListProps {
	auction?: iAuction;
	itemsPerPage?: number;
}

// Move static data outside component
const CONDITION_OPTIONS = ["New", "Used", "Refurbished"];

const AuctionItemList: React.FC<AuctionItemListProps> = React.memo(
	({ auction, itemsPerPage = 10 }) => {
		const { user } = useUser();
		const router = useRouter();
		const [showFilterModal, setShowFilterModal] = useState(false);

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
		const [showTimerPopup] = useState(true);
		const [timerMinimized, setTimerMinimized] = useState(false);

		// Memoize auction times
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

		// Memoize user bids
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

		// Memoize filtered items
		const filteredItems = useMemo(() => {
			const catSet = new Set(selectedCategories);
			const condSet = new Set(Array.from(selectedConditions, (c) => c.toLowerCase()));
			return items.filter(
				(item) =>
					catSet.has(item.category) &&
					item.price >= priceRange[0] &&
					item.price <= priceRange[1] &&
					condSet.has(item.condition?.toLowerCase()),
			);
		}, [items, selectedCategories, priceRange, selectedConditions]);

		const totalPages = useMemo(
			() => Math.ceil(filteredItems.length / itemsPerPage),
			[filteredItems.length, itemsPerPage],
		);

		const paginatedItems = useMemo(
			() => filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
			[filteredItems, currentPage, itemsPerPage],
		);

		// Memoize toggleCategory
		const toggleCategory = useCallback((category: string) => {
			setSelectedCategories((prev) =>
				prev.includes(category)
					? prev.filter((cat) => cat !== category)
					: [...prev, category],
			);
		}, []);

		// Memoize toggleCondition
		const toggleCondition = useCallback((condition: string) => {
			setSelectedConditions((prev) => {
				const newConditions = new Set(prev);
				const cond = condition.toLowerCase();
				if (newConditions.has(cond)) {
					newConditions.delete(cond);
				} else {
					newConditions.add(cond);
				}
				return newConditions;
			});
		}, []);

		// Memoize adjustBid
		const adjustBid = useCallback(
			(id: string, delta: number) => {
				setProposedBids((prevBids) => {
					const existingBid = prevBids.find((bid) => bid.itemId === id);
					const item = items.find((item) => item.id === id);
					if (!item) return prevBids;
					const minBid = Math.max(highestBids[id]?.amount || 0, item.price);
					if (existingBid) {
						const newAmount = Math.max(existingBid.amount + delta, minBid);
						if (newAmount === existingBid.amount) return prevBids; // no change
						return prevBids.map((bid) =>
							bid.itemId === id ? { ...bid, amount: newAmount } : bid,
						);
					} else {
						return [
							...prevBids,
							{
								itemId: id,
								amount: minBid + delta,
								userId: user?.id || "",
								timestamp: new Date().toISOString(),
							},
						];
					}
				});
			},
			[items, highestBids, user],
		);

		// Memoize submitBid
		const submitBid = useCallback(
			async (itemId: string) => {
				if (!user) {
					toast("Login first to submit your bid", {
						description: "Please log in to place a bid.",
						action: {
							label: "Login",
							onClick: () => router.push("/(auth)/sign-in?after_auth_return_to=/"),
						},
					});
					return;
				}
				const currentBid = proposedBids.find((bid) => bid.itemId === itemId)?.amount || 0;
				if (pendingBids.includes(itemId)) return; // avoid double submit

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
			[proposedBids, user, placeBid, highestBids, router, pendingBids],
		);

		const ownedCount = useMemo(() => {
			if (!user) return 0;
			return Object.values(highestBids).filter((bid) => bid.userId === user.id).length;
		}, [highestBids, user]);

		// Timer popup logic
		const renderTimerPopup = useCallback(() => {
			if (auctionClosed || !showTimerPopup) return null;
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
							onPress={() => setTimerMinimized(!timerMinimized)}
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
		}, [
			auctionClosed,
			showTimerPopup,
			auctionNotStarted,
			auction,
			auctionEndTime,
			timerMinimized,
		]);

		// Memoize FlatList renderItem
		const renderItem = useCallback(
			({ item }: { item: (typeof items)[0] }) => {
				const highestBid = highestBids[item.id];
				const currentBid =
					proposedBids.find((bid) => bid.itemId === item.id)?.amount ||
					highestBid?.amount ||
					item.price;
				const isOwner = highestBid?.userId === user?.id;
				return (
					<ThemedView type="card" style={styles.card}>
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
							<ThemedText style={styles.description}>{item.description}</ThemedText>
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
					</ThemedView>
				);
			},
			[
				highestBids,
				proposedBids,
				user,
				adjustBid,
				submitBid,
				pendingBids,
				auctionClosed,
				auctionNotStarted,
			],
		);

		// Memoize FlatList keyExtractor
		const keyExtractor = useCallback((item: (typeof items)[0]) => item.id, []);

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
						<TouchableOpacity
							style={styles.cartBtn}
							onPress={() => {
								router.push("/(account)/cart");
							}}>
							<ThemedText style={styles.cartBtnText}>Go to Cart</ThemedText>
						</TouchableOpacity>
					</View>
				</ThemedView>
			);
		}

		return (
			<ThemedView style={styles.container}>
				{/* Modern header with filter and timer */}
				<ThemedView style={styles.headerRow}>
					<ThemedView style={styles.headerLeft}>
						<ThemedText style={styles.heading}>{auction.name}</ThemedText>
						<ThemedText style={styles.subheading}>
							{auctionNotStarted
								? "Auction not started"
								: `Auction is live! Ends at: ${new Date(
										auction.start_time,
								  ).toLocaleString()}`}
						</ThemedText>
					</ThemedView>
					<TouchableOpacity
						style={styles.filterBtn}
						onPress={() => setShowFilterModal(true)}
						accessibilityLabel="Show filters">
						<Filter size={22} color={Colors.light.tint} />
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.filterBtn}
						onPress={() => setShowBidHistory(true)}
						accessibilityLabel="Show bid history">
						<TimerIcon size={22} color={Colors.light.tint} />
					</TouchableOpacity>
				</ThemedView>
				{isLoading && (
					<ThemedView style={styles.loadingRow}>
						<ActivityIndicator size="large" color={Colors.light.tint} />
						<ThemedText style={styles.loadingText}>Loading auction items...</ThemedText>
					</ThemedView>
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
					data={paginatedItems}
					keyExtractor={keyExtractor}
					contentContainerStyle={styles.listContent}
					numColumns={2}
					columnWrapperStyle={styles.gridRow}
					renderItem={renderItem}
					removeClippedSubviews
					initialNumToRender={6}
					maxToRenderPerBatch={8}
					windowSize={11}
					ListFooterComponent={
						<ThemedView style={styles.paginationRow}>
							<TouchableOpacity
								style={[
									styles.pageBtn,
									currentPage === 1 && styles.pageBtnDisabled,
								]}
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
						</ThemedView>
					}
				/>
				{/* Filter Modal */}
				<Modal
					visible={showFilterModal}
					transparent
					animationType="slide"
					onRequestClose={() => setShowFilterModal(false)}>
					<ThemedView style={styles.filterModalOverlay}>
						<ThemedView type="modal" style={styles.filterModal}>
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
											onPress={() => toggleCategory(cat)}>
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
							<View style={styles.filterSection}>
								<ThemedText style={styles.filterLabel}>Price Range</ThemedText>
								<View style={styles.priceRangeRow}>
									<TouchableOpacity
										style={styles.priceRangeBtn}
										onPress={() =>
											setPriceRange(([min, max]) => [
												Math.max(0, min - 1000),
												max,
											])
										}
										disabled={auctionClosed || auctionNotStarted}>
										<Minus size={18} color={Colors.light.tint} />
									</TouchableOpacity>
									<ThemedText style={styles.priceRangeText}>
										R {priceRange[0]} - R {priceRange[1]}
									</ThemedText>
									<TouchableOpacity
										style={styles.priceRangeBtn}
										onPress={() =>
											setPriceRange(([min, max]) => [min + 1000, max])
										}
										disabled={auctionClosed || auctionNotStarted}>
										<Plus size={18} color={Colors.light.tint} />
									</TouchableOpacity>
								</View>
								<TouchableOpacity
									style={styles.filterApplyBtn}
									onPress={() => setShowFilterModal(false)}>
									<ThemedText style={styles.filterApplyBtnText}>Apply</ThemedText>
								</TouchableOpacity>
							</View>
							{/* item condition filter */}
							<View style={styles.filterSection}>
								<ThemedText style={styles.filterLabel}>Item Condition</ThemedText>
								<View style={styles.filterChipsRow}>
									{CONDITION_OPTIONS.map((condition) => (
										<TouchableOpacity
											key={condition}
											style={[
												styles.filterChip,
												selectedConditions.has(condition.toLowerCase()) &&
													styles.filterChipActive,
											]}
											onPress={() => toggleCondition(condition)}>
											<ThemedText
												style={[
													styles.filterChipText,
													selectedConditions.has(
														condition.toLowerCase(),
													) && styles.filterChipTextActive,
												]}>
												{condition}
											</ThemedText>
										</TouchableOpacity>
									))}
								</View>
							</View>
						</ThemedView>
					</ThemedView>
				</Modal>

				{/* user bid history modal */}
				<Modal
					visible={showBidHistory}
					transparent
					animationType="slide"
					onRequestClose={() => setShowBidHistory(false)}>
					<View style={styles.modalOverlay}>
						<ThemedView type="modal" style={styles.modalContent}>
							<ThemedText style={styles.modalTitle}>Your Bid History</ThemedText>
							<FlatList
								data={userBids}
								keyExtractor={(item) => item.itemId}
								renderItem={({ item }) => (
									<View style={styles.bidItem}>
										<ThemedText style={styles.bidItemText}>
											{item.item?.title} - R{item.amount}
										</ThemedText>
									</View>
								)}
							/>
							<TouchableOpacity
								style={styles.modalCloseBtn}
								onPress={() => setShowBidHistory(false)}>
								<ThemedText style={styles.modalCloseBtnText}>
									<X size={22} color={Colors.light.textMutedForeground} />
								</ThemedText>
							</TouchableOpacity>
						</ThemedView>
					</View>
				</Modal>
			</ThemedView>
		);
	},
);

// Add display name for better debugging and to fix warning
AuctionItemList.displayName = "AuctionItemList";

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 12,
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
	touchableCard: {
		flex: 1,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: "transparent",
		marginHorizontal: 6,
		marginBottom: 12,
	},
	card: {
		borderRadius: 16,
		padding: 16,

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
		fontSize: 22,
		marginBottom: 10,
	},
	tagsRow: {
		flexDirection: "row",
		gap: 8,
		marginTop: 4,
	},
	badge: {
		backgroundColor: Colors.light.destructive,
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 2,
		marginRight: 6,
	},
	badgeSecondary: {
		backgroundColor: Colors.light.chart2,
	},
	badgeText: {
		fontWeight: "600",
		fontSize: 13,
		color: "#fff",
	},
	cardContent: {
		marginBottom: 8,
	},
	image: {
		width: "100%",
		height: 320,
		borderRadius: 12,
		marginBottom: 8,
		backgroundColor: Colors.light.muted,
		objectFit: "cover",
		alignItems: "center",
		// aspectRatio: 6 / ,
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
		backgroundColor: "rgba(0,0,0,0.85)",
		justifyContent: "center",
		alignItems: "center",
	},
	filterModal: {
		width: "90%",
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
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.8)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		width: "90%",
		borderRadius: 16,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 4,
		position: "relative",
	},
	modalTitle: {
		fontWeight: "bold",
		fontSize: 20,
		color: Colors.light.textPrimaryForeground,
		marginBottom: 16,
	},
	bidItem: {
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: Colors.light.muted,
	},
	bidItemText: {
		fontSize: 16,
	},
	modalCloseBtn: {
		backgroundColor: Colors.light.muted,
		paddingVertical: 5,
		paddingHorizontal: 5,
		borderRadius: 50,
		alignItems: "center",
		position: "absolute",
		right: 10,
		top: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
		elevation: 2,
		alignSelf: "flex-end",
		justifyContent: "center",
		width: 25,
		height: 25,
	},
	modalCloseBtnText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	priceRangeRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: Colors.light.muted,
	},
	priceRangeBtn: {
		backgroundColor: Colors.light.muted,
		borderRadius: 8,
		padding: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	priceRangeText: {
		color: Colors.light.textPrimaryForeground,
		fontSize: 16,
		fontWeight: "600",
		flex: 1,
		textAlign: "center",
	},
});

export default AuctionItemList;
