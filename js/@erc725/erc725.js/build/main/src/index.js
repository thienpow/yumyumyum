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
exports.ERC725 = exports.encodeData = void 0;
/**
 * @file index.ts
 * @author Robert McLeod <@robertdavid010>
 * @author Fabian Vogelsteller <fabian@lukso.network>
 * @author Hugo Masclet <@Hugoo>
 * @date 2020
 */
const web3_utils_1 = require("web3-utils");
const web3ProviderWrapper_1 = require("./providers/web3ProviderWrapper");
const ethereumProviderWrapper_1 = require("./providers/ethereumProviderWrapper");
const utils_1 = require("./lib/utils");
const schemaParser_1 = require("./lib/schemaParser");
const isValidSignature_1 = require("./lib/isValidSignature");
const constants_1 = require("./lib/constants");
const encodeKeyName_1 = require("./lib/encodeKeyName");
const decodeData_1 = require("./lib/decodeData");
const getDataFromExternalSources_1 = require("./lib/getDataFromExternalSources");
var utils_2 = require("./lib/utils");
Object.defineProperty(exports, "encodeData", { enumerable: true, get: function () { return utils_2.encodeData; } });
/**
 * This package is currently in early stages of development, <br/>use only for testing or experimentation purposes.<br/>
 *
 * @typeParam Schema
 *
 */
class ERC725 {
    /**
     * Creates an instance of ERC725.
     * @param {ERC725JSONSchema[]} schema More information available here: [LSP-2-ERC725YJSONSchema](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md)
     * @param {string} address Address of the ERC725 contract you want to interact with
     * @param {any} provider
     * @param {ERC725Config} config Configuration object.
     *
     */
    constructor(schemas, address, provider, config) {
        // NOTE: provider param can be either the provider, or and object with {provider:xxx ,type:xxx}
        // TODO: Add check for schema format?
        if (!schemas) {
            throw new Error('Missing schema.');
        }
        const defaultConfig = {
            ipfsGateway: 'https://cloudflare-ipfs.com/ipfs/',
        };
        this.options = {
            schemas: this.validateSchemas(schemas),
            address,
            provider: this.initializeProvider(provider),
            ipfsGateway: (config === null || config === void 0 ? void 0 : config.ipfsGateway)
                ? (0, utils_1.convertIPFSGatewayUrl)(config === null || config === void 0 ? void 0 : config.ipfsGateway)
                : defaultConfig.ipfsGateway,
        };
    }
    /**
     * To prevent weird behovior from the lib, we must make sure all the schemas are correct before loading them.
     *
     * @param schemas
     * @returns
     */
    // eslint-disable-next-line class-methods-use-this
    validateSchemas(schemas) {
        return schemas.filter((schema) => {
            try {
                const encodedKeyName = (0, encodeKeyName_1.encodeKeyName)(schema.name);
                const isKeyValid = schema.key === encodedKeyName;
                if (!isKeyValid) {
                    console.log(`The schema with keyName: ${schema.key} is skipped because its key hash does not match its key name (expected: ${encodedKeyName}, got: ${schema.key}).`);
                }
                return isKeyValid;
            }
            catch (err) {
                // We could not encodeKeyName, probably because the key is dynamic (Mapping or MappingWithGrouping).
                // TODO: make sure the dynamic key name is valid:
                // - has max 2 variables
                // - variables are correct (<string>, <bool>, etc.)
                // Keeping dynamic keys may be an issue for getData / fetchData functions.
                return true;
            }
        });
    }
    // eslint-disable-next-line class-methods-use-this
    initializeProvider(providerOrProviderWrapper) {
        // do not fail on no-provider
        if (!providerOrProviderWrapper)
            return undefined;
        if (typeof providerOrProviderWrapper.request === 'function')
            return new ethereumProviderWrapper_1.EthereumProviderWrapper(providerOrProviderWrapper);
        if (!providerOrProviderWrapper.request &&
            typeof providerOrProviderWrapper.send === 'function')
            return new web3ProviderWrapper_1.Web3ProviderWrapper(providerOrProviderWrapper);
        throw new Error(`Incorrect or unsupported provider ${providerOrProviderWrapper}`);
    }
    async getData(keyOrKeys) {
        this.getAddressAndProvider();
        if (!keyOrKeys) {
            // eslint-disable-next-line no-param-reassign
            keyOrKeys = this.options.schemas
                .map((element) => element.name)
                .filter((key) => !(0, encodeKeyName_1.isDynamicKeyName)(key));
        }
        if (Array.isArray(keyOrKeys)) {
            return this.getDataMultiple(keyOrKeys);
        }
        const data = await this.getDataMultiple([keyOrKeys]);
        return data[0];
    }
    async fetchData(keyOrKeys) {
        let keyNames;
        if (Array.isArray(keyOrKeys)) {
            keyNames = keyOrKeys;
        }
        else if (!keyOrKeys) {
            keyNames = this.options.schemas
                .map((element) => element.name)
                .filter((key) => !(0, encodeKeyName_1.isDynamicKeyName)(key));
        }
        else {
            keyNames = [keyOrKeys];
        }
        const dataFromChain = await this.getData(keyNames);
        // NOTE: this step is executed in getData function above
        // We can optimize by computing it only once.
        const schemas = (0, utils_1.generateSchemasFromDynamicKeys)(keyNames, this.options.schemas);
        const dataFromExternalSources = await (0, getDataFromExternalSources_1.getDataFromExternalSources)(schemas, dataFromChain, this.options.ipfsGateway);
        if (keyOrKeys &&
            !Array.isArray(keyOrKeys) &&
            dataFromExternalSources.length > 0) {
            return dataFromExternalSources[0];
        }
        return dataFromExternalSources;
    }
    getSchema(keyOrKeys, providedSchemas) {
        return (0, schemaParser_1.getSchema)(keyOrKeys, this.options.schemas.concat(providedSchemas || []));
    }
    /**
     * To be able to store your data on the blockchain, you need to encode it according to your {@link ERC725JSONSchema}.
     *
     * @param {{ [key: string]: any }} data An object with one or many properties, containing the data that needs to be encoded.
     * @param schemas Additionnal ERC725JSONSchemas which will be concatenated with the schemas provided on init.
     *
     * @returns An object with hashed keys and encoded values.
     *
     * When encoding JSON it is possible to pass in the JSON object and the URL where it is available publicly.
     * The JSON will be hashed with `keccak256`.
     */
    encodeData(data, schemas) {
        return (0, utils_1.encodeData)(data, Array.prototype.concat(this.options.schemas, schemas));
    }
    /**
     * To be able to store your data on the blockchain, you need to encode it according to your {@link ERC725JSONSchema}.
     *
     * @param {{ [key: string]: any }} data An object with one or many properties, containing the data that needs to be encoded.
     * @param schemas ERC725JSONSchemas which will be used to encode the keys.
     *
     * @returns An object with hashed keys and encoded values.
     *
     * When encoding JSON it is possible to pass in the JSON object and the URL where it is available publicly.
     * The JSON will be hashed with `keccak256`.
     */
    static encodeData(data, schemas) {
        return (0, utils_1.encodeData)(data, schemas);
    }
    /**
     * In case you are reading the key-value store from an ERC725 smart-contract key-value store
     * without `@erc725/erc725.js` you can use `decodeData` to do the decoding for you.
     *
     * It is more convenient to use {@link ERC725.fetchData | `fetchData`}.
     * It does the `decoding` and `fetching` of external references for you automatically.
     *
     * @param {{ [key: string]: any }} data An object with one or many properties.
     * @param schemas ERC725JSONSchemas which will be used to encode the keys.
     *
     * @returns Returns decoded data as defined and expected in the schema:
     */
    decodeData(data, schemas) {
        return (0, decodeData_1.decodeData)(data, Array.prototype.concat(this.options.schemas, schemas));
    }
    /**
     * In case you are reading the key-value store from an ERC725 smart-contract key-value store
     * without `@erc725/erc725.js` you can use `decodeData` to do the decoding for you.
     *
     * It is more convenient to use {@link ERC725.fetchData | `fetchData`}.
     * It does the `decoding` and `fetching` of external references for you automatically.
     *
     * @param {{ [key: string]: any }} data An object with one or many properties.
     * @param schemas ERC725JSONSchemas which will be used to encode the keys.
     *
     * @returns Returns decoded data as defined and expected in the schema:
     */
    static decodeData(data, schemas) {
        return (0, decodeData_1.decodeData)(data, schemas);
    }
    /**
     * An added utility method which simply returns the owner of the contract.
     * Not directly related to ERC725 specifications.
     *
     * @param {string} [address]
     * @returns The address of the contract owner as stored in the contract.
     *
     *    This method is not yet supported when using the `graph` provider type.
     *
     * ```javascript title="Example"
     * await myERC725.getOwner();
     * // '0x94933413384997F9402cc07a650e8A34d60F437A'
     *
     * await myERC725.getOwner("0x3000783905Cc7170cCCe49a4112Deda952DDBe24");
     * // '0x7f1b797b2Ba023Da2482654b50724e92EB5a7091'
     * ```
     */
    async getOwner(_address) {
        const { address, provider } = this.getAddressAndProvider();
        return provider.getOwner(_address || address);
    }
    /**
     * A helper function which checks if a signature is valid according to the EIP-1271 standard.
     *
     * @param messageOrHash if it is a 66 chars string with 0x prefix, it will be considered as a hash (keccak256). If not, the message will be wrapped as follows: "\x19Ethereum Signed Message:\n" + message.length + message and hashed.
     * @param signature
     * @returns true if isValidSignature call on the contract returns the magic value. false otherwise
     */
    async isValidSignature(messageOrHash, signature) {
        if (!this.options.address || !(0, web3_utils_1.isAddress)(this.options.address)) {
            throw new Error('Missing ERC725 contract address.');
        }
        if (!this.options.provider) {
            throw new Error('Missing provider.');
        }
        return (0, isValidSignature_1.isValidSignature)(messageOrHash, signature, this.options.address, this.options.provider);
    }
    /**
     * @internal
     * @param schema associated with the schema with keyType = 'Array'
     *               the data includes the raw (encoded) length key-value pair for the array
     * @param data array of key-value pairs, one of which is the length key for the schema array
     *             Data can hold other field data not relevant here, and will be ignored
     * @return an array of keys/values
     */
    async getArrayValues(schema, data) {
        var _a;
        if (schema.keyType !== 'Array') {
            throw new Error(`The "getArrayValues" method requires a schema definition with "keyType: Array",
         ${schema}`);
        }
        const results = [];
        // 1. get the array length
        const value = data[schema.key]; // get the length key/value pair
        if (!value || !value.value) {
            return results;
        } // Handle empty/non-existent array
        const arrayLength = await (0, utils_1.decodeKeyValue)('Number', 'uint256', value.value, schema.name); // get the int array length
        const arrayElementKeys = [];
        for (let index = 0; index < arrayLength; index++) {
            const arrayElementKey = (0, utils_1.encodeArrayKey)(schema.key, index);
            if (!data[arrayElementKey]) {
                arrayElementKeys.push(arrayElementKey);
            }
        }
        try {
            const arrayElements = await ((_a = this.options.provider) === null || _a === void 0 ? void 0 : _a.getAllData(this.options.address, arrayElementKeys));
            results.push(...arrayElements);
        }
        catch (err) {
            // This case may happen if user requests an array key which does not exist in the contract.
            // In this case, we simply skip
        }
        return results;
    }
    async getDataMultiple(keyNames) {
        var _a;
        const schemas = (0, utils_1.generateSchemasFromDynamicKeys)(keyNames, this.options.schemas);
        // Get all the raw data from the provider based on schema key hashes
        const allRawData = await ((_a = this.options.provider) === null || _a === void 0 ? void 0 : _a.getAllData(this.options.address, schemas.map((schema) => schema.key)));
        const keyValueMap = allRawData.reduce((accumulator, current) => {
            accumulator[current.key] = current.value;
            return accumulator;
        }, {});
        const schemasWithValue = schemas.map((schema) => {
            return Object.assign(Object.assign({}, schema), { value: keyValueMap[schema.key] || null });
        });
        // ------- BEGIN ARRAY HANDLER -------
        // Get missing 'Array' fields for all arrays, as necessary
        const arraySchemas = schemas.filter((e) => e.keyType.toLowerCase() === 'array');
        // Looks like it gets array even if not requested as it gets the arrays from the this.options.schemas?
        // eslint-disable-next-line no-restricted-syntax
        for (const keySchema of arraySchemas) {
            const dataKeyValue = {
                [keySchema.key]: {
                    key: keySchema.key,
                    value: keyValueMap[keySchema.key],
                },
            };
            const arrayValues = await this.getArrayValues(keySchema, dataKeyValue);
            if (arrayValues && arrayValues.length > 0) {
                arrayValues.push(dataKeyValue[keySchema.key]); // add the raw data array length
                schemasWithValue[schemasWithValue.findIndex((schema) => schema.key === keySchema.key)] = Object.assign(Object.assign({}, keySchema), { value: arrayValues });
            }
        }
        // ------- END ARRAY HANDLER -------
        return (0, decodeData_1.decodeData)(schemasWithValue.map(({ key, value }) => {
            return {
                keyName: key,
                value,
                // no need to add dynamic key parts here as the schemas object below already holds the "generated" schemas for the dynamic keys
            };
        }), schemas);
    }
    getAddressAndProvider() {
        if (!this.options.address || !(0, web3_utils_1.isAddress)(this.options.address)) {
            throw new Error('Missing ERC725 contract address.');
        }
        if (!this.options.provider) {
            throw new Error('Missing provider.');
        }
        return {
            address: this.options.address,
            provider: this.options.provider,
        };
    }
    /**
     * Encode permissions into a hexadecimal string as defined by the LSP6 KeyManager Standard.
     *
     * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
     * @param permissions The permissions you want to specify to be included or excluded. Any ommitted permissions will default to false.
     * @returns {*} The permissions encoded as a hexadecimal string as defined by the LSP6 Standard.
     */
    static encodePermissions(permissions) {
        const result = Object.keys(permissions).reduce((previous, key) => {
            return permissions[key]
                ? previous + (0, web3_utils_1.hexToNumber)(constants_1.LSP6_DEFAULT_PERMISSIONS[key])
                : previous;
        }, 0);
        return (0, web3_utils_1.leftPad)((0, web3_utils_1.toHex)(result), 64);
    }
    /**
     * Encode permissions into a hexadecimal string as defined by the LSP6 KeyManager Standard.
     *
     * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
     * @param permissions The permissions you want to specify to be included or excluded. Any ommitted permissions will default to false.
     * @returns {*} The permissions encoded as a hexadecimal string as defined by the LSP6 Standard.
     */
    encodePermissions(permissions) {
        return ERC725.encodePermissions(permissions);
    }
    /**
     * Decodes permissions from hexadecimal as defined by the LSP6 KeyManager Standard.
     *
     * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
     * @param permissionHex The permission hexadecimal value to be decoded.
     * @returns Object specifying whether default LSP6 permissions are included in provided hexademical string.
     */
    static decodePermissions(permissionHex) {
        const result = {
            CHANGEOWNER: false,
            CHANGEPERMISSIONS: false,
            ADDPERMISSIONS: false,
            SETDATA: false,
            CALL: false,
            STATICCALL: false,
            DELEGATECALL: false,
            DEPLOY: false,
            TRANSFERVALUE: false,
            SIGN: false,
            SUPER_SETDATA: false,
            SUPER_TRANSFERVALUE: false,
            SUPER_CALL: false,
            SUPER_STATICCALL: false,
            SUPER_DELEGATECALL: false,
        };
        const permissionsToTest = Object.keys(constants_1.LSP6_DEFAULT_PERMISSIONS);
        if (permissionHex === constants_1.LSP6_ALL_PERMISSIONS) {
            permissionsToTest.forEach((testPermission) => {
                result[testPermission] = true;
            });
            return result;
        }
        const passedPermissionDecimal = (0, web3_utils_1.hexToNumber)(permissionHex);
        permissionsToTest.forEach((testPermission) => {
            const decimalTestPermission = (0, web3_utils_1.hexToNumber)(constants_1.LSP6_DEFAULT_PERMISSIONS[testPermission]);
            const isPermissionIncluded = (passedPermissionDecimal & decimalTestPermission) ===
                decimalTestPermission;
            result[testPermission] = isPermissionIncluded;
        });
        return result;
    }
    /**
     * Decodes permissions from hexadecimal as defined by the LSP6 KeyManager Standard.
     *
     * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-6-KeyManager.md LSP6 KeyManager Standard.
     * @param permissionHex The permission hexadecimal value to be decoded.
     * @returns Object specifying whether default LSP6 permissions are included in provided hexademical string.
     */
    decodePermissions(permissionHex) {
        return ERC725.decodePermissions(permissionHex);
    }
    /**
     * Hashes a key name for use on an ERC725Y contract according to LSP2 ERC725Y JSONSchema standard.
     *
     * @param {string} keyName The key name you want to encode.
     * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md ERC725YJsonSchema standard.
     * @returns {string} The keccak256 hash of the provided key name. This is the key that must be retrievable from the ERC725Y contract via ERC725Y.getData(bytes32 key).
     */
    static encodeKeyName(keyName) {
        return (0, encodeKeyName_1.encodeKeyName)(keyName);
    }
    /**
     * Hashes a key name for use on an ERC725Y contract according to LSP2 ERC725Y JSONSchema standard.
     *
     * @param {string} keyName The key name you want to encode.
     * @link https://github.com/lukso-network/LIPs/blob/main/LSPs/LSP-2-ERC725YJSONSchema.md ERC725YJsonSchema standard.
     * @returns {string} The keccak256 hash of the provided key name. This is the key that must be retrievable from the ERC725Y contract via ERC725Y.getData(bytes32 key).
     */
    encodeKeyName(keyName) {
        return (0, encodeKeyName_1.encodeKeyName)(keyName);
    }
}
exports.ERC725 = ERC725;
exports.default = ERC725;
//# sourceMappingURL=index.js.map