import Divider from "@/components/Divider";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import ShareApp from "@/components/ShareApp";
import { ThemedView } from "@/components/ThemedView";
import TopBanner from "@/components/TopBanner";
import UpcomingAuctions from "@/components/UpcomingAuctions";
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
