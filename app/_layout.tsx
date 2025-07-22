import { useColorScheme } from "@//hooks/useColorScheme";
import { AccessControlProvider } from "@/context/AccessControlProvider";
import { AccountProvider } from "@/context/AccountContext";
import { WebSocketProvider } from "@/context/WebSocketProvider";
import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import * as Sentry from "@sentry/react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import { Toaster } from "sonner-native";

Sentry.init({
	dsn: "https://0f044f521bd4c303808e24dade031e6d@o4509553467064320.ingest.us.sentry.io/4509650432753664",

	// Adds more context data to events (IP address, cookies, user, etc.)
	// For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
	sendDefaultPii: true,

	// Configure Session Replay
	replaysSessionSampleRate: 0.1,
	replaysOnErrorSampleRate: 1,
	integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: __DEV__,
});

export default Sentry.wrap(function RootLayout() {
	const colorScheme = useColorScheme();
	const [loaded] = useFonts({
		SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
	});

	if (!loaded) {
		return null;
	}

	return (
		<SafeAreaProvider>
			<ClerkProvider
				publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}
				tokenCache={tokenCache}>
				<ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
					<GestureHandlerRootView style={{ flex: 1 }}>
						<AccessControlProvider>
							<WebSocketProvider>
								<AccountProvider>
									<Stack>
										<Stack.Screen
											name="(tabs)"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="(support)"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="(auth)"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="oauth-native-callback"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="(account)"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="(auctions)"
											options={{ headerShown: false }}
										/>
										<Stack.Screen
											name="wins"
											options={{ headerShown: false }}
										/>

										<Stack.Screen name="+not-found" />
									</Stack>
									<Toaster
										theme="light"
										richColors={true}
										loadingIcon
										offset={50}
										toastOptions={{
											style: {
												borderRadius: 8,
												padding: 5,
												paddingVertical: 10,
												shadowColor: "#000",
												shadowOffset: { width: 0, height: 2 },
												shadowOpacity: 0.1,
												shadowRadius: 4,
												elevation: 2,
											},
										}}
									/>
									<Toast position="top" autoHide bottomOffset={50} />
								</AccountProvider>
							</WebSocketProvider>
						</AccessControlProvider>
						<StatusBar style="auto" />
					</GestureHandlerRootView>
				</ThemeProvider>
			</ClerkProvider>
		</SafeAreaProvider>
	);
});
