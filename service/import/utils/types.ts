export interface HandlerEvent {
	queryStringParameters: { [key: string]: string } | null;
	pathParameters: { [key: string]: string } | null;
	body: string | null;
}
