import { Colors } from "@/constants/Colors";
import { Gavel, List, PlayCircle, User2 } from "lucide-react-native";
import React from "react";
import { Dimensions, Image, StyleSheet, View } from "react-native";
import { ThemedText } from "./ThemedText";

const steps = [
	{
		number: 1,
		icon: <User2 size={32} color={Colors.light.tint} />,
		title: "Create an Account",
		description:
			"Sign up to start listing items or participating in auctions. It's quick and easy!",
	},
	{
		number: 2,
		icon: <List size={32} color={Colors.light.tint} />,
		title: "List or Browse Items",
		description:
			"List your items for auction or browse through a variety of categories to find what you need.",
	},
	{
		number: 3,
		icon: <Gavel size={32} color={Colors.light.tint} />,
		title: "Place Bids",
		description:
			"Participate in auctions by placing bids on items you like. The highest bidder wins!",
	},
];

const HowItWorks: React.FC = () => {
	return (
		<View style={styles.section}>
			<ThemedText type="title" style={styles.heading}>
				How It Works
			</ThemedText>
			<View style={styles.stepsContainer}>
				{steps.map((step) => (
					<View key={step.number} style={styles.step}>
						<View style={styles.stepNumber}>
							<ThemedText style={styles.stepNumberText}>{step.number}</ThemedText>
						</View>
						<View style={styles.card}>
							<View style={styles.icon}>{step.icon}</View>
							<ThemedText style={styles.cardTitle}>{step.title}</ThemedText>
							<ThemedText style={styles.cardDesc}>{step.description}</ThemedText>
						</View>
					</View>
				))}
			</View>
			<View style={styles.tutorialVideo}>
				<Image
					source={require("../assets/images/781c714b-26ca-4e22-8850-af2a12caabb0.jpeg")}
					style={styles.video}
					resizeMode="cover"
				/>
				<View style={styles.overlay}>
					<PlayCircle size={64} color="#fff" style={styles.playIcon} />
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	section: {
		marginTop: 32,
		marginBottom: 16,
		paddingHorizontal: 16,
		alignItems: "center",
	},
	heading: {
		textAlign: "center",
		marginBottom: 24,
		fontSize: 28,
		fontWeight: "bold",
	},
	stepsContainer: {
		minWidth: "100%",
	},
	step: {
		flexDirection: "row",
		alignItems: "flex-start",
		marginBottom: 20,
	},
	stepNumber: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: Colors.light.tint,
		justifyContent: "center",
		alignItems: "center",
		marginRight: 12,
		marginTop: 8,
	},
	stepNumberText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 18,
	},
	card: {
		flex: 1,
		backgroundColor: Colors.light.secondary,
		borderRadius: 14,
		padding: 18,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	icon: {
		marginBottom: 8,
	},
	cardTitle: {
		fontWeight: "600",
		fontSize: 17,
		marginBottom: 4,
	},
	cardDesc: {
		color: "#666",
		fontSize: 15,
	},
	tutorialVideo: {
		marginTop: 32,
		alignSelf: "center",
		width: Math.min(Dimensions.get("window").width - 32, 400),
		height: 220,
		borderRadius: 16,
		overflow: "hidden",
		justifyContent: "center",
		alignItems: "center",
	},
	video: {
		width: "100%",
		height: "100%",
		borderRadius: 16,
	},
	overlay: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.18)",
	},
	playIcon: {
		opacity: 0.92,
	},
});

export default HowItWorks;
