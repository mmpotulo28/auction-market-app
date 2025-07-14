import axios, { isAxiosError } from "axios";
import logger from "./logger";
import {
	iAuction,
	iGroupedOrder,
	iNotification,
	iOrder,
	iOrderStatus,
	iTransaction,
} from "./types";

/**
 * Converts a given string into a URL-friendly format.
 *
 * The function transforms the input string to lowercase, replaces
 * non-alphanumeric characters with hyphens, and removes leading
 * or trailing hyphens.
 *
 * @param str - The input string to be converted.
 * @returns The URL-friendly version of the input string.
 */
export const stringToUrl = (str: string): string => {
	return str
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-|-$/g, "");
};

/**
 * Converts a Date object to a formatted string in US English locale.
 *
 * The output format includes the weekday, day, month, year, hour, and minute,
 * and uses the UTC time zone.
 *
 * @param date - The Date object to format.
 * @returns A formatted date string, or an empty string if the input is invalid.
 */
export const dateToString = (date: Date) => {
	if (!date) return "";
	if (isNaN(date.getTime()) || !(date instanceof Date)) return "";
	return date.toLocaleString("en-US", {
		weekday: "long",
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		timeZone: "UTC",
	});
};

export interface iFetchAuctions {
	setIsLoading?: (isLoading: boolean) => void;
	onLoad?: (data: iAuction[]) => void;
	onError?: (error: string) => void;
}

/**
 * Fetches auction data from the `/api/auctions` endpoint.
 * Uses a public API endpoint for native (mobile) and falls back to mock data if the network fails.
 */
export const fetchAuctions = async ({ setIsLoading, onLoad, onError }: iFetchAuctions) => {
	try {
		setIsLoading?.(true);
		let data: iAuction[] = [];
		const url = "https://auctionmarket.tech/api/auctions";
		try {
			const response = await fetch(url);
			const text = await response.text();
			data = JSON.parse(text);
		} catch (err) {
			logger.error("Network error, using fallback mock data:", err);
			// fallback mock data
			data = [
				{
					id: "1",
					name: "Mock Auction 1",
					start_time: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
					created_by: "admin",
					date_created: new Date().toISOString(),
					description: "This is a mock auction for testing purposes.",
					duration: 60, // in minutes
					re_open_count: 0,
					items_count: 10,
				},
				{
					id: "2",
					name: "Mock Auction 2",
					start_time: new Date(Date.now() + 1000 * 60 * 120).toISOString(),
					created_by: "admin",
					date_created: new Date().toISOString(),
					description: "This is another mock auction for testing purposes.",
					duration: 120, // in minutes
					re_open_count: 0,
					items_count: 5,
				},
				{
					id: "3",
					name: "Mock Auction 3",
					start_time: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
					created_by: "admin",
					date_created: new Date().toISOString(),
					description: "This is yet another mock auction for testing purposes.",
					duration: 180, // in minutes
					re_open_count: 0,
					items_count: 15,
				},
			];

			// onError?.(
			// 	`Failed to fetch auctions: ${err instanceof Error ? err.message : "Network error"}`,
			// );
		}

		onLoad?.(data);
		return data;
	} catch (err) {
		onError?.(err instanceof Error ? err.message : "Failed to fetch auctions");
		logger.error(`Failed to fetch auctions: ${err}`);
	} finally {
		setIsLoading?.(false);
	}

	return [];
};

// Fetch auction by name with improved efficiency and error handling
export const fetchAuctionByName = async (name: string): Promise<iAuction | undefined> => {
	try {
		const auctions: iAuction[] = await fetchAuctions({});

		if (auctions.length === 0 || !name) return undefined;

		const normalizedTarget = stringToUrl(name);

		// Use a for loop for early exit on match (more efficient than .find for large arrays)
		for (const auction of auctions) {
			logger.info(normalizedTarget, stringToUrl(auction.name));
			if (stringToUrl(auction.name) === normalizedTarget) {
				return auction;
			}
		}
		return undefined;
	} catch (error) {
		logger.error(`Failed to fetch auction by name: ${name}`, error);
		return undefined;
	}
};

/**
 * Sends a notification to a user via the notifications API.
 * @param userId - The user ID to notify.
 * @param message - The notification message.
 * @param type - The notification type ("info", "success", "warning", "error").
 * @returns {Promise<{ success: boolean; error?: string }>}
 */
export const sendNotification = async (
	userId: string,
	message: string,
	type: string = "info",
): Promise<{ success: boolean; error?: string }> => {
	try {
		const res = await axios.post("https://auctionmarket.tech/api/admin/notifications", {
			user_id: userId || "All",
			message,
			type,
		});
		if (res.data && res.data.success) {
			return { success: true };
		}
		return { success: false, error: res.data?.error || "Unknown error sending notification" };
	} catch (e: any) {
		let errorMsg = "Failed to send notification.";
		if (e?.response?.data?.error) errorMsg = e.response.data.error;
		else if (e?.message) errorMsg = e.message;
		logger.error("Notification error:", errorMsg);
		return { success: false, error: errorMsg };
	}
};

export function statusColor(status: iOrderStatus | "COMPLETE") {
	switch (status) {
		case iOrderStatus.Completed:
		case iOrderStatus.Pending:
		case "COMPLETE":
			return "bg-green-100 text-green-700";
		case iOrderStatus.Cancelled:
		case iOrderStatus.Failed:
			return "bg-red-100 text-red-700";
		case iOrderStatus.Unpaid:
		default:
			return "bg-yellow-100 text-yellow-700";
	}
}

// Function to group orders by order_id
export const groupOrdersByOrderId = (orders: iOrder[]): iGroupedOrder[] => {
	const grouped = orders.reduce((acc, order) => {
		const orderId = order.order_id;
		if (!acc[orderId]) {
			acc[orderId] = {
				order_id: orderId,
				user_name: `${order.user_first_name || ""} ${order.user_last_name || ""}`.trim(),
				user_email: order.user_email || "",
				created_at: order.created_at,
				items_count: 0,
				total_amount: 0,
				order_status: order.order_status,
				orders: [],
				payment_id: order.payment_id || "",
				user_id: order.user_id || "",
			};
		}
		acc[orderId].orders.push(order);
		acc[orderId].items_count = acc[orderId].orders.length;
		acc[orderId].total_amount += order.price || 0;

		// Use the latest status or highest priority status
		const statusPriority = {
			[iOrderStatus.Failed]: 6,
			[iOrderStatus.Cancelled]: 5,
			[iOrderStatus.Unpaid]: 4,
			[iOrderStatus.Pending]: 3,
			[iOrderStatus.Processing]: 2,
			[iOrderStatus.Completed]: 1,
			[iOrderStatus.Refunded]: 7,
			[iOrderStatus.Expired]: 8,
		};

		if (statusPriority[order.order_status] > statusPriority[acc[orderId].order_status]) {
			acc[orderId].order_status = order.order_status;
		}

		return acc;
	}, {} as Record<string, iGroupedOrder>);

	return Object.values(grouped);
};

interface iFetchOrdersResponse {
	orders: iOrder[];
	groupedOrders: iGroupedOrder[];
	error: string | null;
}

export async function fetchOrders({
	page,
	pageSize = 15,
}: {
	page: number;
	pageSize?: number;
}): Promise<iFetchOrdersResponse> {
	try {
		const res = await axios.get(
			`https://auctionmarket.tech/api/admin/orders?page=${page}&pageSize=${pageSize}`,
		);
		if (res.data && Array.isArray(res.data.orders)) {
			// Group orders by order_id
			const grouped = groupOrdersByOrderId(res.data.orders);

			logger.info("Fetched orders:", res.data.orders.length);
			logger.info("Grouped orders:", grouped.length);

			return { orders: res.data.orders, groupedOrders: grouped, error: null };
		} else {
			return { orders: [], groupedOrders: [], error: "Invalid response from server." };
		}
	} catch (e: any) {
		logger.error("Error fetching orders:", e);
		let msg = "Failed to fetch orders.";
		if (e?.response?.data?.error) msg = e.response.data.error;
		else if (e?.message) msg = e.message;
		return { orders: [], groupedOrders: [], error: msg };
	}
}

export async function fetchTransactions({
	page,
	pageSize = 15,
}: {
	page: number;
	pageSize?: number;
}): Promise<{ transactions: iTransaction[]; error: string | null }> {
	try {
		const res = await axios.get(
			`https://auctionmarket.tech/api/admin/transactions?page=${page}&pageSize=${pageSize}`,
		);
		if (res.data && Array.isArray(res.data.transactions)) {
			logger.info("Fetched transactions:", res.data.transactions.length);
			return { transactions: res.data.transactions, error: null };
		} else {
			return { transactions: [], error: "Invalid response from server." };
		}
	} catch (e: any) {
		logger.error("Error fetching transactions:", e);
		let msg = "Failed to fetch transactions.";
		if (e?.response?.data?.error) msg = e.response.data.error;
		else if (e?.message) msg = e.message;
		return { transactions: [], error: msg };
	}
}

// fetch notifications
export async function fetchNotifications(): Promise<{
	notifications: iNotification[];
	error?: string;
}> {
	try {
		const res = await axios.get<{ notifications: iNotification[]; error?: string }>(
			"https://auctionmarket.tech/api/admin/notifications",
		);

		const data = res.data;
		if (data.notifications) {
			return { notifications: data.notifications };
		} else {
			return { notifications: [], error: "No notifications found." };
		}
	} catch (e: unknown) {
		if (isAxiosError(e)) {
			return { notifications: [], error: e.response?.data?.error || e.message };
		} else {
			return {
				notifications: [],
				error: "An unexpected error occurred while fetching notifications.",
			};
		}
	}
}
