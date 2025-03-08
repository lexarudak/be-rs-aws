import { BUCKET_NAME, headers, REGIONS } from "../utils/constants";
import { main as getLink } from "../utils/create-url";
import { HandlerEvent } from "../utils/types";

export const handler = async (event: HandlerEvent) => {
	try {
		const fileName = event?.pathParameters?.name;

		if (!fileName) {
			return {
				statusCode: 404,
				headers,
				body: JSON.stringify({ message: "fileName not found", event }),
			};
		}

		const link = await getLink({
			region: REGIONS.IMPORT_BUCKET,
			bucketName: BUCKET_NAME,
			key: `uploaded/${fileName}`,
		});

		if (!link) {
			return {
				statusCode: 505,
				headers,
				body: JSON.stringify({ message: "link didn't created", event }),
			};
		}

		return {
			statusCode: 200,
			headers,
			body: link,
		};
	} catch (error) {
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ message: "Lambda internal error", error }),
		};
	}
};
