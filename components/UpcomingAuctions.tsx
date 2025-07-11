import LockUp from "@/components/common/LockUp";
import Illustration from "@/components/Illustration";
import { Colors } from "@/constants/Colors";
import { fetchAuctions } from "@/lib/helpers";
import { iAuction } from "@/lib/types";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Actions from "./common/Actions";
import { CountdownTimer } from "./CountdownTimer";
import { ThemedView } from "./ThemedView";

const UpcomingAuctions: React.FC = () => {
	const router = useRouter();
	const [auctions, setAuctions] = useState<iAuction[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setIsLoading(true);
		fetchAuctions({ setIsLoading, onError: setError, onLoad: setAuctions })
			.then((data) => {
				setAuctions(data);
				setIsLoading(false);
			})
			.catch((err) => {
				setError("Failed to fetch auctions.");
				setIsLoading(false);
			});
	}, []);

	if (error) {
		return (
			<View style={styles.center}>
				<Illustration type="error" style={{ marginBottom: 16 }} />
				<Text style={styles.errorText}>{error}</Text>
			</View>
		);
	}

	return (
		<View style={styles.section}>
			<Text style={styles.heading}>Upcoming Auctions</Text>
			{isLoading && (
				<View style={styles.loading}>
					<Illustration type="loading" style={{ marginBottom: 16 }} />
				</View>
			)}
			<FlatList
				data={auctions}
				keyExtractor={(item) => item.id}
				contentContainerStyle={styles.listContent}
				renderItem={({ item }) => (
					<ThemedView style={[styles.card, { backgroundColor: Colors.light.secondary }]}>
						<View style={styles.cardHeader}>
							<LockUp title={item.name} centered bold />
						</View>
						<View style={styles.cardContent}>
							<Text style={styles.itemsCount}>
								{item.items_count} Items Available
							</Text>
							<View style={styles.timerRow}>
								<CountdownTimer targetDate={item.start_time} />
							</View>
							<Actions
								actions={[
									{
										label: "Preview Auction",
										click: () =>
											router.push({
												pathname: `/(auctions)/[name]`,
												params: { name: item.name },
											}),
									},
								]}
								fullWidth
								style={{ marginTop: 12 }}
							/>
						</View>
					</ThemedView>
				)}
				ListEmptyComponent={
					!isLoading ? (
						<ThemedView style={styles.center}>
							<Illustration type="success" style={{ marginBottom: 16 }} />
							<Text>No upcoming auctions found.</Text>
						</ThemedView>
					) : null
				}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	section: {
		width: "100%",
		paddingHorizontal: 8,
		marginTop: 24,
	},
	heading: {
		fontSize: 24,
		fontWeight: "bold",
		color: Colors.light.textPrimaryForeground,
		textAlign: "center",
		marginBottom: 18,
		letterSpacing: 0.2,
	},
	listContent: {
		paddingBottom: 24,
	},
	loading: {
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 32,
	},
	center: {
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 32,
	},
	card: {
		borderRadius: 20,
		padding: 22,
		marginVertical: 12,
		marginHorizontal: 8,
		boxShadow: `0 2px 4px ${Colors.light.tint}`,
		shadowColor: "transparent",
		elevation: 5,
	},
	cardHeader: {
		marginBottom: 10,
	},
	cardContent: {
		gap: 14,
		alignItems: "center",
	},
	itemsCount: {
		fontWeight: "600",
		color: Colors.light.textSecondaryForeground,
		fontSize: 16,
		marginBottom: 2,
	},
	timerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		backgroundColor: Colors.light.muted,
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 8,
		marginBottom: 2,
	},
	timerLabel: {
		color: Colors.light.textMutedForeground,
		fontSize: 15,
		marginRight: 4,
	},
	timerText: {
		fontWeight: "bold",
		color: Colors.light.tint,
		fontSize: 15,
	},
	errorText: {
		color: Colors.light.destructive,
		fontWeight: "bold",
		fontSize: 16,
	},
});

export default UpcomingAuctions;
