import Features from "@/components/Features";
import { ThemedView } from "@/components/ThemedView";
import TopBanner from "@/components/TopBanner";
import { ScrollView } from "react-native";

export default function Index() {
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
				<Features />
			</ThemedView>
		</ScrollView>
	);
}
