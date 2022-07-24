/**
 * @file providers/web3ProviderWrapper.ts
 * @author Robert McLeod <@robertdavid010>, Fabian Vogelsteller <fabian@lukso.network>
 * @date 2020
 */
import { ProviderTypes } from '../types/provider';
import { ERC725_VERSION } from '../lib/constants';
interface GetDataReturn {
    key: string;
    value: Record<string, any> | null;
}
export declare class Web3ProviderWrapper {
    type: ProviderTypes;
    provider: any;
    constructor(provider: any);
    getOwner(address: string): Promise<any>;
    getErc725YVersion(address: string): Promise<ERC725_VERSION>;
    /**
     * https://eips.ethereum.org/EIPS/eip-165
     *
     * @param address the smart contract address
     * @param interfaceId ERC-165 identifier as described here: https://github.com/ERC725Alliance/ERC725/blob/develop/docs/ERC-725.md#specification
     */
    supportsInterface(address: string, interfaceId: string): Promise<boolean>;
    /**
     * https://eips.ethereum.org/EIPS/eip-1271
     *
     * @param address the contract address
     * @param hash
     * @param signature
     */
    isValidSignature(address: string, hash: string, signature: string): Promise<any>;
    getData(address: string, keyHash: string): Promise<Record<string, any> | null>;
    getAllData(address: string, keyHashes: string[]): Promise<GetDataReturn[]>;
    private _getAllData;
    private _getAllDataLegacy;
    private callContract;
}
export {};
