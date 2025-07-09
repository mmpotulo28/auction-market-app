import Actions from "@/components/common/Actions";
import LockUp from "@/components/common/LockUp";
import { iButtonProps, iLockUpProps, iSize } from "@/lib/types";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

export interface iTopBannerProps extends iLockUpProps {
	action?: iButtonProps;
	title: string;
	overline?: string;
	subtitle?: string;
	size?: iSize;
	centered?: boolean;
	bold?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const truncate = (text?: string) => {
	if (!text) return "";
	return text.length > 256 ? `${text.substring(0, 253)}...` : text;
};

const TopBanner: React.FC<iTopBannerProps> = ({
	action,
	title = "LockUp Title",
	overline,
	subtitle,
	size = iSize.Large,
	centered = false,
	bold = false,
}) => {
	return (
		<View style={styles.topBanner}>
			<Image
				style={styles.centerImage}
				source={require("../assets/images/amsa-logo.png")}
				resizeMode="contain"
			/>
			<LockUp
				title={title}
				overline={overline}
				subtitle={subtitle}
				size={size}
				centered={centered}
				bold={bold}
			/>
			<Actions
				actions={[
					{
						label: action?.label || "Get Started",
						click: action?.click,
					},
				]}
				fullWidth
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	topBanner: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		paddingHorizontal: 24,
		paddingVertical: 32,
		width: "100%",
		minHeight: 600,
	},
	centerImage: {
		width: 140,
		height: 140,
		marginBottom: 32,
	},
});

export default TopBanner;
