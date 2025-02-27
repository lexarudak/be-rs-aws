export interface HandlerEvent {
	pathParameters: { [key: string]: string } | null;
	body: string | null;
}

export type CreateItem = {
	title: string;
	description: string;
	price: number;
	count: number;
};

export type ProductItem = {
	id: string;
	title: string;
	description: string;
	price: number;
};

export type StockItem = {
	count: number;
	product_id: string;
};
