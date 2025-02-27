import { fetchItemById } from "../helpers/fetch-item-by-id/fetch-item-by-id";
import { logger } from "../helpers/logger/logger";
import { DYNAMO_DB_TABLES, headers } from "../utils/constants";
import { RESPONSE } from "../utils/responses";
import { HandlerEvent } from "../utils/types";

export const handler = async (event: HandlerEvent) => {
	logger().incomingLog(event, event?.pathParameters);

	try {
		const id = event?.pathParameters?.id;

		if (!id) {
			return RESPONSE.NOT_FOUND;
		}

		const [productItem, stocksItem] = await Promise.all([
			fetchItemById(DYNAMO_DB_TABLES.PRODUCTS, { id }),
			fetchItemById(DYNAMO_DB_TABLES.STOCKS, { product_id: id }),
		]);

		if (!productItem || !stocksItem) {
			return RESPONSE.NOT_FOUND;
		}

		const item = {
			...productItem,
			count: stocksItem.count,
		};

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify(item),
		};
	} catch (error) {
		return RESPONSE.SERVER_ERROR;
	}
};
