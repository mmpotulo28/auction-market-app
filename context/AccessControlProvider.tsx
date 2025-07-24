import logger from "@/lib/logger";
import { useUser } from "@clerk/clerk-expo";
import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

// Define which routes are public (no login required)

// Define which routes are private (require login)
const PRIVATE_ROUTES = [
	"(account)",
	"(account)/profile",
	"(account)/orders",
	"(account)/transactions",
	"(account)/notifications",
	"(auctions)",
	"(auctions)/[auction]",
	"(auctions)/[auction]/[item]",
	"(tabs)/account",
	"(tabs)/wins",
	// Add more private routes as needed
];

// Helper to check if a route is private (requires authentication)
function isPrivateRoute(segments: string[]) {
	if (!segments || segments.length === 0) return false;
	const path = segments.join("/");
	return PRIVATE_ROUTES.some((priv) => path === priv || path.startsWith(priv + "/"));
}

interface AccessControlContextProps {
	isAuthenticated: boolean;
	isLoading: boolean;
}

const AccessControlContext = createContext<AccessControlContextProps>({
	isAuthenticated: false,
	isLoading: true,
});

export const AccessControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const { user, isLoaded, isSignedIn } = useUser();
	const segments = useSegments();
	const router = useRouter();

	const isPrivate = isPrivateRoute(segments);

	logger.info("Current segments:", segments);
	logger.info("Is private route:", isPrivate);
	logger.info("User authenticated:", !!user);

	useEffect(() => {
		if (!isLoaded) return; // Wait until auth state is loaded

		// If the route is private and user is not authenticated, redirect to sign-in
		if (!isSignedIn && isPrivate) {
			logger.info("Redirecting unauthenticated user to sign-in", { user, isSignedIn });
			router.push("/(auth)/sign-in");
		}
	}, [isLoaded, user, isPrivate, router, isSignedIn]);

	if (!isLoaded) {
		return (
			<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
				<ActivityIndicator size="large" />
			</View>
		);
	}

	return (
		<AccessControlContext.Provider value={{ isAuthenticated: !!user, isLoading: !isLoaded }}>
			{children}
		</AccessControlContext.Provider>
	);
};

export const useAccessControl = () => useContext(AccessControlContext);

export default AccessControlProvider;
