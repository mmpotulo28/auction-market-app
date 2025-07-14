"use client";
import supabase from "@/lib/db";
import { DUMMY_BIDS, DUMMY_ITEMS } from "@/lib/dummy-data";
import logger from "@/lib/logger";
import { iAuctionItem, iBid, iSupabasePayload } from "@/lib/types";
import { REALTIME_LISTEN_TYPES } from "@supabase/supabase-js";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "sonner-native";

interface WebSocketContextProps {
	placeBid: (itemId: string, amount: number, userId: string) => Promise<void>;
	highestBids: Record<string, iBid>;
	bids: iBid[];
	getAllBids: () => Promise<void>;
	items: iAuctionItem[];
	isLoading: boolean;
	error: string[];
	categories: string[];
}

const WebSocketContext = createContext<WebSocketContextProps | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [highestBids, setHighestBids] = useState<Record<string, iBid>>({});
	const [items, setItems] = useState<iAuctionItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string[]>([]);
	const [categories, setCategories] = useState<string[]>([]);
	const [bids, setBids] = useState<iBid[]>([]);

	// Initialize highest bids with mock data and fetch from the database
	useEffect(() => {
		const initializeBids = async () => {
			try {
				setIsLoading(true);
				setError([]);
				let itemsData: iAuctionItem[] = [];
				try {
					const { data: dbItems, error: itemsError } = await supabase
						.from("items")
						.select("*");
					if (itemsError || !dbItems) throw new Error("DB error");
					itemsData = dbItems as iAuctionItem[];
				} catch {
					itemsData = DUMMY_ITEMS;
				}

				console.log("Items fetched:", itemsData.length);
				setItems(itemsData);
				setCategories([...new Set(itemsData.map((item) => item.category))]);

				let bidsData: iBid[] = [];
				try {
					const { data, error } = await supabase
						.from("bids")
						.select("*")
						.order("timestamp", { ascending: false });
					if (error || !data) throw new Error("DB error");
					bidsData = data as iBid[];
				} catch {
					bidsData = DUMMY_BIDS;
				}
				setBids(bidsData);

				const mockBidsMap =
					itemsData.reduce<Record<string, iBid>>((acc, item) => {
						const bid = bidsData.find((b) => b.itemId === item.id);
						acc[item.id] = bid
							? bid
							: {
									itemId: item.id,
									amount: item.price,
									userId: "system",
									timestamp: new Date().toISOString(),
							  };
						return acc;
					}, {}) || {};

				setHighestBids(mockBidsMap);

				// After fetching items and bids, add a field to each item if auction ended
				setItems(
					itemsData.map((item) => {
						const auctionEnd =
							item.auction && item.auction.start_time
								? new Date(item.auction.start_time).getTime() +
								  (item.auction.duration || 0) * 60 * 1000
								: 0;
						const now = Date.now();
						return {
							...item,
							sold: auctionEnd > 0 && now > auctionEnd,
						};
					}),
				);
			} catch (err) {
				logger.error("Unexpected error fetching bids:", { err });
				setError((prev) => [...prev, "Unexpected error fetching bids"]);
				// fallback to dummy data if everything fails
				setItems(DUMMY_ITEMS);
				setCategories([...new Set(DUMMY_ITEMS.map((item) => item.category))]);
				setBids(DUMMY_BIDS);
				setHighestBids(
					DUMMY_ITEMS.reduce<Record<string, iBid>>((acc, item) => {
						const bid = DUMMY_BIDS.find((b) => b.itemId === item.id);
						acc[item.id] = bid
							? bid
							: {
									itemId: item.id,
									amount: item.price,
									userId: "system",
									timestamp: new Date().toISOString(),
							  };
						return acc;
					}, {}),
				);
			} finally {
				setIsLoading(false);
			}
		};

		initializeBids();
		logger.info("WebSocketProvider initialized");
	}, []);

	// Subscribe to real-time updates for the "bids" table
	useEffect(() => {
		const subscription = supabase
			.channel("realtime.public.bids")
			.on<iSupabasePayload>(
				REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as REALTIME_LISTEN_TYPES.SYSTEM,
				{ event: "*", schema: "public", table: "bids" },
				(payload) => {
					if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
						const bid = payload.new as iBid;

						setHighestBids((prev) => {
							const previousBid = prev[bid.itemId];
							if (
								previousBid?.userId &&
								previousBid.userId !== bid.userId &&
								bid.amount > previousBid.amount
							) {
								toast.info(`You lost the bid for item "${bid.itemId}"`);
							}
							return { ...prev, [bid.itemId]: bid };
						});

						setBids((prev) => [...prev, bid]);
					}
				},
			)
			.subscribe();

		// --- Notifications subscription ---
		const notificationSubscription = supabase
			.channel("realtime.public.notifications")
			.on(
				REALTIME_LISTEN_TYPES.POSTGRES_CHANGES as REALTIME_LISTEN_TYPES.SYSTEM,
				{ event: "INSERT", schema: "public", table: "notifications" },
				(payload: any) => {
					const notif = payload.new;
					// notif.user_id can be "All" or a specific user id
					// Show notification using toaster
					if (notif && notif.message) {
						const type = notif.type || "info";
						const toastFn =
							type === "success"
								? toast.success
								: type === "error"
								? toast.error
								: type === "warning"
								? toast.warning
								: toast.info;
						toastFn(notif.message, {
							description:
								notif.user_id === "All"
									? "Global notification"
									: "Personal notification",
						});
					}
				},
			)
			.subscribe();

		logger.info("WebSocket subscription created");

		return () => {
			supabase.removeChannel(subscription);
			supabase.removeChannel(notificationSubscription);
		};
	}, []);

	const getAllBids = useCallback(async () => {
		try {
			const { data, error } = await supabase.from("bids").select("*");
			if (error) throw new Error(`Error fetching bids: ${error.message}`);
			setBids((data ?? []) as iBid[]);
		} catch (err) {
			logger.error("Unexpected error fetching bids:", { err });
		}
	}, []);

	const placeBid = useCallback(async (itemId: string, amount: number, userId: string) => {
		try {
			const { error } = await supabase.from("bids").insert([
				{
					itemId,
					amount,
					userId,
					timestamp: new Date().toISOString(),
				},
			]);

			if (error) {
				logger.error("Error placing bid:", { error });
			}
		} catch (err) {
			logger.error("Unexpected error placing bid:", { err });
		}
	}, []);

	return (
		<WebSocketContext.Provider
			value={{
				placeBid,
				highestBids,
				items,
				isLoading,
				error,
				categories,
				getAllBids,
				bids,
			}}>
			{children}
		</WebSocketContext.Provider>
	);
};

export const useWebSocket = () => {
	const context = useContext(WebSocketContext);
	if (!context) {
		throw new Error("useWebSocket must be used within a WebSocketProvider");
	}
	return context;
};
