import PopupModal from "@/components/PopupModal";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { SOCIAL_PROVIDERS } from "@/lib/helper_components";
import { useSignIn } from "@clerk/clerk-expo";
import { useLocalCredentials } from "@clerk/clerk-expo/local-credentials";
import * as ClerckTypes from "@clerk/types";
import { makeRedirectUri } from "expo-auth-session";
import { router } from "expo-router";
import React, { useState } from "react";
import { Image, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";

const SignInScreen = () => {
	const { signIn, setActive, isLoaded } = useSignIn();
	const {
		hasCredentials,
		setCredentials,
		authenticate,
		biometricType,
		clearCredentials,
		userOwnsCredentials,
	} = useLocalCredentials();

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

	const onSignInPress = async (useLocal: boolean) => {
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

			console.log("Sign in attempt result:", signInAttempt);
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
			});
		} catch (err: any) {
			setErrorModal({
				visible: true,
				message: err?.errors?.[0]?.message || err?.message || "Social sign in failed.",
			});
		}
		setLoading(false);
	};

	const handleClearCredentials = async () => {
		await clearCredentials();
	};

	return (
		<ThemedView style={styles.container}>
			<View style={styles.logoContainer}>
				<Image
					source={require("@/assets/images/amsa-logo.png")}
					style={styles.logo}
					resizeMode="contain"
				/>
			</View>
			<View style={styles.formCard}>
				<ThemedText type="title" style={styles.heading}>
					Sign In
				</ThemedText>
				{hasCredentials && biometricType && (
					<TouchableOpacity
						style={[styles.button, { backgroundColor: "#1976c5", marginBottom: 10 }]}
						onPress={() => onSignInPress(true)}
						disabled={loading}>
						<ThemedText style={styles.buttonText}>
							{loading
								? "Authenticating..."
								: biometricType === "face-recognition"
								? "Sign in with Face ID"
								: "Sign in with Touch ID"}
						</ThemedText>
					</TouchableOpacity>
				)}
				{hasCredentials && userOwnsCredentials && (
					<TouchableOpacity
						style={[styles.button, { backgroundColor: "#c90000", marginBottom: 10 }]}
						onPress={handleClearCredentials}
						disabled={loading}>
						<ThemedText style={styles.buttonText}>
							Remove Biometric Credentials
						</ThemedText>
					</TouchableOpacity>
				)}
				<View style={styles.socialCol}>
					{SOCIAL_PROVIDERS.map((provider) => (
						<TouchableOpacity
							key={provider.key}
							style={styles.socialBtn}
							onPress={() => handleSocialSignIn(provider.key)}
							disabled={loading}>
							{provider.icon}
							<ThemedText style={styles.socialBtnText}>
								Sign in with {provider.name}
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
					/>
					<TextInput
						style={styles.input}
						placeholder="Password"
						secureTextEntry
						value={form.password}
						onChangeText={(v) => handleChange("password", v)}
						placeholderTextColor={Colors.light.textMutedForeground}
					/>
					<TouchableOpacity
						style={styles.button}
						onPress={() => onSignInPress(false)}
						disabled={loading}>
						<ThemedText style={styles.buttonText}>
							{loading ? "Signing In..." : "Sign In"}
						</ThemedText>
					</TouchableOpacity>
					<TouchableOpacity onPress={() => router.push("/(auth)/sign-up")}>
						<ThemedText style={styles.link}>
							Don&apos;t have an account? Sign Up
						</ThemedText>
					</TouchableOpacity>
				</View>
			</View>
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
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		padding: 24,
		backgroundColor: Colors.light.background,
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
		backgroundColor: Colors.light.card,
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
