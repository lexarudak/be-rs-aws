import { GetObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

const getStream = async (Bucket: string, Key: string, s3Client) => {
	const getObjectCommand = new GetObjectCommand({
		Bucket,
		Key,
	});

	const response = await s3Client.send(getObjectCommand);

	const stream = response.Body;

	const readableStream = stream as unknown as Readable;

	return readableStream;
};

export default getStream;
