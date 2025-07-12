import { useUser } from "@clerk/clerk-expo";
import { useRouter, useSegments } from "expo-router";
import React, { createContext, useContext } from "react";
import { ActivityIndicator, View } from "react-native";

// Define which routes are public (no login required)
const PUBLIC_ROUTES = [
	"(home)",
	"(home)/index",
	"/",
	"(support)",
	"(support)/contact-us",
	"(support)/privacy-policy",
	"(auth)",
	"(auth)/sign-in",
	"(auth)/sign-up",
	"oauth-native-callback",
	"(tabs)/support",
	"(tabs)/support/index",
	"(tabs)/index",
	"+not-found",
];

// Helper to check if a route is public
function isPublicRoute(segments: string[]) {
	const path = segments.join("/");
	// Only allow (tabs)/support and (tabs)/index as public, not (tabs)/account or any other (tabs) subroutes
	if (
		path.startsWith("(tabs)/") &&
		path !== "(tabs)/support" &&
		path !== "(tabs)/support/index" &&
		path !== "(tabs)/index"
	) {
		return false;
	}
	return PUBLIC_ROUTES.some((pub) => path === pub || path.startsWith(pub + "/"));
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
	const { user, isLoaded } = useUser();
	const segments = useSegments();
	const router = useRouter();

	const isPublic = isPublicRoute(segments);

	console.log("Current segments:", segments);
	console.log("Is public route:", isPublic);

	React.useEffect(() => {
		if (isLoaded && !user && !isPublic) {
			// Redirect to sign-in if not authenticated and not on a public route
			router.replace("/(auth)/sign-in");
		}
	}, [isLoaded, user, isPublic, router]);

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
