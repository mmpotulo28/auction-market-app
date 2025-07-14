import logger from "@/lib/logger";
import {} from "@clerk/clerk-expo";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

export default function OAuthNativeCallback() {
	const router = useRouter();

	useEffect(() => {
		const handleOAuth = async () => {
			try {
				await handleOpenAuthRedirect();
			} catch (e) {
				// Optionally handle error
				logger.error("OAuth callback error:", e);
			}
			router.replace("/");
		};
		handleOAuth();
	}, [router]);

	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<ActivityIndicator size="large" />
		</View>
	);
}
function handleOpenAuthRedirect() {
	throw new Error("Function not implemented.");
}
