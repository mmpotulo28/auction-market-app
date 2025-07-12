import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

const SupportLayout = () => {
	return (
		<Stack>
			<SafeAreaView style={{ flex: 1 }}>
				<Stack.Screen name="sign-in" options={{ headerShown: true, title: "Sign In" }} />
				<Stack.Screen name="sign-up" options={{ headerShown: true, title: "Sign Up" }} />
			</SafeAreaView>
		</Stack>
	);
};
export default SupportLayout;
