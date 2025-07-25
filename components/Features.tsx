import { Colors } from "@/constants/Colors";
import { Clock, ShieldCheck, Sparkles, User2 } from "lucide-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";
import { ThemedView } from "./ThemedView";

const styles = StyleSheet.create({
	section: {
		marginVertical: 32,
		paddingHorizontal: 16,
	},
	heading: {
		textAlign: "center",
		marginBottom: 24,
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		gap: 16,
	},
	card: {
		width: "90%",
		maxWidth: 320,
		alignItems: "center",
		borderRadius: 16,
		padding: 24,
		margin: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	icon: {
		marginBottom: 12,
	},
	cardTitle: {
		fontWeight: "600",
		fontSize: 18,
		marginBottom: 6,
		textAlign: "center",
	},
	cardDesc: {
		color: "#666",
		fontSize: 15,
		textAlign: "center",
	},
});
const tint = Colors.light.tint;
const features = [
	{
		icon: <Sparkles size={40} color={tint} style={styles.icon} />,
		title: "Real-Time Auctions",
		description: "Bid and watch auctions update instantly, no refresh needed.",
	},
	{
		icon: <User2 size={40} color={tint} style={styles.icon} />,
		title: "User Profiles",
		description: "Manage your listings, bids, and purchases in one place.",
	},
	{
		icon: <ShieldCheck size={40} color={tint} style={styles.icon} />,
		title: "Secure Transactions",
		description: "Your payments and data are protected with industry standards.",
	},
	{
		icon: <Clock size={40} color={tint} style={styles.icon} />,
		title: "24/7 Support",
		description: "Get help anytime from our dedicated support team.",
	},
];

const Features = () => (
	<View style={styles.section}>
		<ThemedText type="title" style={styles.heading}>
			Platform Features
		</ThemedText>
		<View style={styles.grid}>
			{features.map((feature, idx) => (
				<ThemedView type="card" key={feature.title} style={styles.card}>
					{feature.icon}
					<ThemedText style={styles.cardTitle}>{feature.title}</ThemedText>
					<ThemedText style={styles.cardDesc}>{feature.description}</ThemedText>
				</ThemedView>
			))}
		</View>
	</View>
);

export default Features;
