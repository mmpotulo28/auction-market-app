import { Stack } from "expo-router";

const SupportLayout = () => {
	return (
		<Stack>
			<Stack.Screen name="contact-us" options={{ headerShown: true, title: "Contact Us" }} />
			<Stack.Screen
				name="privacy-policy"
				options={{ headerShown: true, title: "Privacy Policy" }}
			/>
		</Stack>
	);
};
export default SupportLayout;
