import { createItem } from "../helpers/create-item/create-item";
import { getValidCreateItem } from "../helpers/create-item/validation";
import { logger } from "../helpers/logger/logger";
import { DYNAMO_DB_TABLES, headers } from "../utils/constants";
import { RESPONSE } from "../utils/responses";
import { HandlerEvent, StockItem } from "../utils/types";
import { v4 as uuid } from "uuid";

export const handler = async (event: HandlerEvent) => {
	logger().incomingLog(event, event?.body);

	try {
		const body = JSON.parse(event?.body || "{}");
		const { title, description, price, count } = getValidCreateItem(body);

		const id = uuid();

		const [productItem, stocksItem] = await Promise.all([
			createItem(DYNAMO_DB_TABLES.PRODUCTS, { title, description, price, id }),
			createItem(DYNAMO_DB_TABLES.STOCKS, {
				product_id: id,
				count,
			}),
		]);

		if (!productItem || !stocksItem) {
			return RESPONSE.SERVER_ERROR;
		}

		return {
			statusCode: 201,
			headers,
			body: JSON.stringify({
				...productItem,
				count: (stocksItem as StockItem).count,
			}),
		};
	} catch (error) {
		if (error instanceof Error && error.message.includes("Invalid data")) {
			return {
				statusCode: 400,
				headers,
				body: JSON.stringify({ error: error.message }),
			};
		}

		return {
			statusCode: 500,
			headers,
			body: RESPONSE.SERVER_ERROR,
		};
	}
};
