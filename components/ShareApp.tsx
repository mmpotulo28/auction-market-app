import { Colors } from "@/constants/Colors";
import * as Clipboard from "expo-clipboard";
import { Copy, Facebook, Linkedin, Twitter } from "lucide-react-native";
import React from "react";
import { Alert, Share, StyleSheet, TouchableOpacity, View } from "react-native";

const appTitle = "Auction Market SA";
const shareUrl = "https://auctionmarket.tech";

const shareLinks = [
	{
		name: "Facebook",
		url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
		icon: <Facebook size={20} color={Colors.light.tint} />,
	},
	{
		name: "LinkedIn",
		url: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
			shareUrl,
		)}&title=${encodeURIComponent(appTitle)}`,
		icon: <Linkedin size={20} color={Colors.light.tint} />,
	},
	{
		name: "Twitter",
		url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
			shareUrl,
		)}&text=${encodeURIComponent(appTitle)}`,
		icon: <Twitter size={20} color={Colors.light.tint} />,
	},
];

const openShareLink = async (url: string) => {
	try {
		await Share.share({ message: `${appTitle} - ${shareUrl}\n${url}` });
	} catch (error) {
		Alert.alert("Error", "Unable to share at this time.");
		console.error("Error sharing link:", error);
	}
};

const copyToClipboard = async () => {
	await Clipboard.setStringAsync(shareUrl);
	Alert.alert("Copied!", "App link copied to clipboard.");
};

const ShareApp = () => (
	<View style={styles.container}>
		<View style={styles.labelRow}>{/* You can use a ThemedText here if desired */}</View>
		<View style={styles.row}>
			{shareLinks.map((link) => (
				<TouchableOpacity
					key={link.name}
					style={styles.iconBtn}
					accessibilityLabel={`Share on ${link.name}`}
					onPress={() => openShareLink(link.url)}>
					{link.icon}
				</TouchableOpacity>
			))}
			<TouchableOpacity
				style={styles.iconBtn}
				accessibilityLabel="Copy link"
				onPress={copyToClipboard}>
				<Copy size={20} color={Colors.light.tint} />
			</TouchableOpacity>
		</View>
	</View>
);

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "flex-end",
		marginVertical: 16,
		marginRight: 8,
	},
	labelRow: {
		marginRight: 8,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	iconBtn: {
		backgroundColor: Colors.light.muted,
		borderRadius: 50,
		padding: 10,
		marginHorizontal: 2,
		alignItems: "center",
		justifyContent: "center",
	},
});

export default ShareApp;
