import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { Repository } from "typeorm";
import { Asset } from "../entity/asset";
import { AppDataSource } from "../data-source";
import { ASSET_EXTENSIONS, ASSET_MIMETYPES, AssetType, IAsset } from "@hascape/common";

export type File = Buffer | Uint8Array | Blob;


export class StorageService {

    private client: S3Client;
    private assets: Repository<Asset>;
    private bucket: string;
    private url: string;
    private root: string;

    constructor() {
        this.assets = AppDataSource.getRepository(Asset);
        this.bucket = process.env.S3_BUCKET as string;
        this.root = process.env.S3_ROOT as string;
        this.url = process.env.S3_URL as string;
        this.client = new S3Client({
            endpoint: process.env.S3_URL as string,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY as string,
                secretAccessKey: process.env.S3_SECRET_KEY as string,
            },
            region: 'sfo3'
        });
    }

    public async upload(name: string, type: AssetType, file: File): Promise<Asset> {
        const key = `${this.root}/${type}/${name}.${ASSET_EXTENSIONS[type]}`;

        await this.client.send(new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file,
            ContentType: ASSET_MIMETYPES[type],
            ACL: 'public-read'
        }));
        
        const url = `${this.url}/${this.bucket}/${key}`;

        const asset = new Asset();
        asset.name = name;
        asset.type = type;
        asset.url = url;
        
        return await this.assets.save(asset);
    }

    public async get(id: string) {
        const asset = await this.assets.findOneBy({
            id,
        });

        if (!asset) {
            throw new Error("Asset does not exist");
        }

        return asset;
    }
}