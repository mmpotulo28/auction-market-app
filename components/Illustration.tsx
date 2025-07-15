import { Colors } from "@/constants/Colors";
import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import Svg, { Circle, Ellipse, Line, Path, Polyline, Rect, Text } from "react-native-svg";

export type IllustrationType = "success" | "error" | "loading" | "face";

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
					{/* Branding signature */}
					<Text
						x={60}
						y={112}
						fontSize={10}
						fill="#22c55e"
						fontWeight="bold"
						textAnchor="middle"
						opacity={0.7}
						rotation={-20}>
						AuctionMarket
					</Text>
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
					{/* Branding signature */}
					<Text
						x={30}
						y={56}
						fontSize={7}
						fill="#6366f1"
						fontWeight="bold"
						textAnchor="middle"
						opacity={0.7}
						rotation={-20}>
						AuctionMarket
					</Text>
				</Svg>
			</View>
		);
	}

	// sad face	for "face" type
	if (type === "error") {
		// error
		return (
			<View style={style}>
				<Svg width={120} height={120} viewBox="0 0 120 120">
					<Circle
						cx={60}
						cy={60}
						r={56}
						fill="#ffeaea"
						stroke="#ef4444"
						strokeWidth={4}
					/>
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
					{/* Branding signature */}
					<Text
						x={60}
						y={112}
						fontSize={10}
						fill="#ef4444"
						fontWeight="bold"
						textAnchor="middle"
						opacity={0.7}
						rotation={-20}>
						AuctionMarket
					</Text>
				</Svg>
			</View>
		);
	}

	return (
		<Svg width="180" height="180" viewBox="0 0 180 180" fill="none">
			<Circle
				cx="90"
				cy="90"
				r="80"
				fill={Colors.light.card}
				stroke={Colors.light.accent}
				strokeWidth="4"
			/>
			{/* Police hat - top (now fits the whole head) */}
			<Ellipse
				cx="90"
				cy="28"
				rx="80"
				ry="30"
				fill="#2563eb"
				stroke="#1e40af"
				strokeWidth="4"
			/>
			{/* Police hat - brim (now fits the whole head) */}
			<Rect
				x="18"
				y="44"
				width="144"
				height="18"
				rx="9"
				ry="9"
				fill="#1e293b"
				stroke="#1e293b"
				strokeWidth="3"
			/>
			{/* Police hat - badge (centered on brim) */}
			<Circle cx="90" cy="53" r="11" fill="#fde047" stroke="#facc15" strokeWidth="3" />
			<Ellipse cx="90" cy="120" rx="45" ry="18" fill={Colors.light.muted} opacity="0.3" />
			<Circle cx="65" cy="80" r="8" fill={Colors.light.accent} />
			<Circle cx="115" cy="80" r="8" fill={Colors.light.accent} />
			<Rect
				x="70"
				y="110"
				width="40"
				height="8"
				rx="4"
				fill={Colors.light.background}
				opacity="0.5"
			/>
			<Path
				d="M70 110 Q90 125 110 110"
				stroke={Colors.light.accent}
				strokeWidth="3"
				fill="none"
			/>
			{/* Branding signature */}
			<Text
				x={60}
				y={42}
				fontSize={13}
				fill={Colors.light.background}
				fontWeight="bold"
				textAnchor="middle"
				opacity={0.2}
				rotation={-10}>
				AuctionMarket
			</Text>
		</Svg>
	);
};

export default Illustration;
