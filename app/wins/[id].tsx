import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import WinConfetti from "@/components/WinConfetti";
import { Colors } from "@/constants/Colors";
import { useWebSocket } from "@/context/WebSocketProvider";
import { iAuctionItem } from "@/lib/types";
import { useUser } from "@clerk/clerk-expo";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { ArrowLeftIcon, CheckCircleIcon } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
	ActivityIndicator,
	Image,
	ScrollView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const WinDetailScreen = () => {
	const { id } = useLocalSearchParams();
	const { isSignedIn } = useUser();
	const { userWins, isLoading } = useWebSocket();
	const [item, setItem] = useState<iAuctionItem | null>(null);
	const [showConfetti, setShowConfetti] = useState(false);

	useEffect(() => {
		if (userWins && id) {
			const foundItem = userWins.find((win) => win.id.toString() === id.toString());
			setItem(foundItem || null);

			// Show confetti animation when item is found
			if (foundItem) {
				setShowConfetti(true);
				const timer = setTimeout(() => setShowConfetti(false), 3000);
				return () => clearTimeout(timer);
			}
		}
	}, [userWins, id]);

	// Handle authentication check with useEffect to avoid unhandled promise rejection
	useEffect(() => {
		if (!isSignedIn) {
			router.replace("/(auth)/sign-in");
		}
	}, [isSignedIn]);

	if (isLoading) {
		return (
			<ThemedView style={styles.loadingContainer}>
				<ActivityIndicator size="large" color={Colors.light.tint} />
			</ThemedView>
		);
	}

	if (!item) {
		return (
			<ThemedView style={styles.container}>
				<Stack.Screen
					options={{
						headerTitle: "Item Not Found",
						headerLeft: () => (
							<TouchableOpacity onPress={() => router.back()}>
								<ArrowLeftIcon
									color={Colors.light.textPrimaryForeground}
									size={24}
								/>
							</TouchableOpacity>
						),
					}}
				/>
				<View style={styles.notFoundContainer}>
					<ThemedText style={styles.notFoundText}>
						This item could not be found.
					</ThemedText>
					<TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
						<Text style={styles.backButtonText}>Go Back</Text>
					</TouchableOpacity>
				</View>
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<WinConfetti visible={showConfetti} />
			<Stack.Screen
				options={{
					headerTitle: "Auction Win Details",
					headerLeft: () => (
						<TouchableOpacity onPress={() => router.back()}>
							<ArrowLeftIcon color={Colors.light.textPrimaryForeground} size={24} />
						</TouchableOpacity>
					),
				}}
			/>
			<ScrollView contentContainerStyle={styles.content}>
				<Image source={{ uri: item.image[0] }} style={styles.image} resizeMode="cover" />

				<View style={styles.winBadge}>
					<CheckCircleIcon color="#fff" size={20} />
					<Text style={styles.winBadgeText}>Won</Text>
				</View>

				<ThemedView style={styles.detailsContainer}>
					<ThemedText style={styles.title}>{item.title}</ThemedText>
					<ThemedText style={styles.price}>R {item.price}</ThemedText>

					<View style={styles.infoRow}>
						<ThemedText style={styles.infoLabel}>Category:</ThemedText>
						<ThemedText style={styles.infoValue}>{item.category}</ThemedText>
					</View>

					<View style={styles.infoRow}>
						<ThemedText style={styles.infoLabel}>Condition:</ThemedText>
						<ThemedText style={styles.infoValue}>
							{item.condition || "Not specified"}
						</ThemedText>
					</View>

					<View style={styles.divider} />

					<ThemedText style={styles.sectionTitle}>Description</ThemedText>
					<ThemedText style={styles.description}>{item.description}</ThemedText>

					<View style={styles.divider} />

					<ThemedText style={styles.sectionTitle}>Next Steps</ThemedText>
					<ThemedView type="card" style={styles.stepCard}>
						<Text style={styles.stepNumber}>1</Text>
						<ThemedText style={styles.stepText}>
							Complete payment within 20 min of auction closing to secure your item.
						</ThemedText>
					</ThemedView>

					<ThemedView type="card" style={styles.stepCard}>
						<Text style={styles.stepNumber}>2</Text>
						<ThemedText style={styles.stepText}>
							Arrange delivery or pickup details with the seller.
						</ThemedText>
					</ThemedView>

					<ThemedView type="card" style={styles.stepCard}>
						<Text style={styles.stepNumber}>3</Text>
						<ThemedText style={styles.stepText}>
							Receive your item and enjoy your auction win!
						</ThemedText>
					</ThemedView>

					<TouchableOpacity
						style={styles.actionButton}
						onPress={() => {
							router.push("https://payment.auctionmarket.tech/payment");
						}}>
						<Text style={styles.actionButtonText}>Complete Payment</Text>
					</TouchableOpacity>
				</ThemedView>
			</ScrollView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 25,
	},
	loadingContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	content: {
		paddingBottom: 40,
	},
	image: {
		width: "100%",
		height: 300,
	},
	winBadge: {
		position: "absolute",
		top: 16,
		right: 16,
		backgroundColor: Colors.light.tint,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
	},
	winBadgeText: {
		color: "#fff",
		fontWeight: "bold",
		marginLeft: 4,
	},
	detailsContainer: {
		padding: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 8,
	},
	price: {
		fontSize: 22,
		fontWeight: "bold",
		color: Colors.light.tint,
		marginBottom: 16,
	},
	infoRow: {
		flexDirection: "row",
		marginBottom: 8,
	},
	infoLabel: {
		fontSize: 16,
		fontWeight: "600",
		width: 100,
	},
	infoValue: {
		fontSize: 16,
		flex: 1,
	},
	divider: {
		height: 1,
		backgroundColor: Colors.light.muted,
		marginVertical: 16,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 12,
	},
	description: {
		fontSize: 16,
		lineHeight: 24,
	},
	stepCard: {
		flexDirection: "row",
		alignItems: "center",
		padding: 12,
		borderRadius: 8,
		marginBottom: 12,
	},
	stepNumber: {
		width: 28,
		height: 28,
		borderRadius: 14,
		backgroundColor: Colors.light.tint,
		color: "#fff",
		textAlign: "center",
		lineHeight: 28,
		fontWeight: "bold",
		marginRight: 12,
	},
	stepText: {
		fontSize: 15,
		flex: 1,
	},
	actionButton: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 16,
	},
	actionButtonText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	notFoundContainer: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 20,
	},
	notFoundText: {
		fontSize: 18,
		textAlign: "center",
		marginBottom: 20,
	},
	backButton: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 12,
		paddingHorizontal: 24,
		borderRadius: 8,
	},
	backButtonText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 16,
	},
});

export default WinDetailScreen;
