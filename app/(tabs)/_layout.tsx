import { Tabs } from "expo-router";
import { HelpCircleIcon, HomeIcon, SettingsIcon, UserIcon } from "lucide-react-native";
import React from "react";

const TabsLayout = () => {
	return (
		<Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#014b8b" }}>
			{/* Define your screens here, for example: */}
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					headerShown: false,
					tabBarIcon: ({ color, size }) => <HomeIcon color={color} size={size} />,
				}}
			/>
			{/* account */}
			<Tabs.Screen
				name="account/index"
				options={{
					title: "Account",
					headerShown: false,
					tabBarIcon: ({ color, size }) => <UserIcon color={color} size={size} />,
				}}
			/>
			{/* support */}
			<Tabs.Screen
				name="support/index"
				options={{
					title: "Support",
					headerShown: false,
					tabBarIcon: ({ color, size }) => <HelpCircleIcon color={color} size={size} />,
				}}
			/>
			{/* settings */}
			<Tabs.Screen
				name="settings/index"
				options={{
					title: "Settings",
					headerShown: false,
					tabBarIcon: ({ color, size }) => <SettingsIcon color={color} size={size} />,
				}}
			/>
		</Tabs>
	);
};

export default TabsLayout;
