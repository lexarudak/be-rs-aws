import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { REGIONS } from "../../utils/constants";

const region = REGIONS.DYNAMO_DB;

const dynamoDBClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const fetchAllItems = async (tableName: string) => {
	try {
		const data = await docClient.send(
			new ScanCommand({ TableName: tableName })
		);
		return data.Items;
	} catch (error) {
		console.error("Error during fetch:", error);
		throw error;
	}
};
