import { TransactWriteCommandInput } from "@aws-sdk/lib-dynamodb";
import { transactWrite } from "../helpers/create-item/create-item";
import { logger } from "../helpers/logger/logger";
import { DYNAMO_DB_TABLES } from "../utils/constants";
import { v4 as uuid } from "uuid";
import { getValidCreateItem } from "../helpers/create-item/validation";

export const handler = async (event: any) => {
	logger().incomingLog(event, event.Records);

	try {
		const transactItems: TransactWriteCommandInput["TransactItems"] =
			event.Records.map((record: any) => {
				const body = JSON.parse(record.body);
				const { title, description, price, count } = getValidCreateItem(body);

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
		return true;
	} catch (error) {
		console.error("Error processing batch:", error);
		throw error;
	}
};
