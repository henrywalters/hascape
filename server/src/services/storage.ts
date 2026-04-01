import { S3Client } from "@aws-sdk/client-s3";

export class StorageService {

    private client: S3Client;

    constructor() {
        this.client = new S3Client({
            endpoint: process.env.S3_URL as string,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY as string,
                secretAccessKey: process.env.S3_SECRET_KEY as string,
            }
        });
        console.log(this.client);
    }
}