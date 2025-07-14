import Actions from "@/components/common/Actions";
import PopupModal from "@/components/PopupModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { SOCIAL_PROVIDERS } from "@/lib/helper_components";
import { iVariant } from "@/lib/types";
import { useSignUp } from "@clerk/clerk-expo";
import * as ClerkTypes from "@clerk/types";
import { makeRedirectUri } from "expo-auth-session";
import { router } from "expo-router";
import { Home, LogInIcon } from "lucide-react-native";
import { useState } from "react";
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

const SignUpScreen = () => {
	const { signUp, setActive, isLoaded } = useSignUp();
	const [loading, setLoading] = useState(false);
	const [errorModal, setErrorModal] = useState<{ visible: boolean; message: string }>({
		visible: false,
		message: "",
	});
	const [form, setForm] = useState({
		email: "",
		password: "",
	});

	const handleChange = (key: string, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const handleSubmit = async () => {
		if (!form.email || !form.password) {
			setErrorModal({ visible: true, message: "Please fill in all fields." });
			return;
		}
		if (!isLoaded) return;
		setLoading(true);
		try {
			const result = await signUp.create({
				emailAddress: form.email,
				password: form.password,
			});
			if (result.status === "complete") {
				await setActive({ session: result.createdSessionId });
				router.replace("/"); // Redirect to home or dashboard
			} else if (result.status === "missing_requirements") {
				setErrorModal({
					visible: true,
					message: "Please check your email for verification.",
				});
			} else {
				setErrorModal({ visible: true, message: "Additional steps required." });
			}
		} catch (err: any) {
			setErrorModal({
				visible: true,
				message: err?.errors?.[0]?.message || err?.message || "Sign up failed.",
			});
		}
		setLoading(false);
	};

	const handleSocialSignUp = async (provider: string) => {
		if (!isLoaded) return;
		setLoading(true);
		try {
			const redirectUrl = makeRedirectUri({ path: "/oauth-native-callback" });
			await signUp.authenticateWithRedirect({
				strategy: `oauth_${provider}` as ClerkTypes.OAuthStrategy,
				redirectUrl,
				redirectUrlComplete: redirectUrl,
			});
		} catch (err: any) {
			setErrorModal({
				visible: true,
				message: err?.errors?.[0]?.message || err?.message || "Social sign up failed.",
			});
		}
		setLoading(false);
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
				<ThemedView style={styles.container}>
					<View style={styles.logoContainer}>
						<Image
							source={require("@/assets/images/amsa-logo.png")}
							style={styles.logo}
							resizeMode="contain"
						/>
					</View>
					<ThemedView type="card" style={styles.formCard}>
						<ThemedText type="title" style={styles.heading}>
							Sign Up
						</ThemedText>
						<View style={styles.socialCol}>
							{SOCIAL_PROVIDERS.map((provider) => (
								<TouchableOpacity
									key={provider.key}
									style={styles.socialBtn}
									onPress={() => handleSocialSignUp(provider.key)}
									disabled={loading}>
									{provider.icon}
									<ThemedText style={styles.socialBtnText}>
										Sign up with {provider.name}
									</ThemedText>
								</TouchableOpacity>
							))}
						</View>
						<View style={styles.dividerRow}>
							<View style={styles.divider} />
							<ThemedText style={styles.dividerText}>or</ThemedText>
							<View style={styles.divider} />
						</View>
						<View style={styles.form}>
							<TextInput
								style={styles.input}
								placeholder="Email"
								autoCapitalize="none"
								keyboardType="email-address"
								value={form.email}
								onChangeText={(v) => handleChange("email", v)}
								placeholderTextColor={Colors.light.textMutedForeground}
								inputMode="email"
							/>
							<TextInput
								style={styles.input}
								placeholder="Password"
								secureTextEntry
								value={form.password}
								onChangeText={(v) => handleChange("password", v)}
								placeholderTextColor={Colors.light.textMutedForeground}
								passwordRules={
									"required: lower; required: upper; required: digit; minlength: 8;"
								}
							/>

							<Actions
								actions={[
									{
										label: loading ? "Signing Up..." : "Sign Up",
										click: handleSubmit,
										disabled: loading,
										iconEnd: <LogInIcon size={18} color="#fff" />,
										variant: iVariant.Primary,
									},
									{
										label: "Sign In",
										click: () => router.push("/(auth)/sign-in"),
										variant: iVariant.Secondary,
									},
									{
										click: () => router.push("/(tabs)"),
										iconEnd: <Home size={18} color="#fff" />,
										variant: iVariant.Quinary,
									},
								]}
							/>
						</View>
					</ThemedView>
					<PopupModal
						visible={errorModal.visible}
						title="Error"
						message={errorModal.message}
						onCancel={() => setErrorModal({ visible: false, message: "" })}
						onConfirm={() => setErrorModal({ visible: false, message: "" })}
						confirmText="OK"
						cancelText="Close"
					/>
				</ThemedView>
			</ScrollView>
		</KeyboardAvoidingView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 24,
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 18,
	},
	logo: {
		width: 110,
		height: 110,
		borderRadius: 24,
		backgroundColor: "#fff",
		marginBottom: 8,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	formCard: {
		borderRadius: 18,
		padding: 24,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 2,
	},
	heading: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 24,
		color: Colors.light.textPrimaryForeground,
	},
	form: {
		gap: 18,
	},
	input: {
		backgroundColor: Colors.light.input,
		borderRadius: 8,
		paddingHorizontal: 14,
		paddingVertical: 14,
		fontSize: 16,
		borderWidth: 1,
		borderColor: Colors.light.border,
		color: Colors.light.text,
	},
	button: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 14,
		borderRadius: 8,
		alignItems: "center",
		marginTop: 8,
		shadowColor: "#014b8b",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.13,
		shadowRadius: 6,
		elevation: 2,
	},
	buttonText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
		letterSpacing: 0.2,
	},
	link: {
		color: Colors.light.tint,
		textAlign: "center",
		marginTop: 12,
		fontWeight: "600",
		fontSize: 15,
	},
	socialCol: {
		flexDirection: "column",
		gap: 12,
		marginBottom: 12,
	},
	socialRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 12,
		marginBottom: 12,
	},
	socialBtn: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#f6faff",
		borderRadius: 8,
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderWidth: 1,
		borderColor: "#e0eaff",
		gap: 8,
	},
	socialBtnText: {
		fontWeight: "600",
		fontSize: 15,
		color: Colors.light.textPrimaryForeground,
	},
	dividerRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 10,
	},
	divider: {
		flex: 1,
		height: 1,
		backgroundColor: "#e0eaff",
	},
	dividerText: {
		marginHorizontal: 10,
		color: Colors.light.textMutedForeground,
		fontSize: 14,
	},
});

export default SignUpScreen;
