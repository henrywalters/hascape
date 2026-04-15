export enum AssetType {
    Texture = 'texture',
    Map = 'map',
    Prefab = 'prefab',
}

export const ASSET_EXTENSIONS = {
    [AssetType.Map]: 'json',
    [AssetType.Prefab]: 'json',
    [AssetType.Texture]: 'png',
}

export const ASSET_MIMETYPES = {
    [AssetType.Map]: 'application/json',
    [AssetType.Prefab]: 'application/json',
    [AssetType.Texture]: 'image/png',
}

export interface IAsset {
    id: string;
    type: AssetType;
    name: string;
    url: string;
}