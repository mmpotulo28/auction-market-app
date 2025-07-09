import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

const AccountScreen = () => {
	return (
		<ThemedView
			style={{
				flex: 1,
				justifyContent: "center",
				alignItems: "center",
			}}>
			<ThemedText>Account Screen</ThemedText>
		</ThemedView>
	);
};

export default AccountScreen;
