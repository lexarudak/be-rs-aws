import { TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import { transactWrite } from "../helpers/create-item/create-item";
import { logger } from "../helpers/logger/logger";
import { DYNAMO_DB_TABLES } from "../utils/constants";
import { v4 as uuid } from "uuid";
import { getValidCreateItem } from "../helpers/create-item/validation";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({});
const createProductTopicArn = process.env.CREATE_PRODUCT_TOPIC_ARN!;

export const handler = async (event: any) => {
	logger().incomingLog(event, event.Records);

	try {
		const transactItems: TransactWriteCommandInput["TransactItems"] =
			event.Records.map((record: any) => {
				const body = JSON.parse(record.body);

				const numerableBody = {
					...body,
					count: Number(body.count),
					price: Number(body.price),
				};

				const { title, description, price, count } =
					getValidCreateItem(numerableBody);

				const id = uuid();

				const productParams = {
					Put: {
						TableName: DYNAMO_DB_TABLES.PRODUCTS,
						Item: {
							id,
							title,
							description,
							price,
						},
					},
				};

				const stocksParams = {
					Put: {
						TableName: DYNAMO_DB_TABLES.STOCKS,
						Item: {
							product_id: id,
							count,
						},
					},
				};

				return [productParams, stocksParams];
			}).flat();

		const isTransactionSuccess = await transactWrite({
			TransactItems: transactItems,
		});

		if (!isTransactionSuccess) {
			console.error("Transaction failed");
			throw new Error("Transaction failed");
		}

		console.log("Products successfully created");

		const snsMessage = {
			Subject: "New Products Created",
			Message: `The following products have been added:\n${event.Records.map(
				(record: any) => JSON.stringify(JSON.parse(record.body), null, 2)
			).join("\n")}`,
			TopicArn: createProductTopicArn,
		};

		await snsClient.send(new PublishCommand(snsMessage));

		console.log("SNS notification sent successfully.");

		return true;
	} catch (error) {
		console.error("Error processing batch:", error);
		throw error;
	}
};
