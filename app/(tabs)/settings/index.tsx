import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const SettingsScreen = () => {
	return (
		<ThemedView
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}>
			<ThemedText>Settings Screen</ThemedText>
		</ThemedView>
	);
};

export default SettingsScreen;
