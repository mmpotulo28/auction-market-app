import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScrollView, StyleSheet } from "react-native";

const PrivacyPolicyScreen = () => (
	<ThemedView type="card" style={styles.container}>
		<ScrollView contentContainerStyle={styles.content}>
			<ThemedText type="title" style={styles.heading}>
				Privacy Policy
			</ThemedText>
			<ThemedText style={styles.sectionTitle}>Your Privacy Matters</ThemedText>
			<ThemedText style={styles.text}>
				We are committed to protecting your privacy. This policy explains how we collect,
				use, and safeguard your information when you use our Auction App.
			</ThemedText>
			<ThemedText style={styles.sectionTitle}>Information We Collect</ThemedText>
			<ThemedText style={styles.text}>
				- Account information (name, email, etc.){"\n"}- Usage data and device information
				{"\n"}- Cookies and similar technologies for app functionality
			</ThemedText>
			<ThemedText style={styles.sectionTitle}>How We Use Your Information</ThemedText>
			<ThemedText style={styles.text}>
				- To provide and improve our services{"\n"}- To personalize your experience{"\n"}-
				For customer support and communication{"\n"}- To comply with legal obligations
			</ThemedText>
			<ThemedText style={styles.sectionTitle}>Your Choices</ThemedText>
			<ThemedText style={styles.text}>
				You can manage your privacy settings in the app, including cookie consent,
				notifications, and account information. You may request deletion of your data at any
				time.
			</ThemedText>
			<ThemedText style={styles.sectionTitle}>Contact Us</ThemedText>
			<ThemedText style={styles.text}>
				If you have any questions about this policy, please contact us at
				support@example.com.
			</ThemedText>
		</ScrollView>
	</ThemedView>
);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 24,
	},
	content: {
		padding: 24,
	},
	heading: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 18,
	},
	sectionTitle: {
		fontWeight: "700",
		fontSize: 17,
		marginTop: 18,
		marginBottom: 6,
	},
	text: {
		fontSize: 15,
		color: "#4b6a8b",
		marginBottom: 4,
	},
});

export default PrivacyPolicyScreen;
