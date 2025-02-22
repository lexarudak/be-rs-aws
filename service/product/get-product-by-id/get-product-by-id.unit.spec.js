import { handler } from "./get-product-by-id.js";
import data from "../__mocks__/products-list-mock.js";

describe("get-product-by-id", () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it("should return 200 and the product when the product is found", async () => {
		const event = {
			body: "",
			headers: {},
			httpMethod: "GET",
			isBase64Encoded: false,
			path: "",
			queryStringParameters: null,
			pathParameters: { id: "1" },
			stageVariables: null,
		};

		const result = await handler(event);

		expect(result.statusCode).toBe(200);
		expect(JSON.parse(result.body)).toEqual(data[0]);
	});

	it("should return 404 when the product is not found", async () => {
		const event = {
			body: "",
			headers: {},
			httpMethod: "GET",
			isBase64Encoded: false,
			path: "",
			queryStringParameters: null,
			pathParameters: { id: "999" },
			stageVariables: null,
		};

		const result = await handler(event);

		expect(result.statusCode).toBe(404);
		expect(JSON.parse(result.body)).toEqual({ message: "Product not found" });
	});

	it("should return 500 when an error occurs", async () => {
		const result = await handler(undefined);

		expect(result.statusCode).toBe(500);
		expect(JSON.parse(result.body)).toEqual({
			message: "Internal server error",
			error: expect.anything(),
		});
	});
});
