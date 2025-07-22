import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useWebSocket } from "@/context/WebSocketProvider";
import { iAuctionItem } from "@/lib/types";
import { useUser } from "@clerk/clerk-expo";
import { Stack, router } from "expo-router";
import { ShoppingBagIcon } from "lucide-react-native";
import React, { useEffect } from "react";
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
	const { isSignedIn } = useUser();
	
	// Handle authentication check with useEffect
	useEffect(() => {
		if (!isSignedIn) {
			router.replace("/(auth)/sign-in");
		}
	}, [isSignedIn]);

	const renderItem = ({ item }: { item: iAuctionItem }) => (
		<TouchableOpacity 
			onPress={() => router.push(`/wins/${item.id}`)}
			activeOpacity={0.9}
		>
			<ThemedView type="card" style={styles.card}>
				<Image source={{ uri: item.image[0] }} style={styles.image} resizeMode="cover" />
				<View style={styles.cardContent}>
				<View style={styles.badgeContainer}>
					<View style={styles.badge}>
						<Text style={styles.badgeText}>Won</Text>
					</View>
				</View>
				<Text style={styles.title}>{item.title}</Text>
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
		</TouchableOpacity>
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
			<Stack.Screen
				options={{
					headerTitle: "Your Auction Wins",
				}}
			/>
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
	},
	listContent: {
		padding: 16,
		paddingBottom: 100,
	},
	card: {
		borderRadius: 16,
		overflow: "hidden",
		marginBottom: 16,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.1,
		shadowRadius: 8,
		elevation: 3,
	},
	image: {
		width: "100%",
		height: 180,
	},
	cardContent: {
		padding: 16,
	},
	badgeContainer: {
		position: "absolute",
		top: -30,
		right: 16,
		zIndex: 10,
	},
	badge: {
		backgroundColor: Colors.light.tint,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 20,
	},
	badgeText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 12,
	},
	title: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
		color: Colors.light.textPrimaryForeground,
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
		fontSize: 18,
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
