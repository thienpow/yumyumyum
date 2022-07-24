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
 * @file providers/web3ProviderWrapper.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3ProviderWrapper = void 0;
/*
  This file will handle querying the Ethereum web3 rpc based on a given provider
  in accordance with implementation of smart contract interfaces of ERC725
*/
const web3_eth_abi_1 = __importDefault(require("web3-eth-abi"));
const Method_1 = require("../types/Method");
const provider_wrapper_utils_1 = require("../lib/provider-wrapper-utils");
const constants_1 = require("../lib/constants");
// TS can't get the types from the import...
// @ts-ignore
const abiCoder = web3_eth_abi_1.default;
class Web3ProviderWrapper {
    constructor(provider) {
        this.type = "WEB3" /* WEB3 */;
        this.provider = provider;
    }
    async getOwner(address) {
        const result = await this.callContract((0, provider_wrapper_utils_1.constructJSONRPC)(address, Method_1.Method.OWNER));
        if (result.error) {
            throw result.error;
        }
        return (0, provider_wrapper_utils_1.decodeResult)(Method_1.Method.OWNER, result);
    }
    async getErc725YVersion(address) {
        const isErc725Y = await this.supportsInterface(address, constants_1.ERC725Y_INTERFACE_IDS['3.0']);
        if (isErc725Y) {
            return constants_1.ERC725_VERSION.ERC725;
        }
        const isErc725Yv200 = await this.supportsInterface(address, constants_1.ERC725Y_INTERFACE_IDS['2.0']);
        if (isErc725Yv200) {
            return constants_1.ERC725_VERSION.ERC725;
        }
        // v0.2.0 and v0.6.0 have the same function signatures for getData, only versions before v0.2.0 requires a different call
        const isErc725YLegacy = await this.supportsInterface(address, constants_1.ERC725Y_INTERFACE_IDS.legacy);
        return isErc725YLegacy
            ? constants_1.ERC725_VERSION.ERC725_LEGACY
            : constants_1.ERC725_VERSION.NOT_ERC725;
    }
    /**
     * https://eips.ethereum.org/EIPS/eip-165
     *
     * @param address the smart contract address
     * @param interfaceId ERC-165 identifier as described here: https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md#specification
     */
    async supportsInterface(address, interfaceId) {
        const result = await this.callContract((0, provider_wrapper_utils_1.constructJSONRPC)(address, Method_1.Method.SUPPORTS_INTERFACE, `${interfaceId}${'00000000000000000000000000000000000000000000000000000000'}`));
        return (0, provider_wrapper_utils_1.decodeResult)(Method_1.Method.SUPPORTS_INTERFACE, result);
    }
    /**
     * https://eips.ethereum.org/EIPS/eip-1271
     *
     * @param address the contract address
     * @param hash
     * @param signature
     */
    async isValidSignature(address, hash, signature) {
        const encodedParams = abiCoder.encodeParameters(['bytes32', 'bytes'], [hash, signature]);
        const results = await this.callContract([
            (0, provider_wrapper_utils_1.constructJSONRPC)(address, Method_1.Method.IS_VALID_SIGNATURE, encodedParams),
        ]);
        if (results.error) {
            throw results.error;
        }
        return (0, provider_wrapper_utils_1.decodeResult)(Method_1.Method.IS_VALID_SIGNATURE, results[0]);
    }
    async getData(address, keyHash) {
        const result = await this.getAllData(address, [keyHash]);
        try {
            return result[0].value;
        }
        catch (_a) {
            return null;
        }
    }
    async getAllData(address, keyHashes) {
        const erc725Version = await this.getErc725YVersion(address);
        if (erc725Version === constants_1.ERC725_VERSION.NOT_ERC725) {
            throw new Error(`Contract: ${address} does not support ERC725Y interface.`);
        }
        switch (erc725Version) {
            case constants_1.ERC725_VERSION.ERC725:
                return this._getAllData(address, keyHashes);
            case constants_1.ERC725_VERSION.ERC725_LEGACY:
                return this._getAllDataLegacy(address, keyHashes);
            default:
                return [];
        }
    }
    async _getAllData(address, keyHashes) {
        const payload = [
            (0, provider_wrapper_utils_1.constructJSONRPC)(address, Method_1.Method.GET_DATA, abiCoder.encodeParameter('bytes32[]', keyHashes)),
        ];
        const results = await this.callContract(payload);
        const decodedValues = (0, provider_wrapper_utils_1.decodeResult)(Method_1.Method.GET_DATA, results[0]);
        return keyHashes.map((key, index) => ({
            key,
            value: decodedValues[index],
        }));
    }
    async _getAllDataLegacy(address, keyHashes) {
        const payload = [];
        // Here we could use `getDataMultiple` instead of sending multiple calls to `getData`
        // But this is already legacy and it won't be used anymore..
        for (let index = 0; index < keyHashes.length; index++) {
            payload.push((0, provider_wrapper_utils_1.constructJSONRPC)(address, Method_1.Method.GET_DATA_LEGACY, keyHashes[index]));
        }
        const results = await this.callContract(payload);
        return payload.map((payloadCall, index) => ({
            key: keyHashes[index],
            value: (0, provider_wrapper_utils_1.decodeResult)(Method_1.Method.GET_DATA_LEGACY, results.find((element) => payloadCall.id === element.id)),
        }));
    }
    async callContract(payload) {
        return new Promise((resolve, reject) => {
            // Send old web3 method with callback to resolve promise
            // This is deprecated: https://docs.metamask.io/guide/ethereum-provider.html#ethereum-send-deprecated
            this.provider.send(payload, (e, r) => {
                if (e) {
                    reject(e);
                }
                else {
                    resolve(r);
                }
            });
        });
    }
}
exports.Web3ProviderWrapper = Web3ProviderWrapper;
//# sourceMappingURL=web3ProviderWrapper.js.map