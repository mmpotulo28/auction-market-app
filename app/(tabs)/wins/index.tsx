import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useWebSocket } from "@/context/WebSocketProvider";
import { iAuctionItem } from "@/lib/types";
import { router } from "expo-router";
import { CheckCircleIcon, ShoppingBagIcon } from "lucide-react-native";
import React from "react";
import {
	ActivityIndicator,
	FlatList,
	Image,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from "react-native";

const WinsScreen = () => {
	const { userWins, isLoading } = useWebSocket();

	const renderItem = ({ item }: { item: iAuctionItem }) => (
		<ThemedView type="card" style={styles.card}>
			<View style={styles.winBadge}>
				<CheckCircleIcon color="#fff" size={20} />
				<Text style={styles.winBadgeText}>Won</Text>
			</View>

			<Image source={{ uri: item.image[0] }} style={styles.image} resizeMode="cover" />
			<View style={styles.cardContent}>
				<ThemedText style={styles.title}>{item.title}</ThemedText>
				<Text style={styles.description} numberOfLines={2}>
					{item.description}
				</Text>
				<View style={styles.footer}>
					<Text style={styles.price}>R {item.price}</Text>
					<TouchableOpacity
						style={styles.button}
						onPress={() => router.push(`/wins/${item.id}`)}>
						<Text style={styles.buttonText}>View Details</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ThemedView>
	);

	const renderEmptyComponent = () => (
		<View style={styles.emptyContainer}>
			<ShoppingBagIcon size={64} color={Colors.light.muted} />
			<ThemedText style={styles.emptyText}>You haven&apos;t won any auctions yet.</ThemedText>
			<ThemedText style={styles.emptySubText}>
				Participate in auctions to see your wins here!
			</ThemedText>
		</View>
	);

	return (
		<ThemedView style={styles.container}>
			<ThemedText style={styles.heading}>Your Auction Wins</ThemedText>
			{isLoading ? (
				<ActivityIndicator size="large" color={Colors.light.tint} style={styles.loader} />
			) : (
				<FlatList
					data={userWins}
					renderItem={renderItem}
					keyExtractor={(item) => item.id}
					contentContainerStyle={styles.listContent}
					ListEmptyComponent={renderEmptyComponent}
					showsVerticalScrollIndicator={false}
				/>
			)}
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 44,
	},
	heading: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 18,
		color: Colors.light.textPrimaryForeground,
		paddingHorizontal: 16,
	},
	listContent: {
		padding: 16,
		paddingBottom: 100,
	},
	card: {
		borderRadius: 8,
		overflow: "hidden",
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
		position: "relative",
	},
	image: {
		width: "100%",
		height: 280,
	},
	cardContent: {
		padding: 16,
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
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
	description: {
		fontSize: 14,
		color: Colors.light.textSecondaryForeground,
		marginBottom: 12,
	},
	footer: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 8,
	},
	price: {
		fontSize: 21,
		fontWeight: "bold",
		color: Colors.light.tint,
	},
	button: {
		backgroundColor: Colors.light.secondary,
		paddingHorizontal: 16,
		paddingVertical: 8,
		borderRadius: 8,
	},
	buttonText: {
		color: Colors.light.textPrimaryForeground,
		fontWeight: "600",
		fontSize: 14,
	},
	emptyContainer: {
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 60,
	},
	emptyText: {
		fontSize: 18,
		fontWeight: "bold",
		marginTop: 16,
		color: Colors.light.textPrimaryForeground,
	},
	emptySubText: {
		fontSize: 14,
		color: Colors.light.textSecondaryForeground,
		marginTop: 8,
		textAlign: "center",
		paddingHorizontal: 32,
	},
	loader: {
		marginTop: 40,
	},
});

export default WinsScreen;
