import { DeleteObjectCommand } from "@aws-sdk/client-s3";

const deleteData = async (Bucket: string, Key: string, s3Client) => {
	const deleteObjectCommand = new DeleteObjectCommand({
		Bucket,
		Key,
	});
	await s3Client.send(deleteObjectCommand);
};

export default deleteData;
