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

interface Event {
	pathParameters: { [key: string]: string } | null;
}

const headers = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Credentials": true,
	"Content-Type": "application/json",
};

export const handler = async (event: Event) => {
	try {
		const id = event.pathParameters?.id;
		const item = data.find((product) => product.id === id);

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
