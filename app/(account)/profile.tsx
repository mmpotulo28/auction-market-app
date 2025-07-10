import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Colors } from "@/constants/Colors";
import { useUser } from "@clerk/clerk-expo";
import { Image, StyleSheet, View } from "react-native";

export default function ProfileScreen() {
	const { user } = useUser();

	return (
		<ThemedView style={styles.container}>
			<View style={styles.card}>
				{user?.imageUrl ? (
					<Image source={{ uri: user.imageUrl }} style={styles.avatar} />
				) : (
					<View style={styles.avatarPlaceholder} />
				)}
				<ThemedText style={styles.name}>{user?.fullName || "Your Name"}</ThemedText>
				<ThemedText style={styles.email}>
					{user?.primaryEmailAddress?.emailAddress || "your@email.com"}
				</ThemedText>
			</View>
			<ThemedText style={styles.sectionTitle}>Profile Details</ThemedText>
			<ThemedText style={styles.placeholder}>
				This is a placeholder for your profile details and edit form.
			</ThemedText>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: "center", padding: 24 },
	card: {
		alignItems: "center",
		backgroundColor: Colors.light.card,
		borderRadius: 18,
		padding: 24,
		marginBottom: 24,
		width: "100%",
	},
	avatar: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginBottom: 12,
		backgroundColor: Colors.light.muted,
	},
	avatarPlaceholder: {
		width: 80,
		height: 80,
		borderRadius: 40,
		marginBottom: 12,
		backgroundColor: Colors.light.muted,
	},
	name: {
		fontWeight: "bold",
		fontSize: 20,
		color: Colors.light.textPrimaryForeground,
	},
	email: {
		color: Colors.light.textMutedForeground,
		fontSize: 15,
		marginTop: 2,
	},
	sectionTitle: {
		fontWeight: "700",
		fontSize: 16,
		marginBottom: 10,
		color: Colors.light.textPrimaryForeground,
	},
	placeholder: {
		color: Colors.light.textMutedForeground,
		fontSize: 15,
		textAlign: "center",
	},
});
