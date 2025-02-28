export const logger = () => {
	return {
		incomingLog(event: unknown, args?: unknown) {
			console.log(
				"Incoming event:",
				JSON.stringify(event, null, 2),
				JSON.stringify({
					args,
				})
			);
		},
	};
};
