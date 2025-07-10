import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StyleSheet } from "react-native";

export default function TransactionsScreen() {
	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title" style={styles.heading}>
				Transactions
			</ThemedText>
			<ThemedText style={styles.placeholder}>
				Your transactions will be shown here.
			</ThemedText>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
	heading: { fontSize: 24, fontWeight: "bold", marginBottom: 18 },
	placeholder: { color: "#7fa1c0", fontSize: 16, textAlign: "center" },
});
