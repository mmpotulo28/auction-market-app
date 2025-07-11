import { Stack } from "expo-router";

const AuctionsLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name="[name]"
				options={{
					headerShown: false, // Hide header/title for dynamic auction pages
				}}
			/>
			{/* Add other screens here if needed */}
		</Stack>
	);
};
export default AuctionsLayout;
