import { Stack } from "expo-router";

const SupportLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name="notifications"
				options={{ headerShown: false, title: "Notifications" }}
			/>
			<Stack.Screen name="orders" options={{ headerShown: false, title: "Orders" }} />
			<Stack.Screen
				name="transactions"
				options={{ headerShown: false, title: "Transactions" }}
			/>
			<Stack.Screen name="profile" options={{ headerShown: false, title: "Profile" }} />
		</Stack>
	);
};
export default SupportLayout;
