import Divider from "@/components/Divider";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import ShareApp from "@/components/ShareApp";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import TopBanner from "@/components/TopBanner";
import UpcomingAuctions from "@/components/UpcomingAuctions";
import { ScrollView, TouchableOpacity } from "react-native";
import { toast } from "sonner-native";

export default function Index() {
	const showToast = () => {
		console.log("Toast button clicked");
		// Toast.show({
		// 	type: "info",
		// 	text1: "Welcome to the Auction App",
		// 	text2: "Bid on your favorite items",

		// 	onPress: () => {
		// 		console.log("Toast pressed");
		// 		Toast.hide();
		// 	},
		// });
		toast.success("Welcome to the Auction App", {
			description: "Bid on your favorite items",
			onDismiss: () => {
				console.log("Toast dismissed");
			},
		});
	};
	return (
		<ScrollView>
			<ThemedView
				style={{
					flex: 1,
					justifyContent: "center",
					alignItems: "center",
				}}>
				<TopBanner
					action={{
						label: "Get Started",
						click: () => console.log("Get Started clicked"),
					}}
					title="Welcome to the Auction App"
					overline="Bid on your favorite items"
					subtitle="Join the auction now"
					centered
				/>

				<TouchableOpacity
					style={{
						backgroundColor: "#4CAF50",
						padding: 16,
						borderRadius: 8,
						marginBottom: 16,
					}}
					onPress={() => showToast()}>
					<ThemedText
						style={{
							color: "#fff",
							textAlign: "center",
						}}>
						Show Toast
					</ThemedText>
				</TouchableOpacity>

				<ShareApp />
				<Divider />
				<UpcomingAuctions />

				<Divider />
				<HowItWorks />

				<Divider />
				<Features />
			</ThemedView>
		</ScrollView>
	);
}
