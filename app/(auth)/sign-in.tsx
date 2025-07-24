import Actions from "@/components/common/Actions";
import PopupModal from "@/components/PopupModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAccountContext } from "@/context/AccountContext";
import { SOCIAL_PROVIDERS } from "@/lib/helper_components";
import logger from "@/lib/logger";
import { iVariant } from "@/lib/types";
import { useSignIn } from "@clerk/clerk-expo";
import { useLocalCredentials } from "@clerk/clerk-expo/local-credentials";
import * as ClerckTypes from "@clerk/types";
import { makeRedirectUri } from "expo-auth-session";
import * as LocalAuthentication from "expo-local-authentication";
import { router } from "expo-router";
import { FingerprintIcon, HomeIcon, LogInIcon, ScanFace } from "lucide-react-native";
import React, { useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const SignInScreen = () => {
	const { signIn, setActive, isLoaded } = useSignIn();
	const { hasCredentials, setCredentials, authenticate } = useLocalCredentials();
	const { biometricEnabled, biometricType, refreshBiometricState } = useAccountContext();

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

	const handleSubmit = async (useLocal: boolean) => {
		if (!isLoaded) return;
		setLoading(true);
		try {
			const signInAttempt =
				hasCredentials && useLocal
					? await authenticate()
					: await signIn.create({
							identifier: form.email,
							password: form.password,
					  });

			logger.info("Sign in attempt result:", signInAttempt.userData.firstName);
			if (signInAttempt.status === "complete") {
				if (!useLocal) {
					await setCredentials({
						identifier: form.email,
						password: form.password,
					});
				}
				await setActive({ session: signInAttempt.createdSessionId });
				router.replace("/");
			} else {
				setErrorModal({ visible: true, message: "Additional steps required." });
			}
		} catch (err: any) {
			setErrorModal({
				visible: true,
				message: err?.errors?.[0]?.message || err?.message || "Sign in failed.",
			});
		}
		setLoading(false);
	};

	const handleSocialSignIn = async (provider: string) => {
		if (!isLoaded) return;
		setLoading(true);
		try {
			const redirectUrl = makeRedirectUri({ path: "/oauth-native-callback" });
			await signIn.authenticateWithRedirect({
				strategy: `oauth_${provider}` as ClerckTypes.OAuthStrategy,
				redirectUrl,
				redirectUrlComplete: redirectUrl,
				legalAccepted: true,
			});
		} catch (err: any) {
			setErrorModal({
				visible: true,
				message: err?.errors?.[0]?.message || err?.message || "Social sign in failed.",
			});
		}
		setLoading(false);
	};

	const handleBiometricSignIn = async () => {
		setLoading(true);
		const result = await LocalAuthentication.authenticateAsync({
			promptMessage: "Sign in with biometrics",
		});

		const enrolledLevel = await LocalAuthentication.getEnrolledLevelAsync();
		logger.info("Biometric enrolled level:", enrolledLevel);
		setLoading(false);
		await refreshBiometricState();
		if (result.success) {
			// pull the latest credentials
			const credentials = hasCredentials;
			if (!credentials) {
				setErrorModal({
					visible: true,
					message:
						"No saved credentials found. Please sign in with email and password first.",
				});
				return;
			}

			logger.info("Biometric authentication successful", result);
			// router.replace("/");
		} else {
			// Optionally show error
			setErrorModal({
				visible: true,
				message: result.error || "Biometric authentication failed.",
			});
			logger.error("Biometric authentication failed", result);
		}
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1 }}
			behavior={Platform.OS === "ios" ? "padding" : "height"}>
			<ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
				<ThemedView style={styles.container}>
					<ThemedView type="card" style={styles.formCard}>
						<ThemedText type="title" style={styles.heading}>
							Sign In
						</ThemedText>
						{biometricEnabled && biometricType && (
							<TouchableOpacity
								style={[
									styles.button,
									{ backgroundColor: "#1976c5", marginBottom: 10 },
								]}
								onPress={handleBiometricSignIn}
								disabled={loading}>
								<ThemedText style={styles.buttonText}>
									{loading ? (
										"Authenticating..."
									) : biometricType === "Face ID" ? (
										"Sign in with Face ID"
									) : biometricType === "Fingerprint" ? (
										<>
											Sign in with <FingerprintIcon size={18} color="#fff" />
										</>
									) : (
										<>
											Sign in with <ScanFace size={18} color="#fff" />
										</>
									)}
								</ThemedText>
							</TouchableOpacity>
						)}

						<View style={styles.socialCol}>
							<Actions
								fullWidth
								actions={SOCIAL_PROVIDERS.map((provider) => ({
									label: `Sign in with ${provider.name}`,
									click: () => handleSocialSignIn(provider.name),
									iconStart: provider.icon,
									variant: iVariant.Secondary,
									isLoading: loading,
									disabled: true,
								}))}
							/>
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
							/>
							<TextInput
								style={styles.input}
								placeholder="Password"
								secureTextEntry
								value={form.password}
								onChangeText={(v) => handleChange("password", v)}
								placeholderTextColor={Colors.light.textMutedForeground}
							/>
							<Actions
								actions={[
									{
										label: "Sign In",
										click: () => handleSubmit(false),
										disabled: loading,
										iconEnd: <LogInIcon size={18} color="#fff" />,
										variant: iVariant.Primary,
										isLoading: loading,
									},
									{
										label: "Sign Up",
										click: () => router.push("/(auth)/sign-up"),
										variant: iVariant.Secondary,
									},
									{
										label: "",
										click: () => router.push("/(tabs)"),
										iconEnd: <HomeIcon size={18} color="#fff" />,
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
		minWidth: "100%", // Ensure full width on small screens
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
		minWidth: "100%",
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
	socialRow: {
		flexDirection: "row",
		justifyContent: "center",
		gap: 12,
		marginBottom: 12,
	},
	socialCol: {
		flexDirection: "column",
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

export default SignInScreen;
