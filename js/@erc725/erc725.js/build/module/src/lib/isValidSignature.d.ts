/**
 * @file lib/isValidSignature.ts
 * @author Hugo Masclet <@Hugoo>
 * @date 2022
 */
import { EthereumProviderWrapper } from '../providers/ethereumProviderWrapper';
import { Web3ProviderWrapper } from '../providers/web3ProviderWrapper';
/**
 *
 * https://eips.ethereum.org/EIPS/eip-1271
 *
 * @param {string} messageOrHash
 * @param {string} signature
 * @param {string} address the contract address
 * @returns {Promise<boolean>} Return true if the signature is valid (if the contract returns the magic value), false if not.
 */
export declare const isValidSignature: (messageOrHash: string, signature: string, address: string, wrappedProvider: EthereumProviderWrapper | Web3ProviderWrapper) => Promise<boolean>;
