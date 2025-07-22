import { Stack } from "expo-router";
import React from "react";

const WinsLayout = () => {
	return (
		<Stack>
			<Stack.Screen
				name="index"
				options={{
					headerShown: false,
				}}
			/>
			<Stack.Screen
				name="[id]"
				options={{
					headerShown: false,
				}}
			/>
		</Stack>
	);
};

export default WinsLayout;
