import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { Circle, Line, Polyline } from "react-native-svg";

export type IllustrationType = "success" | "error" | "loading";

interface IllustrationProps {
	type: IllustrationType;
	style?: StyleProp<ViewStyle>;
}

const Illustration: React.FC<IllustrationProps> = ({ type, style }) => {
	if (type === "success") {
		return (
			<View style={style}>
				<Svg width={120} height={120} viewBox="0 0 120 120">
					<Circle
						cx={60}
						cy={60}
						r={56}
						fill="#e0ffe6"
						stroke="#22c55e"
						strokeWidth={4}
					/>
					<Polyline
						points="40,65 55,80 80,45"
						fill="none"
						stroke="#22c55e"
						strokeWidth={6}
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</Svg>
			</View>
		);
	}
	if (type === "loading") {
		return (
			<View style={style}>
				<Svg width={60} height={60} viewBox="0 0 60 60">
					<Circle
						cx={30}
						cy={30}
						r={26}
						stroke="#6366f1"
						strokeWidth={6}
						fill="none"
						strokeDasharray="40 60"
					/>
				</Svg>
			</View>
		);
	}
	// error
	return (
		<View style={style}>
			<Svg width={120} height={120} viewBox="0 0 120 120">
				<Circle cx={60} cy={60} r={56} fill="#ffeaea" stroke="#ef4444" strokeWidth={4} />
				<Line
					x1={45}
					y1={45}
					x2={75}
					y2={75}
					stroke="#ef4444"
					strokeWidth={6}
					strokeLinecap="round"
				/>
				<Line
					x1={75}
					y1={45}
					x2={45}
					y2={75}
					stroke="#ef4444"
					strokeWidth={6}
					strokeLinecap="round"
				/>
			</Svg>
		</View>
	);
};

export default Illustration;
