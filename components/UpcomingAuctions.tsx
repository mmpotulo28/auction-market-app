import LockUp from "@/components/common/LockUp";
import Illustration from "@/components/Illustration";
import { Colors } from "@/constants/Colors";
import { fetchAuctions } from "@/lib/helpers";
import { iAuction, iAuctionLabel } from "@/lib/types";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Actions from "./common/Actions";
import { CountdownTimer } from "./CountdownTimer";
import { ThemedView } from "./ThemedView";

const AuctionLabel = ({ type }: { type: iAuctionLabel }) => {
	let label = {
		style: styles.hotLabel,
		text: "🔥 Hot Auction",
	};

	switch (type) {
		case iAuctionLabel.Hot:
			label = { style: styles.hotLabel, text: "🔥 Hot Auction" };
			break;
		case iAuctionLabel.Demo:
			label = { style: styles.demoLabel, text: "Demo Auction" };
			break;
		case iAuctionLabel.Sale:
			label = { style: styles.saleLabel, text: "💰 Flash Sale" };
			break;
		case iAuctionLabel.OpeningSoon:
			label = { style: styles.openingSoonLabel, text: "🚀 Opening Soon" };
			break;
		default:
			label = {
				style: styles.hotLabel,
				text: "🔥 Hot Auction",
			};
	}

	return (
		<View style={[label.style, styles.label]}>
			<Text style={{ color: "#fff", fontWeight: "bold" }}>{label.text} </Text>
		</View>
	);
};

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
			<ThemedView style={styles.listContent}>
				{auctions.map((item) => (
					<ThemedView type="card" style={[styles.card]} key={item.id}>
						{item.label && <AuctionLabel type={item.label} />}
						<View style={styles.cardHeader}>
							<LockUp title={item.name} centered bold />
						</View>
						<View style={styles.cardContent}>
							<Text style={styles.itemsCount}>
								{item.items_count} Items Available
							</Text>
							<ThemedView style={styles.timerRow}>
								<CountdownTimer targetDate={item.start_time} />
							</ThemedView>
							<Actions
								actions={[
									{
										label: "Preview Auction",
										click: () =>
											router.push({
												pathname: `/(auctions)/name`,
												params: { name: item.name },
											}),
									},
								]}
								fullWidth
								style={{ marginTop: 12 }}
							/>
						</View>
					</ThemedView>
				))}
				{!isLoading && auctions.length === 0 && (
					<View style={styles.center}>
						<Illustration type="error" style={{ marginBottom: 16 }} />
						<Text style={styles.errorText}>No upcoming auctions found.</Text>
					</View>
				)}
			</ThemedView>
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
		position: "relative",
		overflow: "hidden",
	},
	label: {
		position: "absolute",
		top: 25,
		right: -45,
		color: "#fff",
		fontWeight: "bold",
		paddingVertical: 4,
		paddingHorizontal: 20,
		borderRadius: "8px 0 0 8px",
		transform: [{ rotateZ: "45deg" }],
		zIndex: 0,
		minWidth: 160,
		textAlign: "center",
		justifyContent: "center",
		alignItems: "center",
		boxShadow: `0 2px 4px ${Colors.dark.muted}`,
	},
	hotLabel: {
		backgroundColor: Colors.light.destructive,
	},

	saleLabel: {
		backgroundColor: Colors.light.chart2,
	},
	openingSoonLabel: {
		backgroundColor: Colors.light.primary,
	},
	demoLabel: {
		backgroundColor: Colors.light.accent,
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
		justifyContent: "center",
		gap: 6,
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 8,
		marginBottom: 2,
		backgroundColor: Colors.light.secondary,
	},
	errorText: {
		color: Colors.light.destructive,
		fontWeight: "bold",
		fontSize: 16,
	},
});

export default UpcomingAuctions;
