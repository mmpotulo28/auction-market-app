// This file enables dynamic routing for auction previews in React Native/Expo Router.
// Move this file to app/(auctions)/[name].tsx and remove any duplicate auction/[name].tsx files.

import AuctionItemList from "@/components/AuctionItemList";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { fetchAuctionByName } from "@/lib/helpers";
import logger from "@/lib/logger";
import { iAuction } from "@/lib/types";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

const AuctionPage = () => {
	const { name } = useLocalSearchParams<{ name: string }>();
	const [auction, setAuction] = useState<iAuction | undefined>();
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const auctionData = await fetchAuctionByName(name as string);
				setAuction(auctionData);
			} catch (error) {
				logger.error("Error fetching auction:", error);
			} finally {
				setLoading(false);
			}
		};
		if (name) fetchData();
	}, [name]);

	return (
		<ThemedView style={styles.container}>
			{loading ? (
				<View style={styles.center}>
					<ActivityIndicator size="large" color={Colors.light.tint} />
					<ThemedText style={styles.loadingText}>Loading items...</ThemedText>
				</View>
			) : (
				<AuctionItemList auction={auction} itemsPerPage={10} />
			)}
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 50,
	},
	center: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	loadingText: {
		marginTop: 12,
		color: Colors.light.textMutedForeground,
		fontSize: 16,
	},
});

export default AuctionPage;
