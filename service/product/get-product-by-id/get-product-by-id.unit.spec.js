import { handler } from "./get-product-by-id";
import * as fetchItemByIdModule from "../helpers/fetch-item-by-id/fetch-item-by-id"; 

jest.mock("../helpers/fetch-item-by-id/fetch-item-by-id");

const mockFetchItemById = jest.spyOn(fetchItemByIdModule, "fetchItemById");

describe("get-product-by-id", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 200 and the product when the product is found", async () => {
		const mockProductItem = { name: "product1", price: 100, id: 1 };
		const mockStocksItem = { product_id: 1, count: 3 };

		mockFetchItemById
			.mockResolvedValueOnce(mockProductItem)
			.mockResolvedValueOnce(mockStocksItem);

		const event = {
			pathParameters: { id: "1" },
		};

		const result = await handler(event);

		expect(result.statusCode).toBe(200);
		expect(JSON.parse(result.body)).toEqual({
			...mockProductItem,
			count: mockStocksItem.count,
		});
	});

	it("should return 404 when the product is not found", async () => {

		mockFetchItemById.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

		const event = {
			pathParameters: { id: "999" },
		};

		const result = await handler(event);

		expect(result.statusCode).toBe(404);
		expect(JSON.parse(result.body)).toEqual({ message: "Data not found" });
	});

	it("should return 500 when an error occurs", async () => {
	mockFetchItemById.mockRejectedValue(new Error("Unexpected error"));

	const event = {
			pathParameters: { id: "999" },
	};
	const result = await handler(event);

	expect(result.statusCode).toBe(500); 
	expect(JSON.parse(result.body)).toEqual({
		message: "Internal server error",
	});
});
});