import { StatusBar } from "expo-status-bar";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import Features from "@/components/Features";

export default function Home() {
	return (
		<ScrollView>
			<View style={styles.container}>
				<Text>Home Screen</Text>
				<Features />
				<StatusBar style="auto" />
			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});
