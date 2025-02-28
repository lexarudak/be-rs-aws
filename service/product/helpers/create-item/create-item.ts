import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
	DynamoDBDocumentClient,
	TransactWriteCommand,
	TransactWriteCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { REGIONS } from "../../utils/constants";

const region = REGIONS.DYNAMO_DB;

const dynamoDBClient = new DynamoDBClient({ region });
const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

export const transactWrite = async (
	transactWriteCommandInput: TransactWriteCommandInput
) => {
	try {
		const { $metadata } = await docClient.send(
			new TransactWriteCommand(transactWriteCommandInput)
		);
		console.log("Transaction Complete:", $metadata);
		return true;
	} catch (error) {
		console.error("Transaction Error:", error);
		return false;
	}
};
