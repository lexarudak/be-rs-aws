import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { REGIONS } from "../../utils/constants";
import { ProductItem, StockItem } from "../../utils/types";

const region = REGIONS.DYNAMO_DB;

const dynamoDBClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const createItem = async (
	TableName: string,
	Item: ProductItem | StockItem
) => {
	try {
		const data = await docClient.send(
			new PutCommand({
				TableName,
				Item,
			})
		);
		console.log("Item added:", data);
		return Item;
	} catch (error) {
		console.error("Error during add:", error);
		throw error;
	}
};
