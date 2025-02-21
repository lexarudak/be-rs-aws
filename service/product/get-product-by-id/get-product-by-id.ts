const data = [
	{
		description: "Short Product Description",
		id: "1",
		price: 24,
		title: "Valera",
	},
	{
		description: "Short Product Description",
		id: "2",
		price: 15,
		title: "Natalia",
	},
	{
		description: "Short Product Description",
		id: "3",
		price: 23,
		title: "Marina",
	},
	{
		description: "Short Product Description",
		id: "4",
		price: 15,
		title: "Zinaida",
	},
	{
		description: "Short Product Description",
		id: "5",
		price: 23,
		title: "Irina",
	},
	{
		description: "Short Product Description",
		id: "6",
		price: 15,
		title: "Olga",
	},
];

interface Product {
	description: string;
	id: string;
	price: number;
	title: string;
}

interface Event {
	body: string;
	headers: { [key: string]: string };
	httpMethod: string;
	isBase64Encoded: boolean;
	path: string;
	queryStringParameters: { [key: string]: string } | null;
	pathParameters: { [key: string]: string } | null;
	stageVariables: { [key: string]: string } | null;
	requestContext: any;
	resource: string;
}

interface Response {
	statusCode: number;
	headers: { [key: string]: string | boolean };
	body: string;
}

const headers = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Credentials": true,
	"Content-Type": "application/json",
};

export const handler = async (event: Event): Promise<Response> => {
	try {
		const id = event.pathParameters?.id;
		const item = data.find((product: Product) => product.id === id);

		if (!item) {
			return {
				statusCode: 404,
				headers,
				body: JSON.stringify({ message: "Product not found" }),
			};
		}

		return {
			statusCode: 200,
			headers,
			body: JSON.stringify(item),
		};
	} catch (error) {
		return {
			statusCode: 500,
			headers,
			body: JSON.stringify({ message: "Internal server error", error }),
		};
	}
};
