import { S3Event } from "aws-lambda";
import { S3Client } from "@aws-sdk/client-s3";
import parsStream from "../utils/pars-stream";
import getStream from "../utils/get-stream";
import copyData from "../utils/copy-data";
import deleteData from "../utils/delete-data";

const s3Client = new S3Client({ region: "eu-north-1" });

const CATALOG_ITEMS_QUEUE_URL = process.env.CATALOG_ITEMS_QUEUE_URL!;

export const handler = async (event: S3Event) => {
	console.log("S3 Event received:", JSON.stringify(event, null, 2));

	try {
		const { s3 } = event.Records[0];
		const Bucket = s3.bucket.name;
		const Key = s3.object.key;

		const readableStream = await getStream(Bucket, Key, s3Client);

		await parsStream(readableStream, CATALOG_ITEMS_QUEUE_URL);

		const parsedKey = Key.replace("uploaded/", "parsed/");

		await copyData(Bucket, Key, parsedKey, s3Client);

		console.log(`File successfully copied to: ${parsedKey}`);

		await deleteData(Bucket, Key, s3Client);
		console.log(`File successfully deleted from: ${Key}`);
	} catch (error) {
		console.error("Error processing S3 event:", error);
		throw new Error("Error during S3 event processing");
	}
};
