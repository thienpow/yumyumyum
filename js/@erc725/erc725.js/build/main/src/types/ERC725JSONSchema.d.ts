export declare type ERC725JSONSchemaKeyType = 'Singleton' | 'Mapping' | 'Array' | 'Mapping' | 'MappingWithGrouping';
export declare type ERC725JSONSchemaValueContent = 'Number' | 'String' | 'Address' | 'Keccak256' | 'AssetURL' | 'JSONURL' | 'URL' | 'Markdown' | string;
export declare type ERC725JSONSchemaValueType = 'string' | 'address' | 'uint256' | 'bytes32' | 'bytes' | 'bytes4' | 'string[]' | 'address[]' | 'uint256[]' | 'bytes32[]' | 'bytes4[]' | 'bytes[]' | string;
/**
 * ```javascript title=Example
 *   {
 *     name: "LSP3Profile",
 *     key: "0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5",
 *     keyType: "Singleton",
 *     valueContent: "JSONURL",
 *     valueType: "bytes",
 *   },
 * ```
 * Detailed information available on [LSP-2-ERC725YJSONSchema](https://github.com/lukso-network/LIPs/blob/master/LSPs/LSP-2-ERC725YJSONSchema.md)
 */
export interface ERC725JSONSchema {
    name: string;
    key: string;
    keyType: ERC725JSONSchemaKeyType;
    valueContent: ERC725JSONSchemaValueContent | string;
    valueType: ERC725JSONSchemaValueType;
}
