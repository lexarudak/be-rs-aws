import { CopyObjectCommand } from "@aws-sdk/client-s3";

const copyData = async (
	Bucket: string,
	Key: string,
	parsedKey: string,
	s3Client
) => {
	const copyObjectCommand = new CopyObjectCommand({
		Bucket,
		CopySource: `${Bucket}/${Key}`,
		Key: parsedKey,
	});
	await s3Client.send(copyObjectCommand);
};

export default copyData;
