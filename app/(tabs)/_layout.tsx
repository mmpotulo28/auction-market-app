import { HapticTab } from "@/components/HapticTab";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Tabs } from "expo-router";
import { HelpCircleIcon, HomeIcon, SettingsIcon, UserIcon } from "lucide-react-native";
import React from "react";
import { Platform } from "react-native";

const TabsLayout = () => {
	const colorScheme = useColorScheme();

	return (
		<Tabs
			screenOptions={{
				tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
				tabBarInactiveTintColor: Colors[colorScheme ?? "light"].tabIconDefault,
				headerShown: true,
				tabBarButton: HapticTab,
				tabBarBackground: TabBarBackground,
				tabBarStyle: Platform.select({
					ios: {
						// Use a transparent background on iOS to show the blur effect
						position: "absolute",
					},
					default: {},
				}),
			}}>
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
