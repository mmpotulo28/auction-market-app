import { fetchNotifications, fetchOrders, fetchTransactions } from "@/lib/helpers";
import { iGroupedOrder, iNotification, iTransaction } from "@/lib/types";
import { AxiosError } from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface AccountContextType {
	orders: iGroupedOrder[];
	transactions: iTransaction[];
	notifications: iNotification[];
	loadingOrders: boolean;
	loadingTransactions: boolean;
	loadingNotifications: boolean;
	errorOrders: string | null;
	errorTransactions: string | null;
	errorNotifications: string | null;
	fetchOrders: () => Promise<void>;
	fetchTransactions: () => Promise<void>;
	fetchNotifications: () => Promise<void>;
}

export const AccountContext = React.createContext<AccountContextType>({
	orders: [],
	transactions: [],
	notifications: [],
	loadingOrders: false,
	loadingTransactions: false,
	loadingNotifications: false,
	errorOrders: null,
	errorTransactions: null,
	errorNotifications: null,
	fetchOrders: async () => {},
	fetchTransactions: async () => {},
	fetchNotifications: async () => {},
});

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [orders, setOrders] = useState<iGroupedOrder[]>([]);
	const [transactions, setTransactions] = useState<iTransaction[]>([]);
	const [loadingOrders, setLoadingOrders] = useState(false);
	const [loadingTransactions, setLoadingTransactions] = useState(false);
	const [errorOrders, setErrorOrders] = useState<string | null>(null);
	const [errorTransactions, setErrorTransactions] = useState<string | null>(null);
	const [notifications, setNotifications] = useState<iNotification[]>([]);
	const [errorNotifications, setErrorNotifications] = useState<string | null>(null);
	const [loadingNotifications, setLoadingNotifications] = useState(false);

	const fetchOrdersData = useCallback(async () => {
		setLoadingOrders(true);
		setErrorOrders(null);
		try {
			const data = await fetchOrders({ page: 1, pageSize: 10 });
			setOrders(data.groupedOrders);
		} catch (err) {
			if (err instanceof Error || err instanceof AxiosError) {
				setErrorOrders(err.message);
			} else {
				console.error("Error fetching orders:", err);
				setErrorOrders("Failed to fetch orders.");
			}
		} finally {
			setLoadingOrders(false);
		}
	}, []);

	const fetchTransactionsData = useCallback(async () => {
		setLoadingTransactions(true);
		setErrorTransactions(null);
		try {
			const data = await fetchTransactions({ page: 1, pageSize: 10 });
			setTransactions(data.transactions);
		} catch (err) {
			console.error("Error fetching transactions:", err);
			if (err instanceof Error || err instanceof AxiosError) {
				setErrorTransactions(err.message);
			} else {
				setErrorTransactions("Failed to fetch transactions.");
			}
		} finally {
			setLoadingTransactions(false);
		}
	}, []);

	const fetchNotificationsData = useCallback(async () => {
		try {
			setLoadingNotifications(true);
			setErrorNotifications(null);
			const res = await fetchNotifications();
			if (res.error) {
				throw new Error(res.error);
			}

			setNotifications(res.notifications);
		} catch (err) {
			console.error("Error fetching notifications:", err);
			if (err instanceof Error || err instanceof AxiosError) {
				setErrorNotifications(err.message);
			} else {
				setErrorNotifications(
					typeof err === "object" && err !== null && "toString" in err
						? (err as { toString: () => string }).toString()
						: String(err),
				);
			}
		} finally {
			setLoadingNotifications(false);
		}
	}, []);

	useEffect(() => {
		fetchOrdersData();
		fetchTransactionsData();
		fetchNotificationsData();
	}, [fetchOrdersData, fetchTransactionsData, fetchNotificationsData]);

	const contextValue = useMemo(
		() => ({
			orders,
			transactions,
			notifications,
			loadingOrders,
			loadingTransactions,
			loadingNotifications,
			errorOrders,
			errorTransactions,
			errorNotifications,
			fetchOrders: fetchOrdersData,
			fetchTransactions: fetchTransactionsData,
			fetchNotifications: fetchNotificationsData,
		}),
		[
			orders,
			transactions,
			notifications,
			loadingOrders,
			loadingTransactions,
			loadingNotifications,
			errorOrders,
			errorTransactions,
			errorNotifications,
			fetchOrdersData,
			fetchTransactionsData,
			fetchNotificationsData,
		],
	);

	return <AccountContext.Provider value={contextValue}>{children}</AccountContext.Provider>;
};
AccountProvider.displayName = "AccountProvider";

export const useAccountContext = () => React.useContext(AccountContext);
