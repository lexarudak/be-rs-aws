import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { DYNAMO_DB_REGION } from '../../utils/constants.js';


const region = DYNAMO_DB_REGION

const dynamoDBClient = new DynamoDBClient({
  region
});

const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

const addData = async (tableName, item) => {
    const params = {
        TableName: tableName,
        Item: item
    };

    try {
        const data = await docClient.send(new PutCommand(params));
        console.log("Item inserted:", data);
    } catch (error) {
        console.error("Error occurred:", error);
    }
};

export const fillTable = (tableName, data) => {
  data.forEach(( item ) => addData(tableName, item));
}