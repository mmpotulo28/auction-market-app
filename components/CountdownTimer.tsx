import { Colors } from "@/constants/Colors";
import { iSize } from "@/lib/types";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View, ViewStyle } from "react-native";
import { ThemedView } from "./ThemedView";

interface TimerProps {
	targetDate: string;
	size?: iSize;
	onExpire?: () => void;
	style?: ViewStyle;
	minimized?: boolean;
}

interface TimeState {
	months: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

const pad = (n: number) => n.toString().padStart(2, "0");

const NumberBox = ({
	num,
	unit,
	animatedValue,
	highlight,
	hideUnit = false,
}: {
	num: string | number;
	unit: string;
	animatedValue?: Animated.Value;
	highlight?: boolean;
	hideUnit?: boolean;
}) => (
	<Animated.View
		style={[
			styles.numberBox,
			highlight && styles.numberBoxHighlight,
			animatedValue && {
				transform: [
					{
						scale: animatedValue.interpolate({
							inputRange: [0, 1],
							outputRange: [1, 1.18],
						}),
					},
				],
				shadowOpacity: animatedValue
					? animatedValue.interpolate({
							inputRange: [0, 1],
							outputRange: [0.08, 0.22],
					  })
					: 0.08,
			},
		]}>
		<View style={styles.numberBoxInner}>
			<View style={styles.numberBoxTop} />
			<Text style={styles.numberBoxNum}>{pad(Number(num))}</Text>
			<View style={styles.numberBoxBottom} />
		</View>
		{!hideUnit && <Text style={styles.numberBoxUnit}>{unit}</Text>}
	</Animated.View>
);

export const CountdownTimer: React.FC<TimerProps> = ({
	targetDate,
	size = iSize.Medium,
	onExpire,
	style,
	minimized = false,
}) => {
	const [time, setTime] = useState<TimeState>({
		months: 0,
		days: 0,
		hours: 0,
		minutes: 0,
		seconds: 0,
	});
	const [expired, setExpired] = useState(false);

	// Animation refs for each unit
	const secAnim = useRef(new Animated.Value(0)).current;
	const minAnim = useRef(new Animated.Value(0)).current;
	const hourAnim = useRef(new Animated.Value(0)).current;

	const prevSeconds = useRef<number>(0);
	const prevMinutes = useRef<number>(0);
	const prevHours = useRef<number>(0);

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

	// Animate on value change
	useEffect(() => {
		if (prevSeconds.current !== time.seconds) {
			Animated.sequence([
				Animated.timing(secAnim, {
					toValue: 1,
					duration: 180,
					easing: Easing.out(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(secAnim, {
					toValue: 0,
					duration: 180,
					easing: Easing.in(Easing.ease),
					useNativeDriver: true,
				}),
			]).start();
			prevSeconds.current = time.seconds;
		}
		if (prevMinutes.current !== time.minutes) {
			Animated.sequence([
				Animated.timing(minAnim, {
					toValue: 1,
					duration: 200,
					easing: Easing.out(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(minAnim, {
					toValue: 0,
					duration: 200,
					easing: Easing.in(Easing.ease),
					useNativeDriver: true,
				}),
			]).start();
			prevMinutes.current = time.minutes;
		}
		if (prevHours.current !== time.hours) {
			Animated.sequence([
				Animated.timing(hourAnim, {
					toValue: 1,
					duration: 220,
					easing: Easing.out(Easing.ease),
					useNativeDriver: true,
				}),
				Animated.timing(hourAnim, {
					toValue: 0,
					duration: 220,
					easing: Easing.in(Easing.ease),
					useNativeDriver: true,
				}),
			]).start();
			prevHours.current = time.hours;
		}
	}, [time.seconds, time.minutes, time.hours, secAnim, minAnim, hourAnim]);

	const { months, days, hours, minutes, seconds } = time;

	const sizeStyle =
		size === iSize.Small ? styles.sm : size === iSize.Large ? styles.lg : styles.md;

	if (minimized) {
		return (
			<View style={[styles.timerContainer, sizeStyle, style]}>
				<View style={styles.timerGridMin}>
					<NumberBox
						num={seconds}
						unit="Sec"
						hideUnit
						animatedValue={secAnim}
						highlight
					/>
				</View>
			</View>
		);
	}

	return (
		<ThemedView type="modal" style={[styles.timerContainer, sizeStyle]}>
			<View style={styles.timerGrid}>
				<NumberBox num={months} unit="Mon" />
				<Text style={styles.colon}>:</Text>
				<NumberBox num={days} unit="Dys" />
				<Text style={styles.colon}>:</Text>
				<NumberBox num={hours} unit="Hrs" animatedValue={hourAnim} highlight />
				<Text style={styles.colon}>:</Text>
				<NumberBox num={minutes} unit="Min" animatedValue={minAnim} highlight />
				<Text style={styles.colon}>:</Text>
				<NumberBox num={seconds} unit="Sec" animatedValue={secAnim} highlight />
			</View>
		</ThemedView>
	);
};

const styles = StyleSheet.create({
	timerContainer: {
		marginTop: 0,
		borderRadius: 16,
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
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
		paddingInline: 20,
	},
	timerGridMin: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingHorizontal: 4,
		borderRadius: 12,
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
		shadowColor: "#1976c5",
		shadowOffset: { width: 0, height: 2 },
		shadowRadius: 8,
		elevation: 2,
		backgroundColor: "#eaf3fb",
		borderRadius: 10,
		paddingHorizontal: 8,
		shadowOpacity: 0.18,
	},
	numberBoxHighlight: {
		backgroundColor: "#eaf3fb",
		borderRadius: 10,
		shadowOpacity: 0.18,
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
		overflow: "hidden",
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
		opacity: 0.92,
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
		letterSpacing: 1.2,
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
		opacity: 0.85,
	},
	numberBoxUnit: {
		color: Colors.light.foreground,
		fontSize: 16,
		marginTop: 8,
		fontWeight: "600",
		letterSpacing: 0.5,
	},
});

export default CountdownTimer;
