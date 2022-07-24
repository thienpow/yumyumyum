"use strict";
/*
    This file is part of @erc725/erc725.js.
    @erc725/erc725.js is free software: you can redistribute it and/or modify
    it under the terms of the GNU Lesser General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    @erc725/erc725.js is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Lesser General Public License for more details.
    You should have received a copy of the GNU Lesser General Public License
    along with @erc725/erc725.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file lib/encoder.ts
 * @author Robert McLeod <@robertdavid010>
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @author Hugo Masclet <@Hugoo>
 * @author Callum Grindle <@CallumGrindle>
 * @date 2020
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeValueContent = exports.encodeValueContent = exports.decodeValueType = exports.encodeValueType = exports.valueContentEncodingMap = void 0;
/*
  this handles encoding and decoding as per necessary for the erc725 schema specifications
*/
const web3_eth_abi_1 = __importDefault(require("web3-eth-abi"));
const web3_utils_1 = require("web3-utils");
const constants_1 = require("./constants");
const utils_1 = require("./utils");
const bytesNRegex = /Bytes(\d+)/;
const ALLOWED_BYTES_SIZES = [2, 4, 8, 16, 32, 64, 128, 256];
const encodeDataSourceWithHash = (hashType, dataHash, dataSource) => {
    const hashFunction = (0, utils_1.getHashFunction)(hashType);
    return ((0, web3_utils_1.keccak256)(hashFunction.name).slice(0, 10) +
        dataHash.slice(2) +
        (0, web3_utils_1.utf8ToHex)(dataSource).slice(2));
};
// TS can't get the types from the import...
// @ts-ignore
const abiCoder = web3_eth_abi_1.default;
const decodeDataSourceWithHash = (value) => {
    const hashFunctionSig = value.slice(0, 10);
    const hashFunction = (0, utils_1.getHashFunction)(hashFunctionSig);
    const encodedData = value.replace('0x', '').slice(8); // Rest of data string after function hash
    const dataHash = '0x' + encodedData.slice(0, 64); // Get jsonHash 32 bytes
    const dataSource = (0, web3_utils_1.hexToUtf8)('0x' + encodedData.slice(64)); // Get remainder as URI
    return { hashFunction: hashFunction.name, hash: dataHash, url: dataSource };
};
const valueTypeEncodingMap = {
    string: {
        encode: (value) => abiCoder.encodeParameter('string', value),
        decode: (value) => abiCoder.decodeParameter('string', value),
    },
    address: {
        encode: (value) => abiCoder.encodeParameter('address', value),
        decode: (value) => abiCoder.decodeParameter('address', value),
    },
    // NOTE: We could add conditional handling of numeric values here...
    uint256: {
        encode: (value) => abiCoder.encodeParameter('uint256', value),
        decode: (value) => abiCoder.decodeParameter('uint256', value),
    },
    bytes32: {
        encode: (value) => abiCoder.encodeParameter('bytes32', value),
        decode: (value) => abiCoder.decodeParameter('bytes32', value),
    },
    bytes4: {
        encode: (value) => abiCoder.encodeParameter('bytes4', value),
        decode: (value) => abiCoder.decodeParameter('bytes4', value),
    },
    bytes: {
        encode: (value) => abiCoder.encodeParameter('bytes', value),
        decode: (value) => abiCoder.decodeParameter('bytes', value),
    },
    'string[]': {
        encode: (value) => abiCoder.encodeParameter('string[]', value),
        decode: (value) => abiCoder.decodeParameter('string[]', value),
    },
    'address[]': {
        encode: (value) => abiCoder.encodeParameter('address[]', value),
        decode: (value) => abiCoder.decodeParameter('address[]', value),
    },
    'uint256[]': {
        encode: (value) => abiCoder.encodeParameter('uint256[]', value),
        decode: (value) => abiCoder.decodeParameter('uint256[]', value),
    },
    'bytes32[]': {
        encode: (value) => abiCoder.encodeParameter('bytes32[]', value),
        decode: (value) => abiCoder.decodeParameter('bytes32[]', value),
    },
    'bytes4[]': {
        encode: (value) => abiCoder.encodeParameter('bytes4[]', value),
        decode: (value) => abiCoder.decodeParameter('bytes4[]', value),
    },
    'bytes[]': {
        encode: (value) => abiCoder.encodeParameter('bytes[]', value),
        decode: (value) => abiCoder.decodeParameter('bytes[]', value),
    },
};
// Use enum for type bellow
// Is it this enum ERC725JSONSchemaValueType? (If so, custom is missing from enum)
const valueContentEncodingMap = (valueContent) => {
    const bytesNRegexMatch = valueContent.match(bytesNRegex);
    const bytesLength = bytesNRegexMatch ? parseInt(bytesNRegexMatch[1], 10) : '';
    switch (valueContent) {
        case 'Keccak256': {
            return {
                type: 'bytes32',
                encode: (value) => value,
                decode: (value) => value,
            };
        }
        // NOTE: Deprecated. For reference/testing in future
        case 'ArrayLength': {
            return {
                type: 'uint256',
                encode: (value) => (0, web3_utils_1.padLeft)((0, web3_utils_1.numberToHex)(value), 64),
                decode: (value) => (0, web3_utils_1.hexToNumber)(value),
            };
        }
        case 'Number': {
            return {
                type: 'uint256',
                // TODO: extra logic to handle and always return a string number
                encode: (value) => {
                    let parsedValue;
                    try {
                        parsedValue = parseInt(value, 10);
                    }
                    catch (error) {
                        throw new Error(error);
                    }
                    return (0, web3_utils_1.padLeft)((0, web3_utils_1.numberToHex)(parsedValue), 64);
                },
                decode: (value) => '' + (0, web3_utils_1.hexToNumber)(value),
            };
        }
        // NOTE: This is not symmetrical, and always returns a checksummed address
        case 'Address': {
            return {
                type: 'address',
                encode: (value) => {
                    if ((0, web3_utils_1.isAddress)(value)) {
                        return value.toLowerCase();
                    }
                    throw new Error('Address: "' + value + '" is an invalid address.');
                },
                decode: (value) => (0, web3_utils_1.toChecksumAddress)(value),
            };
        }
        case 'String': {
            return {
                type: 'string',
                encode: (value) => (0, web3_utils_1.utf8ToHex)(value),
                decode: (value) => (0, web3_utils_1.hexToUtf8)(value),
            };
        }
        case 'Markdown': {
            return {
                type: 'string',
                encode: (value) => (0, web3_utils_1.utf8ToHex)(value),
                decode: (value) => (0, web3_utils_1.hexToUtf8)(value),
            };
        }
        case 'URL': {
            return {
                type: 'string',
                encode: (value) => (0, web3_utils_1.utf8ToHex)(value),
                decode: (value) => (0, web3_utils_1.hexToUtf8)(value),
            };
        }
        case 'AssetURL': {
            return {
                type: 'custom',
                encode: (value) => encodeDataSourceWithHash(value.hashFunction, value.hash, value.url),
                decode: (value) => decodeDataSourceWithHash(value),
            };
        }
        // https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md#jsonurl
        case 'JSONURL': {
            return {
                type: 'custom',
                encode: (dataToEncode) => {
                    const { hash, json, hashFunction, url } = dataToEncode;
                    let hashedJson = hash;
                    if (json) {
                        if (hashFunction) {
                            throw new Error('When passing in the `json` property, we use "keccak256(utf8)" as a default hashingFunction. You do not need to set a `hashFunction`.');
                        }
                        hashedJson = (0, utils_1.hashData)(json, constants_1.SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8);
                    }
                    if (!hashedJson) {
                        throw new Error('You have to provide either the hash or the json via the respective properties');
                    }
                    return encodeDataSourceWithHash(hashFunction ||
                        constants_1.SUPPORTED_HASH_FUNCTION_STRINGS.KECCAK256_UTF8, hashedJson, url);
                },
                decode: (dataToDecode) => decodeDataSourceWithHash(dataToDecode),
            };
        }
        case `Bytes${bytesLength}`: {
            return {
                type: 'bytes',
                encode: (value) => {
                    if (typeof value !== 'string' || !(0, web3_utils_1.isHex)(value)) {
                        throw new Error(`Value: ${value} is not hex.`);
                    }
                    if (bytesLength && !ALLOWED_BYTES_SIZES.includes(bytesLength)) {
                        throw new Error(`Provided bytes length: ${bytesLength} for encoding valueContent: ${valueContent} is not valid.`);
                    }
                    if (bytesLength && value.length !== 2 + bytesLength * 2) {
                        throw new Error(`Value: ${value} is not of type ${valueContent}. Expected hex value of length ${2 + bytesLength * 2}`);
                    }
                    return value;
                },
                decode: (value) => {
                    if (typeof value !== 'string' || !(0, web3_utils_1.isHex)(value)) {
                        console.log(`Value: ${value} is not hex.`);
                        return null;
                    }
                    if (bytesLength && !ALLOWED_BYTES_SIZES.includes(bytesLength)) {
                        console.error(`Provided bytes length: ${bytesLength} for encoding valueContent: ${valueContent} is not valid.`);
                        return null;
                    }
                    if (bytesLength && value.length !== 2 + bytesLength * 2) {
                        console.error(`Value: ${value} is not of type ${valueContent}. Expected hex value of length ${2 + bytesLength * 2}`);
                        return null;
                    }
                    return value;
                },
            };
        }
        case 'BitArray': {
            return {
                type: 'bytes',
                encode: (value) => {
                    if (typeof value !== 'string' || !(0, web3_utils_1.isHex)(value)) {
                        throw new Error(`Value: ${value} is not hex.`);
                    }
                    return value;
                },
                decode: (value) => {
                    if (typeof value !== 'string' || !(0, web3_utils_1.isHex)(value)) {
                        console.error(`Value: ${value} is not hex.`);
                        return null;
                    }
                    return value;
                },
            };
        }
        default: {
            return {
                type: 'unknown',
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                encode: (_value) => {
                    throw new Error(`Could not encode unknown (${valueContent}) valueContent.`);
                },
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                decode: (_value) => {
                    throw new Error(`Could not decode unknown (${valueContent}) valueContent.`);
                },
            };
        }
    }
};
exports.valueContentEncodingMap = valueContentEncodingMap;
function encodeValueType(type, value) {
    if (!valueTypeEncodingMap[type]) {
        throw new Error('Could not encode valueType: "' + type + '".');
    }
    return value ? valueTypeEncodingMap[type].encode(value) : value;
}
exports.encodeValueType = encodeValueType;
function decodeValueType(type, value) {
    if (!valueTypeEncodingMap[type]) {
        throw new Error('Could not decode valueType: "' + type + '".');
    }
    if (value === '0x')
        return null;
    return value ? valueTypeEncodingMap[type].decode(value) : value;
}
exports.decodeValueType = decodeValueType;
function encodeValueContent(valueContent, value) {
    if (valueContent.slice(0, 2) === '0x') {
        return valueContent === value ? value : false;
    }
    const valueContentEncodingMethods = (0, exports.valueContentEncodingMap)(valueContent);
    if (!valueContentEncodingMethods) {
        throw new Error(`Could not encode valueContent: ${valueContent}.`);
    }
    if (!value) {
        return '0x';
    }
    if ((valueContent === 'AssetURL' || valueContent === 'JSONURL') &&
        typeof value === 'string') {
        throw new Error(`Could not encode valueContent: ${valueContent} with value: ${value}. Expected object.`);
    }
    return valueContentEncodingMethods.encode(value);
}
exports.encodeValueContent = encodeValueContent;
function decodeValueContent(valueContent, value) {
    if (valueContent.slice(0, 2) === '0x') {
        return valueContent === value ? value : null;
    }
    if (!value || value === '0x') {
        return null;
    }
    return (0, exports.valueContentEncodingMap)(valueContent).decode(value);
}
exports.decodeValueContent = decodeValueContent;
//# sourceMappingURL=encoder.js.map