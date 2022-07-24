/**
 * @file lib/utils.ts
 * @author Robert McLeod <@robertdavid010>
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @author Hugo Masclet <@Hugoo>
 * @date 2020
 */
import { JSONURLDataToEncode, EncodeDataReturn, URLDataWithHash } from '../types';
import { ERC725JSONSchema, ERC725JSONSchemaKeyType, ERC725JSONSchemaValueType } from '../types/ERC725JSONSchema';
import { SUPPORTED_HASH_FUNCTIONS } from './constants';
import { EncodeDataInput } from '../types/decodeData';
import { GetDataDynamicKey } from '../types/GetData';
/**
 *
 * @param {string} valueContent as per ERC725Schema definition
 * @param {string} valueType as per ERC725Schema definition
 * @param decodedValue can contain single value, an array, or an object as required by schema (JSONURL, or ASSETURL)
 * @param {string} [name]
 *
 * @return the encoded value as per the schema
 */
export declare function encodeKeyValue(valueContent: string, valueType: ERC725JSONSchemaValueType, decodedValue: string | string[] | number | number[] | JSONURLDataToEncode | JSONURLDataToEncode[], name?: string): string | false;
/**
 *
 * @param key The schema key of a schema with keyType = 'Array'
 * @param index An integer representing the intended array index
 * @return The raw bytes key for the array element
 */
export declare function encodeArrayKey(key: string, index: number): string;
/**
 *
 * @param keyName the schema key name
 * @returns a guess of the schema key type
 */
export declare function guessKeyTypeFromKeyName(keyName: string): ERC725JSONSchemaKeyType;
export declare const encodeTupleKeyValue: (valueContent: string, valueType: string, decodedValues: Array<string | number | JSONURLDataToEncode>) => string;
/**
 *
 * @param schema is an object of a schema definitions.
 * @param value will be either key-value pairs for a key type of Array, or a single value for type Singleton.
 *
 * @return the encoded value for the key as per the supplied schema.
 */
export declare function encodeKey(schema: ERC725JSONSchema, value: string | string[] | number | number[] | JSONURLDataToEncode | JSONURLDataToEncode[]): string | false | {
    key: string;
    value: string;
}[] | null;
/**
 *
 * @param {string} valueContent as per ERC725Schema definition.
 * @param {string} valueType as per ERC725Schema definition.
 * @param {string} value the encoded value as string.
 * @param {string} [name]
 *
 * @return the decoded value as per the schema.
 */
export declare function decodeKeyValue(valueContent: string, valueType: ERC725JSONSchemaValueType, value: any, name?: string): any;
/**
 * @param schema an array of schema definitions as per ${@link ERC725JSONSchema}
 * @param data an object of key-value pairs
 */
export declare function encodeData(data: EncodeDataInput | EncodeDataInput[], schema: ERC725JSONSchema[]): EncodeDataReturn;
export declare function getHashFunction(hashFunctionNameOrHash: string): {
    method: Function;
    name: import("./constants").SUPPORTED_HASH_FUNCTION_STRINGS;
    sig: SUPPORTED_HASH_FUNCTIONS;
};
export declare function hashData(data: string | Uint8Array | Record<string, any>, hashFunctionNameOrHash: SUPPORTED_HASH_FUNCTIONS): string;
/**
 * Hashes the data received with the specified hashing function,
 * and compares the result with the provided hash.
 */
export declare function isDataAuthentic(data: string | Uint8Array, expectedHash: string, lowerCaseHashFunction: SUPPORTED_HASH_FUNCTIONS): boolean;
/**
 * Transforms passed ipfsGateway url to correct format for fetching IPFS data
 *
 * @param ipfsGateway
 * @return {*}  string converted IPFS gateway URL
 */
export declare function convertIPFSGatewayUrl(ipfsGateway: string): string;
/**
 * Given a list of keys (dynamic or not) and a list of schemas with dynamic keys, it will
 * generate a "final"/non dynamic schemas list.
 */
export declare const generateSchemasFromDynamicKeys: (keyNames: Array<string | GetDataDynamicKey>, schemas: ERC725JSONSchema[]) => ERC725JSONSchema[];
/**
 * Changes the protocol from `ipfs://` to `http(s)://` and adds the selected IPFS gateway.
 * `ipfs://QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D => https://ipfs.lukso.network/ipfs/QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D`
 */
export declare function patchIPFSUrlsIfApplicable(receivedData: URLDataWithHash, ipfsGateway: string): URLDataWithHash;
