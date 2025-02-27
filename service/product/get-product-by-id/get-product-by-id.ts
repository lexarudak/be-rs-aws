import { fetchItemById } from "../helpers/fetch-item-by-id/fetch-item-by-id";
import { DYNAMO_DB_TABLES, headers } from "../utils/constants";
import { RESPONSE } from "../utils/responses";

interface Event {
	pathParameters: { [key: string]: string } | null;
}

export const handler = async (event: Event) => {
	try {
		const id = event.pathParameters?.id;

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
