import ShareApp from "@/components/ShareApp";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useRouter } from "expo-router";
import { BookOpen, FileText, HelpCircle, Mail, MessageSquare } from "lucide-react-native";
import { useState } from "react";
import { Linking, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

const supportOptions = [
	{
		icon: <Mail size={22} color={Colors.light.tint} />,
		label: "Contact Support",
		description: "Send us a message or report an issue",
		onPress: (router: any) => router.push("/(support)/contact-us"),
	},
	{
		icon: <FileText size={22} color={Colors.light.tint} />,
		label: "Privacy Policy",
		description: "Read our privacy policy",
		onPress: (router: any) => router.push("/(support)/privacy-policy"),
	},
	{
		icon: <BookOpen size={22} color={Colors.light.tint} />,
		label: "Terms & Conditions",
		description: "View our terms and conditions",
		onPress: (_router: any) => Linking.openURL("https://example.com/terms"),
	},
	{
		icon: <HelpCircle size={22} color={Colors.light.tint} />,
		label: "Help Guide",
		description: "Learn how to use the Auction App",
		onPress: (_router: any) => Linking.openURL("https://example.com/help"),
	},
	{
		icon: <MessageSquare size={22} color={Colors.light.tint} />,
		label: "FAQ",
		description: "Frequently Asked Questions",
		onPress: (_router: any) => Linking.openURL("https://example.com/faq"),
	},
];

const SupportScreen = () => {
	const [selected, setSelected] = useState<string | null>(null);
	const router = useRouter();

	return (
		<ThemedView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<ThemedText type="title" style={styles.heading}>
					Support & Help Center
				</ThemedText>
				<ThemedText style={styles.subheading}>
					We&apos;re here to help you with anything you need.
				</ThemedText>
				<View style={styles.section}>
					{supportOptions.map((option, idx) => (
						<TouchableOpacity
							key={option.label}
							style={[
								styles.optionRow,
								selected === option.label && styles.optionRowSelected,
								idx === supportOptions.length - 1 && { borderBottomWidth: 0 },
							]}
							activeOpacity={0.8}
							onPress={() => {
								setSelected(option.label);
								option.onPress(router);
							}}>
							<View style={styles.optionIcon}>{option.icon}</View>
							<View style={styles.optionText}>
								<ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
								<ThemedText style={styles.optionDesc}>
									{option.description}
								</ThemedText>
							</View>
						</TouchableOpacity>
					))}
				</View>

				<ShareApp />

				<View style={styles.footer}>
					<ThemedText style={styles.footerText}>
						For urgent support, email us at{" "}
						<ThemedText
							style={styles.link}
							onPress={() => Linking.openURL("mailto:support@example.com")}>
							support@example.com
						</ThemedText>
					</ThemedText>
				</View>
			</ScrollView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 24,
	},
	scrollContent: {
		paddingBottom: 32,
	},
	heading: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 8,
		letterSpacing: 0.2,
	},
	subheading: {
		textAlign: "center",
		color: Colors.light.textMutedForeground,
		marginBottom: 18,
		fontSize: 16,
	},
	section: {
		backgroundColor: Colors.light.card,
		borderRadius: 16,
		marginHorizontal: 18,
		marginBottom: 24,
		padding: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
	},
	optionRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		paddingVertical: 18,
		paddingHorizontal: 8,
		borderBottomWidth: 1,
		borderBottomColor: Colors.light.border,
		borderRadius: 10,
		marginBottom: 2,
		backgroundColor: "#fff",
	},
	optionRowSelected: {
		backgroundColor: Colors.light.muted,
	},
	optionIcon: {
		marginRight: 14,
		marginTop: 2,
	},
	optionText: {
		flex: 1,
	},
	optionLabel: {
		fontWeight: "600",
		fontSize: 17,
		marginBottom: 2,
	},
	optionDesc: {
		color: Colors.light.textMutedForeground,
		fontSize: 14,
	},
	footer: {
		marginTop: 18,
		alignItems: "center",
	},
	footerText: {
		color: Colors.light.textMutedForeground,
		fontSize: 14,
		textAlign: "center",
	},
	link: {
		color: Colors.light.tint,
		textDecorationLine: "underline",
	},
});

export default SupportScreen;
