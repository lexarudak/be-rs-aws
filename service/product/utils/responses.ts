import { headers } from "./constants";

export const RESPONSE = {
	NOT_FOUND: {
		statusCode: 404,
		headers,
		body: JSON.stringify({ message: "Data not found" }),
	},
	SERVER_ERROR: {
		statusCode: 500,
		headers,
		body: JSON.stringify({ message: "Internal server error" }),
	},
};
