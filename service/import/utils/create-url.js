import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import {
	getSignedUrl,
} from "@aws-sdk/s3-request-presigner";


const createPresignedUrlWithClient = ({ region, bucket, key }) => {
	const client = new S3Client({ region });
	const command = new PutObjectCommand({ Bucket: bucket, Key: key });
	return getSignedUrl(client, command, { expiresIn: 3600 });
};

export const main = async ({ bucketName, key, region }) => {
		return await createPresignedUrlWithClient({
			bucket: bucketName,
			region,
			key,
		});
};
