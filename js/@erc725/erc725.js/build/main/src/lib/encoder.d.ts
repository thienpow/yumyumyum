/**
 * @file lib/encoder.ts
 * @author Robert McLeod <@robertdavid010>
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @author Hugo Masclet <@Hugoo>
 * @author Callum Grindle <@CallumGrindle>
 * @date 2020
 */
import { JSONURLDataToEncode, URLDataWithHash } from '../types';
import { AssetURLEncode } from '../types/encodeData';
export declare const valueContentEncodingMap: (valueContent: string) => {
    type: string;
    encode: (value: number | string) => string;
    decode: (value: string) => number;
} | {
    type: string;
    encode: (value: AssetURLEncode) => string;
    decode: (value: string) => URLDataWithHash;
} | {
    type: string;
    encode: (dataToEncode: JSONURLDataToEncode) => string;
    decode: (dataToDecode: string) => URLDataWithHash;
} | {
    type: string;
    encode: (value: string) => string;
    decode: (value: string) => string | null;
};
export declare function encodeValueType(type: string, value: string | string[] | number | number[]): string;
export declare function decodeValueType(type: string, value: string): any;
export declare function encodeValueContent(valueContent: string, value: string | number | AssetURLEncode | JSONURLDataToEncode): string | false;
export declare function decodeValueContent(valueContent: string, value: string): string | URLDataWithHash | number | null;
