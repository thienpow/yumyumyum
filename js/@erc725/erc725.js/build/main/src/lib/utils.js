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
    along with web3.js.  If not, see <http://www.gnu.org/licenses/>.
*/
/**
 * @file lib/utils.ts
 * @author Robert McLeod <@robertdavid010>
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @author Hugo Masclet <@Hugoo>
 * @date 2020
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.patchIPFSUrlsIfApplicable = exports.generateSchemasFromDynamicKeys = exports.convertIPFSGatewayUrl = exports.isDataAuthentic = exports.hashData = exports.getHashFunction = exports.encodeData = exports.decodeKeyValue = exports.encodeKey = exports.encodeTupleKeyValue = exports.guessKeyTypeFromKeyName = exports.encodeArrayKey = exports.encodeKeyValue = void 0;
const web3_utils_1 = require("web3-utils");
const ethereumjs_util_1 = require("ethereumjs-util");
const constants_1 = require("./constants");
const encoder_1 = require("./encoder");
const encodeKeyName_1 = require("./encodeKeyName");
const getSchemaElement_1 = require("./getSchemaElement");
const decodeData_1 = require("./decodeData");
/**
 *
 * @param {string} valueContent as per ERC725Schema definition
 * @param {string} valueType as per ERC725Schema definition
 * @param decodedValue can contain single value, an array, or an object as required by schema (JSONURL, or ASSETURL)
 * @param {string} [name]
 *
 * @return the encoded value as per the schema
 */
function encodeKeyValue(valueContent, valueType, decodedValue, name) {
    const isSupportedValueContent = !!(0, encoder_1.valueContentEncodingMap)(valueContent) || valueContent.slice(0, 2) === '0x';
    if (!isSupportedValueContent) {
        throw new Error(`The valueContent '${valueContent}' 
            for ${name} is not supported.`);
    }
    const isValueTypeArray = valueType.slice(valueType.length - 2) === '[]';
    if (!isValueTypeArray && !Array.isArray(decodedValue)) {
        // Straight forward encode
        return (0, encoder_1.encodeValueContent)(valueContent, decodedValue);
    }
    const valueContentEncodingMethods = (0, encoder_1.valueContentEncodingMap)(valueContent);
    const isSameEncoding = valueContentEncodingMethods &&
        valueContentEncodingMethods.type === valueType.split('[]')[0];
    let result;
    // We only loop if the valueType done by abi.encodeParameter can not handle it directly
    if (Array.isArray(decodedValue)) {
        // value type encoding will handle it?
        // we handle an array element encoding
        const results = [];
        for (let index = 0; index < decodedValue.length; index++) {
            const element = decodedValue[index];
            results.push((0, encoder_1.encodeValueContent)(valueContent, element));
        }
        result = results;
    }
    if (
    // and we only skip bytes regardless
    valueType !== 'bytes' &&
        // Requires encoding because !sameEncoding means both encodings are required
        !isSameEncoding) {
        result = (0, encoder_1.encodeValueType)(valueType, result);
    }
    else if (isValueTypeArray && isSameEncoding) {
        result = (0, encoder_1.encodeValueType)(valueType, decodedValue);
    }
    return result;
}
exports.encodeKeyValue = encodeKeyValue;
/**
 *
 * @param key The schema key of a schema with keyType = 'Array'
 * @param index An integer representing the intended array index
 * @return The raw bytes key for the array element
 */
function encodeArrayKey(key, index) {
    return key.slice(0, 34) + (0, web3_utils_1.padLeft)((0, web3_utils_1.numberToHex)(index), 32).replace('0x', '');
}
exports.encodeArrayKey = encodeArrayKey;
/**
 *
 * @param keyName the schema key name
 * @returns a guess of the schema key type
 */
function guessKeyTypeFromKeyName(keyName) {
    // This function could not work with subsequents keys of an Array
    // It will always assume the given key, if array, is the initial array key.
    const splittedKeyName = keyName.split(':');
    if (splittedKeyName.length === 3) {
        return 'MappingWithGrouping';
    }
    if (splittedKeyName.length === 2) {
        return 'Mapping';
    }
    if (keyName.substring(keyName.length - 2, keyName.length) === '[]') {
        return 'Array';
    }
    return 'Singleton';
}
exports.guessKeyTypeFromKeyName = guessKeyTypeFromKeyName;
const encodeTupleKeyValue = (valueContent, // i.e. (bytes4,Number,bytes16)
valueType, // i.e. (bytes4,bytes8,bytes16)
decodedValues) => {
    // We assume data has already been validated at this stage
    const valueTypeParts = valueType
        .substring(1, valueType.length - 1)
        .split(',');
    const valueContentParts = valueContent
        .substring(1, valueContent.length - 1)
        .split(',');
    if (valueTypeParts.length !== decodedValues.length) {
        throw new Error(`Can not encode tuple key value: ${decodedValues}. Expecte array of length: ${valueTypeParts.length}`);
    }
    const returnValue = `0x` +
        valueContentParts
            .map((valueContentPart, i) => {
            const encodedKeyValue = encodeKeyValue(valueContentPart, valueTypeParts[i], decodedValues[i]);
            if (!encodedKeyValue) {
                return ''; // may cause issues?
            }
            const numberOfBytes = parseInt(valueTypeParts[i].substring(5), 10); // bytes50 -> 50
            // If the encoded value is too large for the expected valueType, we shrink it from the left
            // i.e. number are encoded on 32bytes
            // TODO: might be missing cases !
            if (encodedKeyValue.length > 2 + numberOfBytes * 2) {
                return encodedKeyValue.slice(encodedKeyValue.length - numberOfBytes * 2);
            }
            return (0, web3_utils_1.padLeft)(encodedKeyValue, numberOfBytes * 2).replace('0x', '');
        })
            .join('');
    return returnValue;
};
exports.encodeTupleKeyValue = encodeTupleKeyValue;
/**
 *
 * @param schema is an object of a schema definitions.
 * @param value will be either key-value pairs for a key type of Array, or a single value for type Singleton.
 *
 * @return the encoded value for the key as per the supplied schema.
 */
function encodeKey(schema, value) {
    // NOTE: This will not guarantee order of array as on chain. Assumes developer must set correct order
    const lowerCaseKeyType = schema.keyType.toLowerCase();
    switch (lowerCaseKeyType) {
        case 'array': {
            if (!Array.isArray(value)) {
                console.error("Can't encode a non array for key of type array");
                return null;
            }
            const results = [];
            for (let index = 0; index < value.length; index++) {
                const dataElement = value[index];
                if (index === 0) {
                    // This is arrayLength as the first element in the raw array
                    results.push({
                        key: schema.key,
                        value: encodeKeyValue('Number', 'uint256', value.length.toString(), schema.name),
                    });
                }
                results.push({
                    key: encodeArrayKey(schema.key, index),
                    value: encodeKeyValue(schema.valueContent, schema.valueType, dataElement, schema.name),
                });
            }
            return results;
        }
        case 'mappingwithgrouping':
        case 'singleton':
        case 'mapping':
            if ((0, decodeData_1.isValidTuple)(schema.valueType, schema.valueContent)) {
                if (!Array.isArray(value)) {
                    throw new Error(`Incorrect value for tuple. Got: ${value}, expected array.`);
                }
                return (0, exports.encodeTupleKeyValue)(schema.valueContent, schema.valueType, value);
            }
            return encodeKeyValue(schema.valueContent, schema.valueType, value, schema.name);
        default:
            console.error('Incorrect data match or keyType in schema from encodeKey(): "' +
                schema.keyType +
                '"');
            return null;
    }
}
exports.encodeKey = encodeKey;
/**
 *
 * @param {string} valueContent as per ERC725Schema definition.
 * @param {string} valueType as per ERC725Schema definition.
 * @param {string} value the encoded value as string.
 * @param {string} [name]
 *
 * @return the decoded value as per the schema.
 */
function decodeKeyValue(valueContent, valueType, value, name) {
    // Check for the missing map.
    const valueContentEncodingMethods = (0, encoder_1.valueContentEncodingMap)(valueContent);
    if (!valueContentEncodingMethods && valueContent.slice(0, 2) !== '0x') {
        throw new Error('The valueContent "' +
            valueContent +
            '" for "' +
            name +
            '" is not supported.');
    }
    let sameEncoding = valueContentEncodingMethods &&
        valueContentEncodingMethods.type === valueType.split('[]')[0];
    const isArray = valueType.substring(valueType.length - 2) === '[]';
    // VALUE TYPE
    const valueTypeIsBytesNonArray = valueType.slice(0, 5) === 'bytes' && valueType.slice(-2) !== '[]';
    if (!valueTypeIsBytesNonArray &&
        valueType !== 'string' &&
        !(0, web3_utils_1.isAddress)(value) // checks for addresses, since technically an address is bytes?
    ) {
        // eslint-disable-next-line no-param-reassign
        value = (0, encoder_1.decodeValueType)(valueType, value);
    }
    // As per exception above, if address and sameEncoding, then the address still needs to be handled
    if (sameEncoding && (0, web3_utils_1.isAddress)(value) && !(0, web3_utils_1.checkAddressChecksum)(value)) {
        sameEncoding = !sameEncoding;
    }
    if (sameEncoding && valueType !== 'string') {
        return value;
    }
    // VALUE CONTENT
    // We are finished if duplicated encoding methods
    if (isArray && Array.isArray(value)) {
        // value must be an array also
        const results = [];
        for (let index = 0; index < value.length; index++) {
            const element = value[index];
            results.push((0, encoder_1.decodeValueContent)(valueContent, element));
        }
        return results;
    }
    return (0, encoder_1.decodeValueContent)(valueContent, value);
}
exports.decodeKeyValue = decodeKeyValue;
/**
 * @param schema an array of schema definitions as per ${@link ERC725JSONSchema}
 * @param data an object of key-value pairs
 */
function encodeData(data, schema) {
    const dataAsArray = Array.isArray(data) ? data : [data];
    return dataAsArray.reduce((accumulator, { keyName, value, dynamicKeyParts }) => {
        let schemaElement = null;
        let encodedValue; // would be nice to type this
        // Switch between non dynamic and dynamic keys:
        if ((0, encodeKeyName_1.isDynamicKeyName)(keyName)) {
            // In case of a dynamic key, we need to check if the value is of type DynamicKeyPartIntput.
            if (!dynamicKeyParts) {
                throw new Error(`Can't encodeData for dynamic key: ${keyName} with non dynamic values. Got: ${value}, expected object.`);
            }
            schemaElement = (0, getSchemaElement_1.getSchemaElement)(schema, keyName, dynamicKeyParts);
            encodedValue = encodeKey(schemaElement, value);
        }
        else {
            schemaElement = (0, getSchemaElement_1.getSchemaElement)(schema, keyName);
            encodedValue = encodeKey(schemaElement, value);
        }
        if (typeof encodedValue === 'string') {
            accumulator.keys.push(schemaElement.key);
            accumulator.values.push(encodedValue);
        }
        else if (encodedValue !== false && encodedValue !== null) {
            encodedValue.forEach((keyValuePair) => {
                accumulator.keys.push(keyValuePair.key);
                accumulator.values.push(keyValuePair.value);
            });
        }
        return accumulator;
    }, { keys: [], values: [] });
}
exports.encodeData = encodeData;
function getHashFunction(hashFunctionNameOrHash) {
    const hashFunction = constants_1.HASH_FUNCTIONS[hashFunctionNameOrHash];
    if (!hashFunction) {
        throw new Error(`Chosen hashFunction '${hashFunctionNameOrHash}' is not supported. Supported hashFunctions: ${constants_1.SUPPORTED_HASH_FUNCTIONS_LIST}`);
    }
    return hashFunction;
}
exports.getHashFunction = getHashFunction;
function hashData(data, hashFunctionNameOrHash) {
    const hashFunction = getHashFunction(hashFunctionNameOrHash);
    return hashFunction.method(data);
}
exports.hashData = hashData;
/**
 * Hashes the data received with the specified hashing function,
 * and compares the result with the provided hash.
 */
function isDataAuthentic(data, expectedHash, lowerCaseHashFunction) {
    let dataHash;
    if (data instanceof Uint8Array) {
        dataHash = hashData((0, ethereumjs_util_1.arrToBufArr)(data), lowerCaseHashFunction);
    }
    else {
        dataHash = hashData(data, lowerCaseHashFunction);
    }
    if (dataHash !== expectedHash) {
        console.error(`Hash mismatch, returned JSON hash ("${dataHash}") is different from expected hash: "${expectedHash}"`);
        return false;
    }
    return true;
}
exports.isDataAuthentic = isDataAuthentic;
/**
 * Transforms passed ipfsGateway url to correct format for fetching IPFS data
 *
 * @param ipfsGateway
 * @return {*}  string converted IPFS gateway URL
 */
function convertIPFSGatewayUrl(ipfsGateway) {
    let convertedIPFSGateway = ipfsGateway;
    if (ipfsGateway.endsWith('/') && !ipfsGateway.endsWith('/ipfs/')) {
        convertedIPFSGateway = ipfsGateway + 'ipfs/';
    }
    else if (ipfsGateway.endsWith('/ipfs')) {
        convertedIPFSGateway = ipfsGateway + '/';
    }
    else if (!ipfsGateway.endsWith('/ipfs/')) {
        convertedIPFSGateway = ipfsGateway + '/ipfs/';
    }
    return convertedIPFSGateway;
}
exports.convertIPFSGatewayUrl = convertIPFSGatewayUrl;
/**
 * Given a list of keys (dynamic or not) and a list of schemas with dynamic keys, it will
 * generate a "final"/non dynamic schemas list.
 */
const generateSchemasFromDynamicKeys = (keyNames, schemas) => {
    return keyNames.map((keyName) => {
        if (typeof keyName === 'string') {
            return (0, getSchemaElement_1.getSchemaElement)(schemas, keyName);
        }
        return (0, getSchemaElement_1.getSchemaElement)(schemas, keyName.keyName, keyName.dynamicKeyParts);
    });
};
exports.generateSchemasFromDynamicKeys = generateSchemasFromDynamicKeys;
/**
 * Changes the protocol from `ipfs://` to `http(s)://` and adds the selected IPFS gateway.
 * `ipfs://QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D => https://ipfs.lukso.network/ipfs/QmbKvCVEePiDKxuouyty9bMsWBAxZDGr2jhxd4pLGLx95D`
 */
function patchIPFSUrlsIfApplicable(receivedData, ipfsGateway) {
    if (receivedData &&
        receivedData.url &&
        receivedData.url.indexOf('ipfs://') !== -1) {
        return Object.assign(Object.assign({}, receivedData), { url: receivedData.url.replace('ipfs://', ipfsGateway) });
    }
    return receivedData;
}
exports.patchIPFSUrlsIfApplicable = patchIPFSUrlsIfApplicable;
//# sourceMappingURL=utils.js.map