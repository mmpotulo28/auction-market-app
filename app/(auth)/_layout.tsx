import { Stack } from "expo-router";

const SupportLayout = () => {
	return (
		<Stack>
			<Stack.Screen name="sign-in" options={{ headerShown: false, title: "Sign In" }} />
			<Stack.Screen name="sign-up" options={{ headerShown: false, title: "Sign Up" }} />
		</Stack>
	);
};
export default SupportLayout;
