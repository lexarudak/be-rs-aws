import { handler } from "./import-file-parser";
import { S3Client } from "@aws-sdk/client-s3";
import parsStream from "../utils/pars-stream";
import getStream from "../utils/get-stream";
import copyData from "../utils/copy-data";
import deleteData from "../utils/delete-data";

jest.mock("@aws-sdk/client-s3");
jest.mock("../utils/pars-stream");
jest.mock("../utils/get-stream");
jest.mock("../utils/copy-data");
jest.mock("../utils/delete-data");

describe("import-file-parser handler", () => {
  const s3Client = new S3Client({ region: "eu-north-1" });
  const mockEvent = {
    Records: [
      {
        s3: {
          bucket: { name: "test-bucket" },
          object: { key: "uploaded/test-file.csv" },
        },
      },
    ],
  };

  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    jest.clearAllMocks();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it("should process the S3 event successfully", async () => {
    const mockStream = {};
    getStream.mockResolvedValue(mockStream);
    parsStream.mockResolvedValue(undefined);
    copyData.mockResolvedValue(undefined);
    deleteData.mockResolvedValue(undefined);

    await handler(mockEvent);

    expect(getStream).toHaveBeenCalledWith("test-bucket", "uploaded/test-file.csv", s3Client);
    expect(parsStream).toHaveBeenCalledWith(mockStream);
    expect(copyData).toHaveBeenCalledWith(
      "test-bucket",
      "uploaded/test-file.csv",
      "parsed/test-file.csv",
      s3Client
    );
    expect(deleteData).toHaveBeenCalledWith("test-bucket", "uploaded/test-file.csv", s3Client);
  });

  it("should throw an error if getStream fails", async () => {
    getStream.mockRejectedValue(new Error("getStream error"));

    await expect(handler(mockEvent)).rejects.toThrow("Error during S3 event processing");

    expect(getStream).toHaveBeenCalledWith("test-bucket", "uploaded/test-file.csv", s3Client);
    expect(parsStream).not.toHaveBeenCalled();
    expect(copyData).not.toHaveBeenCalled();
    expect(deleteData).not.toHaveBeenCalled();
  });

  it("should throw an error if parsStream fails", async () => {
    const mockStream = {};
    getStream.mockResolvedValue(mockStream);
    parsStream.mockRejectedValue(new Error("parsStream error"));

    await expect(handler(mockEvent)).rejects.toThrow("Error during S3 event processing");

    expect(getStream).toHaveBeenCalledWith("test-bucket", "uploaded/test-file.csv", s3Client);
    expect(parsStream).toHaveBeenCalledWith(mockStream);
    expect(copyData).not.toHaveBeenCalled();
    expect(deleteData).not.toHaveBeenCalled();
  });

  it("should throw an error if copyData fails", async () => {
    const mockStream = {};
    getStream.mockResolvedValue(mockStream);
    parsStream.mockResolvedValue(undefined);
    copyData.mockRejectedValue(new Error("copyData error"));

    await expect(handler(mockEvent)).rejects.toThrow("Error during S3 event processing");

    expect(getStream).toHaveBeenCalledWith("test-bucket", "uploaded/test-file.csv", s3Client);
    expect(parsStream).toHaveBeenCalledWith(mockStream);
    expect(copyData).toHaveBeenCalledWith(
      "test-bucket",
      "uploaded/test-file.csv",
      "parsed/test-file.csv",
      s3Client
    );
    expect(deleteData).not.toHaveBeenCalled();
  });

  it("should throw an error if deleteData fails", async () => {
    const mockStream = {};
    getStream.mockResolvedValue(mockStream);
    parsStream.mockResolvedValue(undefined);
    copyData.mockResolvedValue(undefined);
    deleteData.mockRejectedValue(new Error("deleteData error"));

    await expect(handler(mockEvent)).rejects.toThrow("Error during S3 event processing");

    expect(getStream).toHaveBeenCalledWith("test-bucket", "uploaded/test-file.csv", s3Client);
    expect(parsStream).toHaveBeenCalledWith(mockStream);
    expect(copyData).toHaveBeenCalledWith(
      "test-bucket",
      "uploaded/test-file.csv",
      "parsed/test-file.csv",
      s3Client
    );
    expect(deleteData).toHaveBeenCalledWith("test-bucket", "uploaded/test-file.csv", s3Client);
  });
});
