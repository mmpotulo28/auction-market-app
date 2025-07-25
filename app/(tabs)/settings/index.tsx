import AboutModal from "@/components/AboutModal";
import PopupModal from "@/components/PopupModal";
import ShareApp from "@/components/ShareApp";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useAccountContext } from "@/context/AccountContext";
import { useWebSocket } from "@/context/WebSocketProvider";
import { setColorScheme, useColorScheme } from "@/hooks/useColorScheme";
import logger from "@/lib/logger";
import { useAuth } from "@clerk/clerk-expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import * as Location from "expo-location";
import { router } from "expo-router";
import { Bell, Info, Lock, LogOut, Moon, RefreshCcwDot } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity, View } from "react-native";
import { toast } from "sonner-native";

const SettingsScreen = () => {
	const colorScheme = useColorScheme();
	const { biometricEnabled, biometricType, setBiometricEnabled, refreshBiometricState } =
		useAccountContext();
	const [darkMode, setDarkModeState] = useState(colorScheme === "dark");
	const [inAppNotifications, setInAppNotifications] = useState(true);
	const [browserPushNotifications, setBrowserPushNotifications] = useState(false);
	const [showClearModal, setShowClearModal] = useState(false);
	const [showAboutModal, setShowAboutModal] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

	// Privacy controls state
	const [locationAccess, setLocationAccess] = useState(false);
	const [cookieConsent, setCookieConsent] = useState(false);
	const [emailSubscribe, setEmailSubscribe] = useState(true);

	const { signOut } = useAuth();
	const { fetchNotifications, fetchOrders, fetchTransactions } = useAccountContext();
	const { fetchItems, getAllBids } = useWebSocket();

	// Check location permission on mount
	useEffect(() => {
		(async () => {
			const { status } = await Location.getForegroundPermissionsAsync();
			setLocationAccess(status === "granted");
		})();
	}, []);

	const handleThemeChange = (isDark: boolean) => {
		setDarkModeState(isDark);
		setColorScheme(isDark ? "dark" : "light");
	};

	const handleClearStorage = async () => {
		try {
			await AsyncStorage.clear();
			setShowClearModal(false);
			Alert.alert("Success", "App storage and cache cleared.");
		} catch (e) {
			setShowClearModal(false);
			Alert.alert("Error", "Failed to clear storage.");
			logger.error("Error clearing storage:", e);
		}
	};

	const handleLocationToggle = async (value: boolean) => {
		if (value) {
			const { status } = await Location.requestForegroundPermissionsAsync();
			setLocationAccess(status === "granted");
		} else {
			// No direct way to revoke permission, so just update UI state
			setLocationAccess(false);
		}
	};

	const handleBiometricToggle = async (value: boolean) => {
		if (value) {
			const compatible = await LocalAuthentication.hasHardwareAsync();
			const enrolled = await LocalAuthentication.isEnrolledAsync();
			if (!compatible) {
				Alert.alert(
					"Biometric not supported",
					"Your device does not support biometric authentication.",
				);
				return;
			}
			if (!enrolled) {
				const enroll = await LocalAuthentication.authenticateAsync({
					promptMessage: "Register your biometrics to enable biometric login.",
				});
				if (!enroll.success) {
					Alert.alert("Biometric setup failed", "Could not register biometrics.");
					return;
				}
			}
			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: "Enable biometric login",
			});
			if (result.success) {
				await setBiometricEnabled(true);
				Alert.alert("Success", "Biometric login enabled.");
			} else {
				await setBiometricEnabled(false);
				Alert.alert("Failed", "Biometric authentication was not successful.");
			}
		} else {
			await setBiometricEnabled(false);
			Alert.alert("Biometric login disabled");
		}
		await refreshBiometricState();
	};

	const handleLogout = async () => {
		try {
			await signOut();
			// Optionally clear AsyncStorage or any other app state here
			router.replace("/(auth)/sign-in");
		} catch (e) {
			logger.error("Error logging out:", e);
			Alert.alert("Error", "Failed to log out.");
		}
	};

	const handleRefreshApp = async () => {
		try {
			setRefreshing(true);
			await Promise.all([
				AsyncStorage.clear(),
				fetchNotifications(),
				fetchOrders(),
				fetchTransactions(),
				fetchItems(),
				getAllBids(),
			]);

			setRefreshing(false);

			toast.success("App data refreshed successfully.", {
				description: "All data has been reloaded.",
			});
		} catch (e) {
			logger.error("Error refreshing app:", e);
			Alert.alert("Error", "Failed to refresh app.");
		}
	};

	const settingsOptions = [
		{
			icon: <Info size={22} color={Colors.light.tint} />,
			label: "About",
			description: "Learn more about the Auction App",
			onPress: () => setShowAboutModal(true),
		},
		{
			icon: <Lock size={22} color={Colors.light.tint} />,
			label: "Clear Cookies, Storage & Cache",
			description: "Remove all app data and cached files",
			onPress: () => setShowClearModal(true),
		},
	];

	return (
		<ThemedView style={styles.container}>
			<ScrollView contentContainerStyle={styles.scrollContent}>
				<ThemedView type="card" style={styles.section}>
					<ThemedText style={styles.sectionTitle}>Preferences</ThemedText>

					<View style={styles.row}>
						<View style={styles.rowLeft}>
							<Moon size={22} color={Colors.light.tint} />
							<ThemedText style={styles.rowLabel}>
								{darkMode ? "Dark Mode" : "Light Mode"}
							</ThemedText>
						</View>
						<Switch
							value={darkMode}
							onValueChange={() => handleThemeChange(!darkMode)}
							thumbColor={Colors.light.tint}
							trackColor={{ false: "#e0eaff", true: Colors.light.tint }}
						/>
					</View>
					<View style={styles.row}>
						<View style={styles.rowLeft}>
							<Bell size={22} color={Colors.light.tint} />
							<ThemedText style={styles.rowLabel}>In-App Notifications</ThemedText>
						</View>
						<Switch
							value={inAppNotifications}
							onValueChange={setInAppNotifications}
							thumbColor={Colors.light.tint}
							trackColor={{ false: "#e0eaff", true: Colors.light.tint }}
						/>
					</View>
					<View style={styles.row}>
						<View style={styles.rowLeft}>
							<Bell size={22} color={Colors.light.tint} />
							<ThemedText style={styles.rowLabel}>Push Notifications</ThemedText>
						</View>
						<Switch
							value={browserPushNotifications}
							onValueChange={setBrowserPushNotifications}
							thumbColor={Colors.light.tint}
							trackColor={{ false: "#e0eaff", true: Colors.light.tint }}
						/>
					</View>
					<View style={styles.row}>
						<View style={styles.rowLeft}>
							<Lock size={22} color={Colors.light.tint} />
							<ThemedText style={styles.rowLabel}>Enable Biometric Login</ThemedText>
						</View>
						<Switch
							value={biometricEnabled}
							onValueChange={handleBiometricToggle}
							thumbColor={Colors.light.tint}
							trackColor={{ false: "#e0eaff", true: Colors.light.tint }}
						/>
					</View>
					{biometricEnabled && biometricType && (
						<ThemedText
							style={{
								color: Colors.light.textMutedForeground,
								marginLeft: 36,
								marginBottom: 8,
							}}>
							Biometric type: {biometricType}
						</ThemedText>
					)}
				</ThemedView>

				<ThemedView type="card" style={styles.section}>
					<ThemedText style={styles.sectionTitle}>Privacy & Permissions</ThemedText>
					<View style={styles.row}>
						<View style={styles.rowLeft}>
							<Lock size={22} color={Colors.light.tint} />
							<ThemedText style={styles.rowLabel}>Location Access</ThemedText>
						</View>
						<Switch
							value={locationAccess}
							onValueChange={handleLocationToggle}
							thumbColor={Colors.light.tint}
							trackColor={{ false: "#e0eaff", true: Colors.light.tint }}
						/>
					</View>
					<View style={styles.row}>
						<View style={styles.rowLeft}>
							<Lock size={22} color={Colors.light.tint} />
							<ThemedText style={styles.rowLabel}>Cookie Consent</ThemedText>
						</View>
						<Switch
							value={cookieConsent}
							onValueChange={setCookieConsent}
							thumbColor={Colors.light.tint}
							trackColor={{ false: "#e0eaff", true: Colors.light.tint }}
						/>
					</View>
					<View style={styles.row}>
						<View style={styles.rowLeft}>
							<Bell size={22} color={Colors.light.tint} />
							<ThemedText style={styles.rowLabel}>Subscribe to Emails</ThemedText>
						</View>
						<Switch
							value={emailSubscribe}
							onValueChange={setEmailSubscribe}
							thumbColor={Colors.light.tint}
							trackColor={{ false: "#e0eaff", true: Colors.light.tint }}
						/>
					</View>
				</ThemedView>

				<ThemedView type="card" style={styles.section}>
					<ThemedText style={styles.sectionTitle}>App</ThemedText>
					{settingsOptions.map((option, idx) => (
						<TouchableOpacity
							key={option.label}
							style={[
								styles.optionRow,
								idx === settingsOptions.length - 1 && { borderBottomWidth: 0 },
							]}
							activeOpacity={0.7}
							onPress={option.onPress}>
							<View style={styles.optionIcon}>{option.icon}</View>
							<View style={styles.optionText}>
								<ThemedText style={styles.optionLabel}>{option.label}</ThemedText>
								<ThemedText style={styles.optionDesc}>
									{option.description}
								</ThemedText>
							</View>
						</TouchableOpacity>
					))}
				</ThemedView>
				<ThemedView type="card" style={styles.section}>
					<ThemedText style={styles.sectionTitle}>Share the App</ThemedText>
					<ThemedText style={styles.rowLabel}>
						Help us spread the word! Share the app with your friends and family.
					</ThemedText>
					<ShareApp />
				</ThemedView>

				<ThemedView type="card" style={styles.section}>
					<TouchableOpacity
						style={[styles.logoutBtn, { backgroundColor: Colors.light.tint }]}
						activeOpacity={0.8}
						onPress={handleRefreshApp}
						disabled={refreshing}>
						<RefreshCcwDot size={20} color="#fff" style={{ marginRight: 8 }} />
						<ThemedText style={styles.logoutText}>
							{refreshing ? "Refreshing..." : "Refresh App"}
						</ThemedText>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.logoutBtn}
						activeOpacity={0.8}
						onPress={handleLogout}>
						<LogOut size={20} color="#fff" style={{ marginRight: 8 }} />
						<ThemedText style={styles.logoutText}>Log Out</ThemedText>
					</TouchableOpacity>
				</ThemedView>
			</ScrollView>
			<PopupModal
				visible={showClearModal}
				title="Clear Storage"
				message="Are you sure you want to clear all app cookies, storage, and cache? This action cannot be undone."
				onCancel={() => setShowClearModal(false)}
				onConfirm={handleClearStorage}
				confirmText="Clear"
				cancelText="Cancel"
			/>
			<AboutModal visible={showAboutModal} onClose={() => setShowAboutModal(false)} />
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 44,
	},
	scrollContent: {
		paddingBottom: 32,
	},
	heading: {
		fontSize: 28,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 18,
		letterSpacing: 0.2,
	},
	section: {
		borderRadius: 16,
		marginHorizontal: 18,
		marginBottom: 24,
		padding: 18,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.06,
		shadowRadius: 8,
		elevation: 2,
	},
	sectionTitle: {
		fontWeight: "700",
		fontSize: 16,
		marginBottom: 12,
		color: Colors.light.textPrimaryForeground,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 14,
	},
	rowLeft: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	rowLabel: {
		fontSize: 16,
		marginLeft: 8,
	},
	optionRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		paddingVertical: 14,
		borderBottomWidth: 1,
		borderBottomColor: Colors.light.border,
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
		fontSize: 16,
		marginBottom: 2,
	},
	optionDesc: {
		color: Colors.light.textMutedForeground,
		fontSize: 14,
	},
	logoutBtn: {
		marginTop: 8,
		backgroundColor: Colors.light.destructive,
		paddingVertical: 14,
		borderRadius: 10,
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
	},
	logoutText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
});

export default SettingsScreen;
