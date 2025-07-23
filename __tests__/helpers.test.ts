// Simple test for the stringToUrl function without importing from the actual module

import { dateToString, groupOrdersByOrderId, stringToUrl } from "@/lib/helpers";
import { iGroupedOrder, iOrder, iOrderStatus } from "@/lib/types";

describe("stringToUrl", () => {
	test("should convert a string to a url format", () => {
		const original = "my name is";
		const converted = stringToUrl(original);
		expect(converted).toBe("my-name-is");
	});

	test("should handle special characters", () => {
		const original = "Hello! How are you?";
		const converted = stringToUrl(original);
		expect(converted).toBe("hello-how-are-you");
	});

	test("should remove leading and trailing hyphens", () => {
		const original = "-test string-";
		const converted = stringToUrl(original);
		expect(converted).toBe("test-string");
	});
});

describe("dateToString", () => {
	test("should take in a date and format into to locale string", () => {
		const date = new Date("2023-04-15T12:00:00.000Z");
		const formattedDate = dateToString(date);
		expect(formattedDate).toBe("Saturday, April 15, 2023 at 12:00 PM");
	});

	test("should handle invalid dates", () => {
		const invalidDate = new Date("invalid date");
		const formattedDate = dateToString(invalidDate);
		expect(formattedDate).toBe("");
	});

	test("should handle empty dates", () => {
		const emptyDate = dateToString(new Date(""));
		expect(emptyDate).toBe("");
	});
});

describe("groupOrdersByOrderId", () => {
	test("should group passed orders by id", () => {
		const mockOrders: iOrder[] = [
			{
				id: 1,
				order_id: "id_1",
				user_id: "user_1",
				item_id: "item_1",
				item_name: "itemName_1",
				payment_id: "paymentId_1",
				user_email: "email",
				user_first_name: "fname",
				user_last_name: "lname",
				order_status: iOrderStatus.Unpaid,
				created_at: "today",
				updated_at: "today",
				price: 0,
			},
			{
				id: 1,
				order_id: "id_2",
				user_id: "user_2",
				item_id: "item_2",
				item_name: "itemName_2",
				payment_id: "paymentId_2",
				user_email: "email",
				user_first_name: "fname",
				user_last_name: "lname",
				order_status: iOrderStatus.Cancelled,
				created_at: "today",
				updated_at: "today",
				price: 0,
			},
		];

		const mockGroupedOrders: iGroupedOrder[] = [
			{
				order_id: "id_1",
				user_email: "email",
				created_at: "today",
				items_count: 1,
				total_amount: 0,
				order_status: iOrderStatus.Unpaid,
				orders: [
					{
						id: 1,
						order_id: "id_1",
						user_id: "user_1",
						item_id: "item_1",
						item_name: "itemName_1",
						payment_id: "paymentId_1",
						user_email: "email",
						user_first_name: "fname",
						user_last_name: "lname",
						order_status: iOrderStatus.Unpaid,
						created_at: "today",
						updated_at: "today",
						price: 0,
					},
				],
				payment_id: "paymentId_1",
				user_id: "user_1",
				user_name: "fname lname",
			},
			{
				order_id: "id_2",
				user_name: "fname lname",
				user_email: "email",
				created_at: "today",
				items_count: 1,
				total_amount: 0,
				order_status: iOrderStatus.Cancelled,
				orders: [
					{
						id: 1,
						order_id: "id_2",
						user_id: "user_2",
						item_id: "item_2",
						item_name: "itemName_2",
						payment_id: "paymentId_2",
						user_email: "email",
						user_first_name: "fname",
						user_last_name: "lname",
						order_status: iOrderStatus.Cancelled,
						created_at: "today",
						updated_at: "today",
						price: 0,
					},
				],
				payment_id: "paymentId_2",
				user_id: "user_2",
			},
		];

		expect(groupOrdersByOrderId(mockOrders)).toEqual(mockGroupedOrders);
	});
});
