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
 * @file providers/ethereumProviderWrapper.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthereumProviderWrapper = void 0;
/*
  This file will handle querying the Ethereum provider api in accordance with
  implementation of smart contract interfaces of ERC725
*/
const abi = __importStar(require("web3-eth-abi"));
const constants_1 = require("../lib/constants");
const provider_wrapper_utils_1 = require("../lib/provider-wrapper-utils");
const Method_1 = require("../types/Method");
// @ts-ignore
const abiCoder = abi.default;
// https://docs.metamask.io/guide/ethereum-provider.html
class EthereumProviderWrapper {
    constructor(provider) {
        this.type = "ETHEREUM" /* ETHEREUM */;
        this.provider = provider;
    }
    async getOwner(address) {
        const params = this.constructJSONRPC(address, Method_1.Method.OWNER);
        const result = await this.callContract(params);
        if (result.error) {
            throw result.error;
        }
        return this.decodeResult(Method_1.Method.OWNER, result);
    }
    // Duplicated code with ethereumProvider ...
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
        return this.decodeResult(Method_1.Method.SUPPORTS_INTERFACE, await this.callContract(this.constructJSONRPC(address, Method_1.Method.SUPPORTS_INTERFACE, `${interfaceId}${'00000000000000000000000000000000000000000000000000000000'}`)));
    }
    /**
     * https://eips.ethereum.org/EIPS/eip-1271
     *
     * @param {string} address the contract address
     * @param {string} hash
     * @param {string} signature
     */
    async isValidSignature(address, hash, signature) {
        const encodedParams = abiCoder.encodeParameters(['bytes32', 'bytes'], [hash, signature]);
        const result = await this.callContract(this.constructJSONRPC(address, Method_1.Method.IS_VALID_SIGNATURE, encodedParams));
        if (result.error) {
            throw result.error;
        }
        return this.decodeResult(Method_1.Method.IS_VALID_SIGNATURE, result);
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
        const encodedResults = await this.callContract(this.constructJSONRPC(address, Method_1.Method.GET_DATA, abiCoder.encodeParameter('bytes32[]', keyHashes)));
        const decodedValues = this.decodeResult(Method_1.Method.GET_DATA, encodedResults);
        return keyHashes.map((keyHash, index) => ({
            key: keyHash,
            value: decodedValues[index],
        }));
    }
    async _getAllDataLegacy(address, keyHashes) {
        // Here we could use `getDataMultiple` instead of sending multiple calls to `getData`
        // But this is already legacy and it won't be used anymore..
        const encodedResultsPromises = keyHashes.map((keyHash) => this.callContract(this.constructJSONRPC(address, Method_1.Method.GET_DATA_LEGACY, keyHash)));
        const decodedResults = await Promise.all(encodedResultsPromises);
        return decodedResults.map((decodedResult, index) => ({
            key: keyHashes[index],
            value: this.decodeResult(Method_1.Method.GET_DATA_LEGACY, decodedResult),
        }));
    }
    // eslint-disable-next-line class-methods-use-this
    constructJSONRPC(address, method, methodParam) {
        const data = methodParam
            ? constants_1.METHODS[method].sig + methodParam.replace('0x', '')
            : constants_1.METHODS[method].sig;
        return [
            {
                to: address,
                value: constants_1.METHODS[method].value,
                gas: constants_1.METHODS[method].gas,
                data,
            },
            'latest',
        ];
    }
    async callContract(params) {
        return this.provider.request({ method: 'eth_call', params });
    }
    // eslint-disable-next-line class-methods-use-this
    decodeResult(method, result) {
        return (0, provider_wrapper_utils_1.decodeResult)(method, { result });
    }
}
exports.EthereumProviderWrapper = EthereumProviderWrapper;
//# sourceMappingURL=ethereumProviderWrapper.js.map