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

export const handler = async () => {
	try {
		return {
			statusCode: 200,
			headers: {
				"Access-Control-Allow-Origin": "*",
				"Access-Control-Allow-Credentials": true,
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		};
	} catch (error) {
		return {
			statusCode: 500,
			body: JSON.stringify({ message: "Internal server error", error }),
		};
	}
};
