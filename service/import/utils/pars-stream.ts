import csvParser from "csv-parser";
import { Readable } from "stream";

const parsStream = (readableStream: Readable) =>
	new Promise<void>((resolve, reject) => {
		readableStream
			.pipe(csvParser())
			.on("data", (data) => {
				console.log("Parsed record:", data);
			})
			.on("end", () => {
				console.log("CSV file successfully parsed.");
				resolve();
			})
			.on("error", (error) => {
				console.error("Error parsing CSV file:", error);
				reject(error);
			});
	});

export default parsStream;
