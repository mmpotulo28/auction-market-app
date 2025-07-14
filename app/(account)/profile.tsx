import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import logger from "@/lib/logger";
import { useUser } from "@clerk/clerk-expo";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
	ActivityIndicator,
	Alert,
	Image,
	ScrollView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

export default function ProfileScreen() {
	const { user, isLoaded } = useUser();
	const router = useRouter();

	// Redirect to sign-in if not logged in

	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState({
		firstName: user?.firstName || "",
		lastName: user?.lastName || "",
		profileImageUrl: user?.imageUrl || "",
		phoneNumber: user?.primaryPhoneNumber?.phoneNumber || "",
		email: user?.primaryEmailAddress?.emailAddress || "",
	});
	const [newEmail, setNewEmail] = useState("");
	const [newPhone, setNewPhone] = useState("");
	const [loading, setLoading] = useState(false);

	if (isLoaded && !user) {
		router.replace("/(auth)/sign-in");
		return null;
	}

	const handleChange = (key: string, value: string) => {
		setForm((prev) => ({ ...prev, [key]: value }));
	};

	const update = async (data: { firstName?: string; lastName?: string }) => {
		if (!user) return;
		setLoading(true);
		try {
			await user.update(data);
			setForm((prev) => ({
				...prev,
				firstName: data.firstName || prev.firstName,
				lastName: data.lastName || prev.lastName,
			}));
		} catch (err: any) {
			Alert.alert("Error", err?.message || "Failed to update profile.");
		}
		setLoading(false);
	};

	const setProfileImage = async (image: {
		uri: string;
		type: string;
		name: string;
		file: any;
	}) => {
		if (!user) return;
		setLoading(true);
		try {
			await user.setProfileImage(image);
			setForm((prev) => ({ ...prev, profileImageUrl: image.uri }));
		} catch (err: any) {
			Alert.alert("Error", err?.message || "Failed to update profile picture.");
		}
		setLoading(false);
	};

	const handleSave = async () => {
		if (!user) return;
		setLoading(true);
		try {
			await update({
				firstName: form.firstName,
				lastName: form.lastName,
			});
			setEditing(false);
		} catch (err: any) {
			Alert.alert("Error", err?.message || "Failed to update profile.");
		}
		setLoading(false);
	};

	const handlePickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 0.7,
		});
		if (!result.canceled && result.assets && result.assets[0]?.uri) {
			setLoading(true);
			try {
				await setProfileImage({
					file: result.assets[0],
					uri: result.assets[0].uri,
					type: "image/jpeg",
					name: "profile.jpg",
				});
			} catch (err: any) {
				Alert.alert("Error", err?.message || "Failed to update profile picture.");
			}
			setLoading(false);
		}
	};

	const handleAddEmail = async () => {
		if (!newEmail) return;
		setLoading(true);
		try {
			const emailObj = await user?.createEmailAddress({ email: newEmail });
			logger.info("Added email:", emailObj);
			setForm((prev) => ({ ...prev, email: newEmail }));
			setNewEmail("");
		} catch (err: any) {
			Alert.alert("Error", err?.message || "Failed to add email.");
		}
		setLoading(false);
	};

	const handleAddPhone = async () => {
		if (!newPhone) return;
		setLoading(true);
		try {
			// Only add phone, do not update or set as primary
			await user?.createPhoneNumber({ phoneNumber: newPhone });
			setNewPhone("");
		} catch (err: any) {
			Alert.alert("Error", err?.message || "Failed to add phone number.");
		}
		setLoading(false);
	};

	if (!isLoaded) {
		return (
			<ThemedView style={styles.container}>
				<ActivityIndicator size="large" color={Colors.light.tint} />
			</ThemedView>
		);
	}

	return (
		<ThemedView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content}>
				<View style={styles.avatarRow}>
					<Image
						source={
							form.profileImageUrl
								? { uri: form.profileImageUrl }
								: require("@/assets/images/amsa-logo.png")
						}
						style={styles.avatar}
					/>
					<TouchableOpacity style={styles.editAvatarBtn} onPress={handlePickImage}>
						<ThemedText style={styles.editAvatarText}>Change Photo</ThemedText>
					</TouchableOpacity>
				</View>
				<View style={styles.form}>
					<TextInput
						style={styles.input}
						placeholder="First Name"
						value={form.firstName}
						onChangeText={(v) => handleChange("firstName", v)}
						editable={editing}
					/>
					<TextInput
						style={styles.input}
						placeholder="Last Name"
						value={form.lastName}
						onChangeText={(v) => handleChange("lastName", v)}
						editable={editing}
					/>
					<TextInput
						style={styles.input}
						placeholder="Phone Number"
						value={form.phoneNumber}
						onChangeText={(v) => handleChange("phoneNumber", v)}
						editable={false}
						keyboardType="phone-pad"
					/>
					<TextInput
						style={styles.input}
						placeholder="Primary Email"
						value={form.email}
						editable={false}
					/>
					{editing && (
						<>
							<View style={styles.addRow}>
								<TextInput
									style={[styles.input, { flex: 1 }]}
									placeholder="Add Email"
									value={newEmail}
									onChangeText={setNewEmail}
									keyboardType="email-address"
								/>
								<TouchableOpacity style={styles.addBtn} onPress={handleAddEmail}>
									<ThemedText style={styles.addBtnText}>Add</ThemedText>
								</TouchableOpacity>
							</View>
							<View style={styles.addRow}>
								<TextInput
									style={[styles.input, { flex: 1 }]}
									placeholder="Add Phone"
									value={newPhone}
									onChangeText={setNewPhone}
									keyboardType="phone-pad"
								/>
								<TouchableOpacity style={styles.addBtn} onPress={handleAddPhone}>
									<ThemedText style={styles.addBtnText}>Add</ThemedText>
								</TouchableOpacity>
							</View>
						</>
					)}
					<View style={styles.section}>
						<ThemedText style={styles.sectionTitle}>Emails</ThemedText>
						{user?.emailAddresses?.map((email) => (
							<View key={email.id} style={styles.itemRow}>
								<ThemedText style={styles.itemText}>
									{email.emailAddress}
								</ThemedText>
							</View>
						))}
					</View>
					<View style={styles.section}>
						<ThemedText style={styles.sectionTitle}>Phone Numbers</ThemedText>
						{user?.phoneNumbers?.map((phone) => (
							<View key={phone.id} style={styles.itemRow}>
								<ThemedText style={styles.itemText}>{phone.phoneNumber}</ThemedText>
							</View>
						))}
					</View>
					<View style={styles.buttonRow}>
						{editing ? (
							<>
								<TouchableOpacity
									style={[styles.saveBtn, loading && { opacity: 0.7 }]}
									onPress={handleSave}
									disabled={loading}>
									<ThemedText style={styles.saveBtnText}>
										{loading ? "Saving..." : "Save"}
									</ThemedText>
								</TouchableOpacity>
								<TouchableOpacity
									style={styles.cancelBtn}
									onPress={() => setEditing(false)}
									disabled={loading}>
									<ThemedText style={styles.cancelBtnText}>Cancel</ThemedText>
								</TouchableOpacity>
							</>
						) : (
							<TouchableOpacity
								style={styles.editBtn}
								onPress={() => setEditing(true)}>
								<ThemedText style={styles.editBtnText}>Edit Profile</ThemedText>
							</TouchableOpacity>
						)}
					</View>
				</View>
			</ScrollView>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 24,
	},
	content: {
		padding: 18,
	},
	avatarRow: {
		alignItems: "center",
		marginBottom: 18,
	},
	avatar: {
		width: 100,
		height: 100,
		borderRadius: 50,
		backgroundColor: Colors.light.muted,
		marginBottom: 8,
	},
	editAvatarBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 8,
		paddingHorizontal: 18,
		borderRadius: 8,
		alignItems: "center",
	},
	editAvatarText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 15,
	},
	form: {
		gap: 14,
	},
	input: {
		backgroundColor: Colors.light.input,
		borderRadius: 8,
		paddingHorizontal: 14,
		paddingVertical: 12,
		fontSize: 16,
		borderWidth: 1,
		borderColor: Colors.light.border,
		color: Colors.light.text,
		marginBottom: 4,
	},
	addRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	addBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 10,
		paddingHorizontal: 16,
		borderRadius: 8,
		marginLeft: 8,
	},
	addBtnText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 15,
	},
	section: {
		marginTop: 12,
		marginBottom: 8,
	},
	sectionTitle: {
		fontWeight: "700",
		fontSize: 16,
		marginBottom: 6,
		color: Colors.light.textPrimaryForeground,
	},
	itemRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 4,
	},
	itemText: {
		fontSize: 15,
		color: Colors.light.textSecondaryForeground,
	},
	deleteBtn: {
		backgroundColor: Colors.light.destructive,
		paddingVertical: 6,
		paddingHorizontal: 14,
		borderRadius: 8,
	},
	deleteBtnText: {
		color: "#fff",
		fontWeight: "600",
		fontSize: 14,
	},
	buttonRow: {
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 18,
		gap: 12,
	},
	editBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 8,
		alignItems: "center",
	},
	editBtnText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	saveBtn: {
		backgroundColor: Colors.light.tint,
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 8,
		alignItems: "center",
	},
	saveBtnText: {
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
	},
	cancelBtn: {
		backgroundColor: Colors.light.muted,
		paddingVertical: 12,
		paddingHorizontal: 32,
		borderRadius: 8,
		alignItems: "center",
	},
	cancelBtnText: {
		color: Colors.light.textPrimaryForeground,
		fontWeight: "700",
		fontSize: 16,
	},
});
