import { fetchAllItems } from "../helpers/fetch-all-items/fetch-all-items";
import { DYNAMO_DB_TABLES } from "../utils/constants";

const headers = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Credentials": true,
	"Content-Type": "application/json",
};

export const handler = async () => {
	try {
		const [productsData, stocksData] = await Promise.all([
			fetchAllItems(DYNAMO_DB_TABLES.PRODUCTS),
			fetchAllItems(DYNAMO_DB_TABLES.STOCKS),
		]);

		if (!productsData || !stocksData) {
			return {
				statusCode: 404,
				headers,
				body: JSON.stringify({ message: "Data not found" }),
			};
		}

		const data = productsData.map((product) => {
			const stock = stocksData.find(
				({ product_id }) => product_id === product.id
			);
			return {
				...product,
				count: stock?.count || 0,
			};
		});

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify(data),
		};
	} catch (error) {
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ message: "Internal Server Error" }),
		};
	}
};
