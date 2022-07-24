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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/*
  This file will handle querying the Ethereum provider api in accordance with
  implementation of smart contract interfaces of ERC725
*/
import * as abi from 'web3-eth-abi';
import { ERC725_VERSION, ERC725Y_INTERFACE_IDS, METHODS, } from '../lib/constants';
import { decodeResult as decodeResultUtils } from '../lib/provider-wrapper-utils';
import { Method } from '../types/Method';
// @ts-ignore
const abiCoder = abi.default;
// https://docs.metamask.io/guide/ethereum-provider.html
export class EthereumProviderWrapper {
    constructor(provider) {
        this.type = "ETHEREUM" /* ETHEREUM */;
        this.provider = provider;
    }
    getOwner(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = this.constructJSONRPC(address, Method.OWNER);
            const result = yield this.callContract(params);
            if (result.error) {
                throw result.error;
            }
            return this.decodeResult(Method.OWNER, result);
        });
    }
    // Duplicated code with ethereumProvider ...
    getErc725YVersion(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const isErc725Y = yield this.supportsInterface(address, ERC725Y_INTERFACE_IDS['3.0']);
            if (isErc725Y) {
                return ERC725_VERSION.ERC725;
            }
            const isErc725Yv200 = yield this.supportsInterface(address, ERC725Y_INTERFACE_IDS['2.0']);
            if (isErc725Yv200) {
                return ERC725_VERSION.ERC725;
            }
            // v0.2.0 and v0.6.0 have the same function signatures for getData, only versions before v0.2.0 requires a different call
            const isErc725YLegacy = yield this.supportsInterface(address, ERC725Y_INTERFACE_IDS.legacy);
            return isErc725YLegacy
                ? ERC725_VERSION.ERC725_LEGACY
                : ERC725_VERSION.NOT_ERC725;
        });
    }
    /**
     * https://eips.ethereum.org/EIPS/eip-165
     *
     * @param address the smart contract address
     * @param interfaceId ERC-165 identifier as described here: https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md#specification
     */
    supportsInterface(address, interfaceId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.decodeResult(Method.SUPPORTS_INTERFACE, yield this.callContract(this.constructJSONRPC(address, Method.SUPPORTS_INTERFACE, `${interfaceId}${'00000000000000000000000000000000000000000000000000000000'}`)));
        });
    }
    /**
     * https://eips.ethereum.org/EIPS/eip-1271
     *
     * @param {string} address the contract address
     * @param {string} hash
     * @param {string} signature
     */
    isValidSignature(address, hash, signature) {
        return __awaiter(this, void 0, void 0, function* () {
            const encodedParams = abiCoder.encodeParameters(['bytes32', 'bytes'], [hash, signature]);
            const result = yield this.callContract(this.constructJSONRPC(address, Method.IS_VALID_SIGNATURE, encodedParams));
            if (result.error) {
                throw result.error;
            }
            return this.decodeResult(Method.IS_VALID_SIGNATURE, result);
        });
    }
    getData(address, keyHash) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.getAllData(address, [keyHash]);
            try {
                return result[0].value;
            }
            catch (_a) {
                return null;
            }
        });
    }
    getAllData(address, keyHashes) {
        return __awaiter(this, void 0, void 0, function* () {
            const erc725Version = yield this.getErc725YVersion(address);
            if (erc725Version === ERC725_VERSION.NOT_ERC725) {
                throw new Error(`Contract: ${address} does not support ERC725Y interface.`);
            }
            switch (erc725Version) {
                case ERC725_VERSION.ERC725:
                    return this._getAllData(address, keyHashes);
                case ERC725_VERSION.ERC725_LEGACY:
                    return this._getAllDataLegacy(address, keyHashes);
                default:
                    return [];
            }
        });
    }
    _getAllData(address, keyHashes) {
        return __awaiter(this, void 0, void 0, function* () {
            const encodedResults = yield this.callContract(this.constructJSONRPC(address, Method.GET_DATA, abiCoder.encodeParameter('bytes32[]', keyHashes)));
            const decodedValues = this.decodeResult(Method.GET_DATA, encodedResults);
            return keyHashes.map((keyHash, index) => ({
                key: keyHash,
                value: decodedValues[index],
            }));
        });
    }
    _getAllDataLegacy(address, keyHashes) {
        return __awaiter(this, void 0, void 0, function* () {
            // Here we could use `getDataMultiple` instead of sending multiple calls to `getData`
            // But this is already legacy and it won't be used anymore..
            const encodedResultsPromises = keyHashes.map((keyHash) => this.callContract(this.constructJSONRPC(address, Method.GET_DATA_LEGACY, keyHash)));
            const decodedResults = yield Promise.all(encodedResultsPromises);
            return decodedResults.map((decodedResult, index) => ({
                key: keyHashes[index],
                value: this.decodeResult(Method.GET_DATA_LEGACY, decodedResult),
            }));
        });
    }
    // eslint-disable-next-line class-methods-use-this
    constructJSONRPC(address, method, methodParam) {
        const data = methodParam
            ? METHODS[method].sig + methodParam.replace('0x', '')
            : METHODS[method].sig;
        return [
            {
                to: address,
                value: METHODS[method].value,
                gas: METHODS[method].gas,
                data,
            },
            'latest',
        ];
    }
    callContract(params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.provider.request({ method: 'eth_call', params });
        });
    }
    // eslint-disable-next-line class-methods-use-this
    decodeResult(method, result) {
        return decodeResultUtils(method, { result });
    }
}
//# sourceMappingURL=ethereumProviderWrapper.js.map