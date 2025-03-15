import csvParser from "csv-parser";
import { Readable } from "stream";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({ region: "eu-north-1" });

const parsStream = (readableStream: Readable, QueueUrl: string) =>
	new Promise<void>((resolve, reject) => {
		readableStream
			.pipe(csvParser())
			.on("data", async (data) => {
				const sqsMessage = {
					QueueUrl,
					MessageBody: JSON.stringify(data),
				};

				try {
					await sqsClient.send(new SendMessageCommand(sqsMessage));
				} catch (error) {
					reject(error);
				}
			})
			.on("end", () => {
				console.log(
					"CSV file successfully parsed and all records sent to SQS."
				);
				resolve();
			})
			.on("error", (error) => {
				console.error("Error parsing CSV file:", error);
				reject(error);
			});
	});

export default parsStream;
