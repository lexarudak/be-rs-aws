export interface HandlerEvent {
	pathParameters: { [key: string]: string } | null;
	body: string | null;
}
