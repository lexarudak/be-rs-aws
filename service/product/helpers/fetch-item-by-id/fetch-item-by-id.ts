import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import { REGIONS } from "../../utils/constants";

const region = REGIONS.DYNAMO_DB;

const dynamoDBClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const fetchItemById = async (
	tableName: string,
	key: Record<string, string>
) => {
	try {
		const data = await docClient.send(
			new GetCommand({
				TableName: tableName,
				Key: {
					...key,
				},
			})
		);
		return data.Item;
	} catch (error) {
		console.error("Error during fetch:", error);
		throw error;
	}
};
