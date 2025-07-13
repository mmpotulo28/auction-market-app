import { fetchOrders, fetchTransactions } from "@/lib/helpers";
import { iGroupedOrder, iTransaction } from "@/lib/types";
import { AxiosError } from "axios";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface AccountContextType {
	orders: iGroupedOrder[];
	transactions: iTransaction[];
	loadingOrders: boolean;
	loadingTransactions: boolean;
	errorOrders: string | null;
	errorTransactions: string | null;
	fetchOrders: () => Promise<void>;
	fetchTransactions: () => Promise<void>;
}

export const AccountContext = React.createContext<AccountContextType>({
	orders: [],
	transactions: [],
	loadingOrders: false,
	loadingTransactions: false,
	errorOrders: null,
	errorTransactions: null,
	fetchOrders: async () => {},
	fetchTransactions: async () => {},
});

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [orders, setOrders] = useState<iGroupedOrder[]>([]);
	const [transactions, setTransactions] = useState<iTransaction[]>([]);
	const [loadingOrders, setLoadingOrders] = useState(false);
	const [loadingTransactions, setLoadingTransactions] = useState(false);
	const [errorOrders, setErrorOrders] = useState<string | null>(null);
	const [errorTransactions, setErrorTransactions] = useState<string | null>(null);

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

	useEffect(() => {
		fetchOrdersData();
		fetchTransactionsData();
	}, [fetchOrdersData, fetchTransactionsData]);

	const contextValue = useMemo(
		() => ({
			orders,
			transactions,
			loadingOrders,
			loadingTransactions,
			errorOrders,
			errorTransactions,
			fetchOrders: fetchOrdersData,
			fetchTransactions: fetchTransactionsData,
		}),
		[
			orders,
			transactions,
			loadingOrders,
			loadingTransactions,
			errorOrders,
			errorTransactions,
			fetchOrdersData,
			fetchTransactionsData,
		],
	);

	return <AccountContext.Provider value={contextValue}>{children}</AccountContext.Provider>;
};
AccountProvider.displayName = "AccountProvider";

export const useAccountContext = () => React.useContext(AccountContext);
