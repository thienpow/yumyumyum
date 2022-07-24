export interface GetDataDynamicKey {
    keyName: string;
    dynamicKeyParts: string | string[];
}
export declare type GetDataInput = string | GetDataDynamicKey | Array<string | GetDataDynamicKey>;
