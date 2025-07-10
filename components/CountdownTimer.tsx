import { Colors } from "@/constants/Colors";
import { iSize } from "@/lib/types";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

interface TimerProps {
	targetDate: string; // Target date in string format
	size?: iSize;
	onExpire?: () => void;
	style?: ViewStyle;
}

interface TimeState {
	months: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

const NumberBox = ({ num, unit }: { num: string | number; unit: string }) => (
	<View style={styles.numberBox}>
		<View style={styles.numberBoxInner}>
			<View style={styles.numberBoxTop} />
			<Text style={styles.numberBoxNum}>{num}</Text>
			<View style={styles.numberBoxBottom} />
		</View>
		<Text style={styles.numberBoxUnit}>{unit}</Text>
	</View>
);

export const CountdownTimer: React.FC<TimerProps> = ({
	targetDate,
	size = iSize.Medium,
	onExpire,
	style,
}) => {
	const [time, setTime] = useState<TimeState>({
		months: 0,
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});
	const [expired, setExpired] = useState(false);

	useEffect(() => {
		if (expired && onExpire) {
			onExpire();
		}
	}, [expired, onExpire]);

	useEffect(() => {
		const calculateTimeLeft = () => {
			const now = new Date();
			const target = new Date(targetDate);

			let months =
				target.getMonth() -
				now.getMonth() +
				12 * (target.getFullYear() - now.getFullYear());
			let days = target.getDate() - now.getDate();
			let hours = target.getHours() - now.getHours();
			let minutes = target.getMinutes() - now.getMinutes();
			let seconds = target.getSeconds() - now.getSeconds();

			if (seconds < 0) {
				seconds += 60;
				minutes -= 1;
			}
			if (minutes < 0) {
				minutes += 60;
				hours -= 1;
			}
			if (hours < 0) {
				hours += 24;
				days -= 1;
			}
			if (days < 0) {
				const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
				days += prevMonth.getDate();
				months -= 1;
			}
			if (months < 0) {
				months += 12;
			}

			if (target.getTime() <= now.getTime()) {
				setTime({ months: 0, days: 0, hours: 0, minutes: 0, seconds: 0 });
				setExpired(true);
			} else {
				setTime({ months, days, hours, minutes, seconds });
			}
		};

		const interval = setInterval(calculateTimeLeft, 1000);

		return () => clearInterval(interval);
	}, [targetDate]);

	const { months, days, hours, minutes, seconds } = time;

	const sizeStyle =
		size === iSize.Small ? styles.sm : size === iSize.Large ? styles.lg : styles.md;

	return (
		<View style={[styles.timerContainer, sizeStyle, style]}>
			<View style={styles.timerGrid}>
				<NumberBox num={months} unit="Mon" />
				<Text style={styles.colon}>:</Text>
				<NumberBox num={days} unit="Dys" />
				<Text style={styles.colon}>:</Text>
				<NumberBox num={hours} unit="Hrs" />
				<Text style={styles.colon}>:</Text>
				<NumberBox num={minutes} unit="Min" />
				<Text style={styles.colon}>:</Text>
				<NumberBox num={seconds} unit="Sec" />
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	timerContainer: {
		marginTop: 0,
		borderRadius: 16,
		width: "100%",
		alignItems: "center",
	},
	sm: {
		transform: [{ scale: 0.6 }],
	},
	md: {
		transform: [{ scale: 0.8 }],
	},
	lg: {
		transform: [{ scale: 1 }],
	},
	timerGrid: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 4,
		paddingHorizontal: 10,
		borderRadius: 16,
	},
	colon: {
		color: Colors.light.accent,
		fontSize: 24,
		fontWeight: "400",
		marginHorizontal: 2,
		marginTop: -10,
	},
	numberBox: {
		alignItems: "center",
		marginTop: 0,
		paddingLeft: 0,
		paddingRight: 0,
	},
	numberBoxInner: {
		position: "relative",
		backgroundColor: "transparent",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 8,
		width: 48,
		height: 48,
		marginTop: 8,
	},
	numberBoxTop: {
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		backgroundColor: Colors.light.foreground,
		width: "100%",
		height: "100%",
		position: "absolute",
		top: 0,
		left: 0,
	},
	numberBoxNum: {
		color: Colors.light.background,
		fontSize: 28,
		position: "absolute",
		zIndex: 10,
		fontWeight: "bold",
		fontFamily: "monospace",
		alignSelf: "center",
		top: 8,
	},
	numberBoxBottom: {
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		backgroundColor: Colors.light.mutedForeground,
		width: "100%",
		height: "100%",
		position: "absolute",
		bottom: 0,
		left: 0,
	},
	numberBoxUnit: {
		color: Colors.light.foreground,
		fontSize: 16,
		marginTop: 8,
		fontWeight: "600",
	},
});

export default CountdownTimer;
