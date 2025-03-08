import { S3Event } from "aws-lambda";
import {
	S3Client,
	GetObjectCommand,
	CopyObjectCommand,
	DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import csvParser from "csv-parser";
import { Readable } from "stream";

const s3Client = new S3Client({ region: "eu-north-1" });

export const handler = async (event: S3Event) => {
	console.log("S3 Event received:", JSON.stringify(event, null, 2));

	try {
		const { s3 } = event.Records[0];
		const Bucket = s3.bucket.name;
		const Key = s3.object.key;

		const getObjectCommand = new GetObjectCommand({
			Bucket,
			Key,
		});

		const response = await s3Client.send(getObjectCommand);
		const stream = response.Body;

		if (!stream) {
			throw new Error("Stream is empty");
		}

		const readableStream = stream as unknown as Readable;

		await new Promise<void>((resolve, reject) => {
			readableStream
				.pipe(csvParser())
				.on("data", (data) => {
					console.log("Parsed record:", data);
				})
				.on("end", () => {
					console.log("CSV file successfully parsed.");
					resolve();
				})
				.on("error", (error) => {
					console.error("Error parsing CSV file:", error);
					reject(error);
				});
		});

		const parsedKey = Key.replace("uploaded/", "parsed/");

		const copyObjectCommand = new CopyObjectCommand({
			Bucket,
			CopySource: `${Bucket}/${Key}`,
			Key: parsedKey,
		});
		await s3Client.send(copyObjectCommand);
		console.log(`File successfully copied to: ${parsedKey}`);

		const deleteObjectCommand = new DeleteObjectCommand({
			Bucket,
			Key,
		});
		await s3Client.send(deleteObjectCommand);
		console.log(`File successfully deleted from: ${Key}`);
	} catch (error) {
		console.error("Error processing S3 event:", error);
		throw new Error("Error during S3 event processing");
	}
};
