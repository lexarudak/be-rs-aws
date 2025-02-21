import { handler } from "./get-product-by-id";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

describe("get-product-by-id", () => {
	const data = [
		{
			description: "Short Product Description",
			id: "1",
			price: 24,
			title: "Valera",
		},
		{
			description: "Short Product Description",
			id: "2",
			price: 15,
			title: "Natalia",
		},
		{
			description: "Short Product Description",
			id: "3",
			price: 23,
			title: "Marina",
		},
		{
			description: "Short Product Description",
			id: "4",
			price: 15,
			title: "Zinaida",
		},
		{
			description: "Short Product Description",
			id: "5",
			price: 23,
			title: "Irina",
		},
		{
			description: "Short Product Description",
			id: "6",
			price: 15,
			title: "Olga",
		},
	];

	it("should return 200 and the product when the product is found", async () => {
		const event: APIGatewayProxyEvent = {
			body: "",
			headers: {},
			httpMethod: "GET",
			isBase64Encoded: false,
			path: "",
			queryStringParameters: null,
			pathParameters: { id: "1" },
			stageVariables: null,
			requestContext: {} as any,
			resource: "",
		};

		const result: APIGatewayProxyResult = await handler(event);

		expect(result.statusCode).toBe(200);
		expect(JSON.parse(result.body)).toEqual(data[0]);
	});

	it("should return 404 when the product is not found", async () => {
		const event: APIGatewayProxyEvent = {
			body: "",
			headers: {},
			httpMethod: "GET",
			isBase64Encoded: false,
			path: "",
			queryStringParameters: null,
			pathParameters: { id: "999" },
			stageVariables: null,
			requestContext: {} as any,
			resource: "",
		};

		const result: APIGatewayProxyResult = await handler(event);

		expect(result.statusCode).toBe(404);
		expect(JSON.parse(result.body)).toEqual({ message: "Product not found" });
	});

	it("should return 500 when an error occurs", async () => {
		const event: APIGatewayProxyEvent = {
			body: "",
			headers: {},
			httpMethod: "GET",
			isBase64Encoded: false,
			path: "",
			queryStringParameters: null,
			pathParameters: null,
			stageVariables: null,
			requestContext: {} as any,
			resource: "",
		};

		const result: APIGatewayProxyResult = await handler(event);

		expect(result.statusCode).toBe(500);
		expect(JSON.parse(result.body)).toEqual({
			message: "Internal server error",
			error: expect.anything(),
		});
	});
});
