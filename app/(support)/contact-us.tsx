import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { contactFormTemplate, contactFormUserConfirmationTemplate } from "@/lib/email_templates";
import axios from "axios";
import { Mail, MessageCircle, Phone, Send, Smile, Users } from "lucide-react-native";
import React, { useState } from "react";
import {
	GestureResponderEvent,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

const ContactUsScreen = () => {
	const [form, setForm] = useState({
		name: "",
		email: "",
		message: "",
	});
	const [loading, setLoading] = useState(false);

	const handleChange = (key: string, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async (event: GestureResponderEvent) => {
		event.preventDefault();
		setLoading(true);

		try {
			const { data } = await axios.post(
				"https://auctionmarket.tech/api/email/send",
				{
					to: "mpotulom28@gmail.com",
					from: form.email,
					subject: `Contact Form: ${form.name}`,
					html: contactFormTemplate({
						name: form.name,
						email: form.email,
						message: form.message,
					}),
					text: `Name: ${form.name}\nEmail: ${form.email}\nMessage:\n${form.message}`,
				},
				{
					headers: {
						Authorization: `Bearer ${process.env.EXPO_PUBLIC_EMAIL_API_KEY || ""}`,
					},
				},
			);
			axios
				.post(
					"https://auctionmarket.tech/api/email/send",
					{
						to: form.email,
						from: "support@auctionmarket.tech",
						subject: "We've received your message at Auction Market SA",
						html: contactFormUserConfirmationTemplate({
							name: form.name,
							email: form.email,
							message: form.message,
						}),
						text: `Hi ${form.name},\n\nThank you for contacting Auction Market SA. We have received your message and will get back to you soon.\n\nYour message:\n${form.message}\n\nBest regards,\nAuction Market SA Team`,
					},
					{
						headers: {
							Authorization: `Bearer ${process.env.EXPO_PUBLIC_EMAIL_API_KEY || ""}`,
						},
					},
				)
				.catch((err) => {
					// Sentry.captureException(err);
					console.error("User confirmation email error:", err);
				});

			if (data.success) {
				// toast.success("Message sent! We'll get back to you soon.");
				setForm({ name: "", email: "", message: "" });
			} else {
				// Sentry.captureException(new Error(data.error || "Failed to send message."));
				console.error("Contact form error:", data.error || "Failed to send message.");
				// toast.error(data.error || "Failed to send message.");
			}
		} catch (err: any) {
			// Sentry.captureException(err);
			console.error("Contact form error:", err);
			// toast.error(err?.response?.data?.error || err?.message || "Failed to send message.");
		}
		setLoading(false);
	};

	return (
		<ThemedView style={styles.container}>
			<KeyboardAvoidingView
				behavior={Platform.OS === "ios" ? "padding" : undefined}
				style={{ flex: 1 }}>
				<ScrollView contentContainerStyle={styles.content}>
					<View style={styles.card}>
						<View style={styles.headerRow}>
							<Mail size={28} color={Colors.light.tint} />
							<ThemedText type="title" style={styles.heading}>
								Contact Us
							</ThemedText>
						</View>
						<ThemedText style={styles.subheading}>
							Have a question or need help? Fill out the form below and our team will
							respond as soon as possible.
						</ThemedText>
						<View style={styles.form}>
							<TextInput
								style={styles.input}
								placeholder="Your Name"
								value={form.name}
								onChangeText={(v) => handleChange("name", v)}
								autoCapitalize="words"
								returnKeyType="next"
							/>
							<TextInput
								style={styles.input}
								placeholder="Your Email"
								value={form.email}
								onChangeText={(v) => handleChange("email", v)}
								keyboardType="email-address"
								autoCapitalize="none"
								returnKeyType="next"
							/>
							<TextInput
								style={[styles.input, styles.textarea]}
								placeholder="Your Message"
								value={form.message}
								onChangeText={(v) => handleChange("message", v)}
								multiline
								numberOfLines={6}
								textAlignVertical="top"
							/>
							<TouchableOpacity
								style={styles.button}
								onPress={handleSubmit}
								disabled={loading}>
								{loading ? (
									<ThemedText style={styles.buttonText}>Sending...</ThemedText>
								) : (
									<View style={{ flexDirection: "row", alignItems: "center" }}>
										<Send size={18} color="#fff" style={{ marginRight: 8 }} />
										<ThemedText style={styles.buttonText}>
											Send Message
										</ThemedText>
									</View>
								)}
							</TouchableOpacity>
						</View>
						<View style={styles.contactInfo}>
							<View style={styles.infoRow}>
								<Mail size={18} color={Colors.light.tint} />
								<ThemedText style={styles.infoText}>
									support@auctionmarket.tech
								</ThemedText>
							</View>
							<View style={styles.infoRow}>
								<Phone size={18} color={Colors.light.tint} />
								<ThemedText style={styles.infoText}>+1 234 567 890</ThemedText>
							</View>
						</View>
						<View style={styles.grid}>
							<View style={styles.gridItem}>
								<MessageCircle size={20} color={Colors.light.tint} />
								<ThemedText style={styles.gridText}>
									Live chat available 9am-5pm
								</ThemedText>
							</View>
							<View style={styles.gridItem}>
								<Users size={20} color={Colors.light.tint} />
								<ThemedText style={styles.gridText}>
									Join our community forum
								</ThemedText>
							</View>
						</View>
						<View style={styles.responseTime}>
							<Smile size={20} color="#22c55e" />
							<ThemedText style={styles.responseText}>
								Our average response time:{" "}
								<ThemedText style={styles.bold}>2 hours</ThemedText>
							</ThemedText>
						</View>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 24,
	},
	content: {
		minHeight: "100%",
		padding: 18,
	},
	card: {
		backgroundColor: Colors.light.card,
		borderRadius: 18,
		padding: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
		minHeight: "90%",
	},
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 8,
	},
	heading: {
		fontSize: 26,
		fontWeight: "bold",
		marginLeft: 6,
	},
	subheading: {
		color: Colors.light.textMutedForeground,
		marginBottom: 16,
		fontSize: 15,
	},
	form: {
		gap: 12,
		marginBottom: 18,
	},
	input: {
		backgroundColor: Colors.light.input,
		borderRadius: 8,
		paddingHorizontal: 14,
		paddingVertical: 10,
		fontSize: 16,
		borderWidth: 1,
		borderColor: Colors.light.border,
	},
	textarea: {
		minHeight: 120,
	},
	button: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 12,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 4,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	contactInfo: {
		marginTop: 18,
		gap: 6,
	},
	infoRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	infoText: {
		fontSize: 15,
		color: Colors.light.textMutedForeground,
	},
	grid: {
		marginTop: 18,
		flexDirection: "column",
		justifyContent: "space-between",
		gap: 10,
	},
	gridItem: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: Colors.light.muted,
		borderRadius: 8,
		padding: 10,
		gap: 8,
	},
	gridText: {
		fontSize: 14,
		color: Colors.light.textSecondaryForeground,
	},
	responseTime: {
		marginTop: 18,
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
	},
	responseText: {
		color: "#22c55e",
		fontSize: 15,
	},
	bold: {
		fontWeight: "bold",
		color: "#22c55e",
	},
});

export default ContactUsScreen;
