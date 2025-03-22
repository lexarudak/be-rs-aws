import { SNSClient } from "@aws-sdk/client-sns";
import { transactWrite } from "../helpers/create-item/create-item";
import { handler } from "./catalog-batch-process";

jest.mock("@aws-sdk/client-sns", () => ({
	SNSClient: jest.fn().mockImplementation(() => ({
		send: jest.fn(),
	})),
	PublishCommand: jest.fn(),
}));

jest.mock("../helpers/create-item/create-item", () => ({
	transactWrite: jest.fn(),
}));

jest.mock("uuid", () => ({
	v4: jest.fn(() => "mocked-uuid"),
}));

describe("catalogBatchProcess handler", () => {
	const OLD_ENV = process.env;
	const mockSNSClient = {
		send: jest.fn(),
	};

	beforeEach(() => {
		jest.clearAllMocks();
		jest.spyOn(console, "log").mockImplementation(() => {});
		jest.spyOn(console, "error").mockImplementation(() => {});
		jest.spyOn(console, "warn").mockImplementation(() => {});
		process.env = { ...OLD_ENV, CREATE_PRODUCT_TOPIC_ARN: "mock-topic-arn" };
		(SNSClient as jest.Mock).mockImplementation(() => mockSNSClient);
	});

	afterAll(() => {
		process.env = OLD_ENV;
	});

	it("should process records, write to DynamoDB, and publish to SNS", async () => {
		const mockEvent = {
			Records: [
				{
					body: JSON.stringify({
						title: "valera",
						description: "great product",
						price: "100",
						count: "20",
					}),
				},
				{
					body: JSON.stringify({
						title: "another-title",
						description: "Another great product",
						price: "50",
						count: "10",
					}),
				},
			],
		};

		(transactWrite as jest.Mock).mockResolvedValue(true);
		mockSNSClient.send.mockResolvedValue({});

		const result = await handler(mockEvent);

		expect(transactWrite).toHaveBeenCalledTimes(1);
		expect(transactWrite).toHaveBeenCalledWith({
			TransactItems: [
				{
					Put: {
						TableName: "products",
						Item: {
							id: "mocked-uuid",
							title: "valera",
							description: "great product",
							price: 100,
						},
					},
				},
				{
					Put: {
						TableName: "stocks",
						Item: {
							product_id: "mocked-uuid",
							count: 20,
						},
					},
				},
				{
					Put: {
						TableName: "products",
						Item: {
							id: "mocked-uuid",
							title: "another-title",
							description: "Another great product",
							price: 50,
						},
					},
				},
				{
					Put: {
						TableName: "stocks",
						Item: {
							product_id: "mocked-uuid",
							count: 10,
						},
					},
				},
			],
		});

		expect(result).toBe(true);
	});

	it("should throw an error if DynamoDB transaction fails", async () => {
		const mockEvent = {
			Records: [
				{
					body: JSON.stringify({
						title: "valera",
						description: "great product",
						price: "100",
						count: "20",
					}),
				},
			],
		};

		(transactWrite as jest.Mock).mockResolvedValue(false);

		await expect(handler(mockEvent)).rejects.toThrow("Transaction failed");

		expect(mockSNSClient.send).not.toHaveBeenCalled();
	});

	it("should call transactWrite with correct input", async () => {
		const mockEvent = {
			Records: [
				{
					body: JSON.stringify({
						title: "simple-title",
						description: "Simple product",
						price: "100",
						count: "10",
					}),
				},
			],
		};

		(transactWrite as jest.Mock).mockResolvedValue(true);
		mockSNSClient.send.mockResolvedValue({});

		await handler(mockEvent);

		expect(transactWrite).toHaveBeenCalledTimes(1);
		expect(transactWrite).toHaveBeenCalledWith({
			TransactItems: [
				{
					Put: {
						TableName: "products",
						Item: {
							id: "mocked-uuid",
							title: "simple-title",
							description: "Simple product",
							price: 100,
						},
					},
				},
				{
					Put: {
						TableName: "stocks",
						Item: {
							product_id: "mocked-uuid",
							count: 10,
						},
					},
				},
			],
		});
	});

	it("should return true on successful execution", async () => {
		const mockEvent = {
			Records: [
				{
					body: JSON.stringify({
						title: "simple-title",
						description: "Simple product",
						price: "100",
						count: "10",
					}),
				},
			],
		};

		(transactWrite as jest.Mock).mockResolvedValue(true);
		mockSNSClient.send.mockResolvedValue({});

		const result = await handler(mockEvent);
		expect(result).toBe(true);
	});

	it("should log event records", async () => {
		const mockEvent = {
			Records: [
				{
					body: JSON.stringify({
						title: "simple-title",
						description: "Simple product",
						price: "100",
						count: "10",
					}),
				},
			],
		};

		const loggerMock = jest.spyOn(console, "log");
		(transactWrite as jest.Mock).mockResolvedValue(true);
		mockSNSClient.send.mockResolvedValue({});

		await handler(mockEvent);
		expect(loggerMock).toHaveBeenCalledWith("Products successfully created");
		loggerMock.mockRestore();
	});

	it("should catch and log errors when transactWrite fails", async () => {
		const mockEvent = {
			Records: [
				{
					body: JSON.stringify({
						title: "error-title",
						description: "This will fail",
						price: "100",
						count: "10",
					}),
				},
			],
		};

		(transactWrite as jest.Mock).mockResolvedValue(false);
		const errorMock = jest.spyOn(console, "error");

		await expect(handler(mockEvent)).rejects.toThrow("Transaction failed");
		expect(errorMock).toHaveBeenCalledWith("Transaction failed");
		errorMock.mockRestore();
	});
});
