import { SNSClient } from "@aws-sdk/client-sns";
import { transactWrite } from "../helpers/create-item/create-item";
import { handler } from "./catalog-batch-process"; // Убедитесь, что путь правильный

jest.mock("@aws-sdk/client-sns", () => {
  return {
    SNSClient: jest.fn().mockImplementation(() => ({
      send: jest.fn(), // Mock метода send
    })),
    PublishCommand: jest.fn(),
  };
});

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
    process.env = { ...OLD_ENV, CREATE_PRODUCT_TOPIC_ARN: "mock-topic-arn" };
    (SNSClient ).mockImplementation(() => mockSNSClient); // Mock SNSClient
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

    transactWrite.mockResolvedValue(true); // Mock DynamoDB транзакция
    mockSNSClient.send.mockResolvedValue({}); // Mock успешного SNS

    const result = await handler(mockEvent);

    expect(transactWrite).toHaveBeenCalledTimes(1); // Проверяем вызов транзакции
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

    transactWrite.mockResolvedValue(false); // Mock отказ DynamoDB транзакции

    await expect(handler(mockEvent)).rejects.toThrow("Transaction failed");

    expect(mockSNSClient.send).not.toHaveBeenCalled(); // Проверяем что SNS не вызывается
  });

  it("should throw an error if SNS publication fails", async () => {
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

    transactWrite.mockResolvedValue(true); // Mock успешной транзакции
    mockSNSClient.send.mockRejectedValue(new Error("SNS failure")); // Mock ошибки SNS

    await expect(handler(mockEvent)).rejects.toThrow("SNS failure");

    expect(transactWrite).toHaveBeenCalledTimes(1);
    expect(mockSNSClient.send).toHaveBeenCalledTimes(1);
  });
});