import { View, type ViewProps } from "react-native";

import { Colors } from "@/constants/Colors";
import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedViewStyle = Record<string, string | number | { rotate: string }[]>;

export type ThemedViewProps = ViewProps & {
	lightColor?: string;
	darkColor?: string;
	ref?: React.RefObject<View | null>;
	type?: "view" | "container" | "card" | "modal";
};

export function ThemedView({
	style,
	lightColor,
	darkColor,
	type = "view",
	ref,
	...otherProps
}: ThemedViewProps) {
	let property = "background";
	switch (type) {
		case "container":
			property = "background";
			break;
		case "card":
			property = "card";
			break;
		case "modal":
			property = "secondary";
			break;
		default:
			property = "background";
			break;
	}

	const backgroundColor = useThemeColor(
		{ light: lightColor, dark: darkColor },
		property as keyof typeof Colors.light & keyof typeof Colors.dark,
	);

	return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}
