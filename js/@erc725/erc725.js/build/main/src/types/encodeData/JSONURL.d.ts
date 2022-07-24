import { SUPPORTED_HASH_FUNCTIONS } from '../../lib/constants';
export interface KeyValuePair {
    key: string;
    value: any;
}
interface URLData {
    url: string;
}
export interface URLDataWithHash extends URLData {
    hash: string;
    hashFunction: SUPPORTED_HASH_FUNCTIONS | string;
    json?: never;
}
export interface URLDataWithJson extends URLData {
    hash?: never;
    hashFunction?: never;
    json: Record<string, any>;
}
export declare type JSONURLDataToEncode = URLDataWithHash | URLDataWithJson;
export declare type EncodeDataType = string | string[] | JSONURLDataToEncode;
export interface EncodeDataReturn {
    keys: string[];
    values: string[];
}
export {};
