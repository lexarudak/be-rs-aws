import { handler } from "./import-products-file";
import * as getLinkModule from "../utils/create-url";
import { headers } from "../utils/constants";

jest.mock("../utils/create-url");

const mockGetLink = jest.spyOn(getLinkModule, "main");

describe("handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 200 and a link when name is provided", async () => {
    const mockLink = "https://example.com/uploaded/file.csv";
    mockGetLink.mockResolvedValueOnce(mockLink);

    const event = {
      queryStringParameters: { name: "file.csv" },
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(200);
      expect(result.headers).toEqual(headers);
    expect(result.body).toBe(mockLink);
    expect(mockGetLink).toHaveBeenCalledWith({
      region: "eu-north-1",
      bucketName: "rs-aws-import",
      key: "uploaded/file.csv",
    });
  });

  it("should return 404 when name is not provided", async () => {
    const event = {
      queryStringParameters: {},
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(404);
    expect(result.headers).toEqual(headers);
    expect(JSON.parse(result.body)).toEqual({
      message: "fileName not found",
      event,
    });
    expect(mockGetLink).not.toHaveBeenCalled();
  });

  it("should return 505 when link creation fails", async () => {
    mockGetLink.mockResolvedValueOnce(null);

    const event = {
      queryStringParameters: { name: "file.csv" },
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(505);
      expect(result.headers).toEqual(headers);
    expect(JSON.parse(result.body)).toEqual({
      message: "link didn't created",
      event,
    });
    expect(mockGetLink).toHaveBeenCalledWith({
      region: "eu-north-1",
      bucketName: "rs-aws-import",
      key: "uploaded/file.csv",
    });
  });

  it("should return 500 when an internal error occurs", async () => {
    mockGetLink.mockRejectedValueOnce(new Error("Unexpected error"));

    const event = {
      queryStringParameters: { name: "file.csv" },
    };

    const result = await handler(event);

    expect(result.statusCode).toBe(500);
      expect(result.headers).toEqual(headers);
    expect(JSON.parse(result.body)).toEqual({
      message: "Lambda internal error",
      error: expect.anything(),
    });
    expect(mockGetLink).toHaveBeenCalledWith({
      region: "eu-north-1",
      bucketName: "rs-aws-import",
      key: "uploaded/file.csv",
    });
  });
});