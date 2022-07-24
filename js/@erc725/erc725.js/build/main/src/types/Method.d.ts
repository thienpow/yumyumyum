export declare enum Method {
    GET_DATA_LEGACY = "getDataLegacy",
    GET_DATA = "getData",
    OWNER = "owner",
    SUPPORTS_INTERFACE = "supportsInterface",
    IS_VALID_SIGNATURE = "isValidSignature"
}
export declare enum Encoding {
    BYTES = "bytes",
    BYTES4 = "bytes4",
    BOOL = "bool",
    UINT256 = "uint256",
    BYTES32_ARRAY = "bytes32[]",
    BYTES_ARRAY = "bytes[]",
    ADDRESS = "address"
}
export interface MethodData {
    sig: string;
    gas: string;
    gasPrice: string;
    value: string;
    returnEncoding: Encoding;
}
export interface Permissions {
    CHANGEOWNER?: boolean;
    CHANGEPERMISSIONS?: boolean;
    ADDPERMISSIONS?: boolean;
    SETDATA?: boolean;
    CALL?: boolean;
    STATICCALL?: boolean;
    DELEGATECALL?: boolean;
    DEPLOY?: boolean;
    TRANSFERVALUE?: boolean;
    SIGN?: boolean;
    SUPER_SETDATA?: boolean;
    SUPER_TRANSFERVALUE?: boolean;
    SUPER_CALL?: boolean;
    SUPER_STATICCALL?: boolean;
    SUPER_DELEGATECALL?: boolean;
}
