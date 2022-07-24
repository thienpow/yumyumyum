import { EncodeDataType } from './encodeData/JSONURL';
export declare type DynamicKeyParts = string | string[];
export interface DynamicKeyPartInput {
    dynamicKeyParts: DynamicKeyParts;
    value: EncodeDataType;
}
