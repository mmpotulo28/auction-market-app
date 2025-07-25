import { SymbolView, SymbolViewProps, SymbolWeight } from "expo-symbols";
import { StyleProp } from "react-native";
import { ThemedViewStyle } from "../ThemedView";

export function IconSymbol({
	name,
	size = 24,
	color,
	style,
	weight = "regular",
}: {
	name: SymbolViewProps["name"];
	size?: number;
	color: string;
	style?: StyleProp<ThemedViewStyle>;
	weight?: SymbolWeight;
}) {
	return (
		<SymbolView
			weight={weight}
			tintColor={color}
			resizeMode="scaleAspectFit"
			name={name}
			style={[
				{
					width: size,
					height: size,
				},
				style,
			]}
		/>
	);
}
