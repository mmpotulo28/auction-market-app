import { Stack } from "expo-router";

const SupportLayout = () => {
	return (
		<Stack>
			<Stack.Screen name="contact-us" options={{ headerShown: false, title: "Contact Us" }} />
			<Stack.Screen
				name="privacy-policy"
				options={{ headerShown: false, title: "Privacy Policy" }}
			/>
		</Stack>
	);
};
export default SupportLayout;
