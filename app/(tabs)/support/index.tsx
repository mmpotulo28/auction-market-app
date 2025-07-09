import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const SupportScreen = () => {
	return (
		<ThemedView style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<ThemedText>Support</ThemedText>
			<ThemedText>If you need help, please contact our support team.</ThemedText>
			<ThemedText>Email: support@example.com</ThemedText>
		</ThemedView>
	);
};

export default SupportScreen;
