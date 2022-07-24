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
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeData = exports.decodeKey = exports.decodeTupleKeyValue = exports.isValidTuple = exports.tupleValueTypesRegex = void 0;
/**
 * @file lib/decodeData.ts
 * @author Robert McLeod <@robertdavid010>
 * @author Hugo Masclet <@Hugoo>
 * @author Callum Grindle <@CallumGrindle>
 * @date 2020
 */
const web3_utils_1 = require("web3-utils");
const encodeKeyName_1 = require("./encodeKeyName");
const encoder_1 = require("./encoder");
const getSchemaElement_1 = require("./getSchemaElement");
const utils_1 = require("./utils");
exports.tupleValueTypesRegex = /bytes(\d+)/;
const isValidTuple = (valueType, valueContent) => {
    if (valueType.length <= 2 && valueContent.length <= 2) {
        return false;
    }
    if (valueType[0] !== '(' &&
        valueType[valueType.length - 1] !== ')' &&
        valueContent[0] !== '(' &&
        valueContent[valueContent.length - 1] !== ')') {
        return false;
    }
    // At this stage, we can assume the user is trying to use a tuple, let's throw errors instead of returning
    // false
    const valueTypeParts = valueType
        .substring(1, valueType.length - 1)
        .split(',');
    const valueContentParts = valueContent
        .substring(1, valueContent.length - 1)
        .split(',');
    const tuplesValidValueTypes = ['bytes4', 'bytes8', 'bytes16', 'bytes32'];
    if (valueTypeParts.length !== valueContentParts.length) {
        throw new Error(`Invalid tuple for valueType: ${valueType} / valueContent: ${valueContent}. They should have the same number of elements. Got: ${valueTypeParts.length} and ${valueContentParts.length}`);
    }
    for (let i = 0; i < valueTypeParts.length; i++) {
        if (!tuplesValidValueTypes.includes(valueTypeParts[i])) {
            throw new Error(`Invalid tuple for valueType: ${valueType} / valueContent: ${valueContent}. Type: ${valueTypeParts[i]} is not valid. Valid types are: ${tuplesValidValueTypes}`);
        }
        if (valueContentParts[i].substring(0, 5) === 'Bytes' &&
            valueContentParts[i].toLowerCase() !== valueTypeParts[i]) {
            throw new Error(`Invalid tuple for valueType: ${valueType} / valueContent: ${valueContent}. valueContent of type: ${valueContentParts[i]} should match valueType: ${valueTypeParts[i]}`);
        }
        if ((0, encoder_1.valueContentEncodingMap)(valueContentParts[i]).type === 'unknown' &&
            valueContentParts[i].slice(0, 5) !== 'Bytes' &&
            valueContentParts[i].slice(0, 2) !== '0x') {
            throw new Error(`Invalid tuple for valueType: ${valueType} / valueContent: ${valueContent}. valueContent of type: ${valueContentParts[i]} is not valid`);
        }
        if (valueContentParts[i].slice(0, 2) === '0x' &&
            !(0, web3_utils_1.isHex)(valueContentParts[i])) {
            throw new Error(`Invalid tuple for valueType: ${valueType} / valueContent: ${valueContent}. valueContent of type: ${valueContentParts[i]} is not a valid hex value`);
        }
        // TODO: check if length of 0x112233 is compatible with of bytesX
    }
    return true;
};
exports.isValidTuple = isValidTuple;
const decodeTupleKeyValue = (valueContent, // i.e. (bytes4,Number,bytes16)
valueType, // i.e. (bytes4,bytes8,bytes16)
value) => {
    // We assume data has already been validated at this stage
    const valueTypeParts = valueType
        .substring(1, valueType.length - 1)
        .split(',');
    const valueContentParts = valueContent
        .substring(1, valueContent.length - 1)
        .split(',');
    const bytesLengths = [];
    valueTypeParts.forEach((valueTypePart) => {
        const regexMatch = valueTypePart.match(exports.tupleValueTypesRegex);
        if (!regexMatch) {
            return;
        }
        bytesLengths.push(parseInt(regexMatch[1], 10));
    });
    const totalBytesLength = bytesLengths.reduce((acc, bytesLength) => acc + bytesLength, 0);
    if (value.length !== 2 + totalBytesLength * 2) {
        console.error(`Trying to decode a value: ${value} which does not match the length of the valueType: ${valueType}. Expected ${totalBytesLength} bytes.`);
        return [];
    }
    let cursor = 2; // to skip the 0x
    const valueParts = bytesLengths.map((bytesLength) => {
        const splitValue = value.substring(cursor, cursor + bytesLength * 2);
        cursor += bytesLength * 2;
        return `0x${splitValue}`;
    });
    return valueContentParts.map((valueContentPart, i) => (0, utils_1.decodeKeyValue)(valueContentPart, valueTypeParts[i], valueParts[i]));
};
exports.decodeTupleKeyValue = decodeTupleKeyValue;
/**
 *
 * @param schema is an object of a schema definitions.
 * @param value will be either key-value pairs for a key type of Array, or a single value for type Singleton.
 *
 * @return the decoded value/values as per the schema definition.
 */
function decodeKey(schema, value) {
    const lowerCaseKeyType = schema.keyType.toLowerCase();
    switch (lowerCaseKeyType) {
        case 'array': {
            const results = [];
            // If user has requested a key which does not exist in the contract, value will be: 0x and value.find() will fail.
            if (!value || typeof value === 'string') {
                return results;
            }
            const valueElement = value.find((e) => e.key === schema.key);
            // Handle empty/non-existent array
            if (!valueElement) {
                return results;
            }
            const arrayLength = (0, utils_1.decodeKeyValue)('Number', 'uint256', valueElement.value, schema.name) ||
                0;
            // This will not run if no match or arrayLength
            for (let index = 0; index < arrayLength; index++) {
                const dataElement = value.find((e) => e.key === (0, utils_1.encodeArrayKey)(schema.key, index));
                if (dataElement) {
                    results.push((0, utils_1.decodeKeyValue)(schema.valueContent, schema.valueType, dataElement.value, schema.name));
                }
            } // end for loop
            return results;
        }
        case 'mappingwithgrouping':
        case 'singleton':
        case 'mapping': {
            if (Array.isArray(value)) {
                const newValue = value.find((e) => e.key === schema.key);
                // Handle empty or non-values
                if (!newValue) {
                    return null;
                }
                return (0, utils_1.decodeKeyValue)(schema.valueContent, schema.valueType, newValue.value, schema.name);
            }
            if ((0, exports.isValidTuple)(schema.valueType, schema.valueContent)) {
                return (0, exports.decodeTupleKeyValue)(schema.valueContent, schema.valueType, value);
            }
            return (0, utils_1.decodeKeyValue)(schema.valueContent, schema.valueType, value, schema.name);
        }
        default: {
            console.error('Incorrect data match or keyType in schema from decodeKey(): "' +
                schema.keyType +
                '"');
            return null;
        }
    }
}
exports.decodeKey = decodeKey;
function decodeData(data, schema) {
    const processDataInput = ({ keyName, dynamicKeyParts, value, }) => {
        const isDynamic = (0, encodeKeyName_1.isDynamicKeyName)(keyName);
        let schemaElement;
        if (isDynamic) {
            schemaElement = (0, getSchemaElement_1.getSchemaElement)(schema, keyName, dynamicKeyParts);
            // NOTE: it might be confusing to use as the output will contain other keys as the ones used
            // for the input
            return {
                key: schemaElement.key,
                name: schemaElement.name,
                value: decodeKey(schemaElement, value),
            };
        }
        schemaElement = (0, getSchemaElement_1.getSchemaElement)(schema, keyName);
        return {
            key: schemaElement.key,
            name: schemaElement.name,
            value: decodeKey(schemaElement, value),
        };
    };
    if (Array.isArray(data)) {
        return data.map((dataInput) => processDataInput(dataInput));
    }
    return processDataInput(data);
}
exports.decodeData = decodeData;
//# sourceMappingURL=decodeData.js.map