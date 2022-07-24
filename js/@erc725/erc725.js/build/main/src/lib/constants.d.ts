import { MethodData, Method } from '../types/Method';
export declare const ERC725Y_INTERFACE_IDS: {
    legacy: string;
    '2.0': string;
    '3.0': string;
};
export declare enum ERC725_VERSION {
    ERC725 = "ERC725",
    ERC725_LEGACY = "ERC725_LEGACY",
    NOT_ERC725 = "NOT_ERC725"
}
export declare const METHODS: Record<Method, MethodData>;
export declare enum SUPPORTED_HASH_FUNCTION_STRINGS {
    KECCAK256_UTF8 = "keccak256(utf8)",
    KECCAK256_BYTES = "keccak256(bytes)"
}
export declare enum SUPPORTED_HASH_FUNCTION_HASHES {
    HASH_KECCAK256_UTF8 = "0x6f357c6a",
    HASH_KECCAK256_BYTES = "0x8019f9b1"
}
export declare type SUPPORTED_HASH_FUNCTIONS = SUPPORTED_HASH_FUNCTION_STRINGS | SUPPORTED_HASH_FUNCTION_HASHES;
export declare const SUPPORTED_HASH_FUNCTIONS_LIST: SUPPORTED_HASH_FUNCTION_STRINGS[];
export declare const HASH_FUNCTIONS: {
    [key: string]: {
        method: Function;
        name: SUPPORTED_HASH_FUNCTION_STRINGS;
        sig: SUPPORTED_HASH_FUNCTIONS;
    };
};
export declare const LSP6_DEFAULT_PERMISSIONS: {
    CHANGEOWNER: string;
    CHANGEPERMISSIONS: string;
    ADDPERMISSIONS: string;
    SETDATA: string;
    CALL: string;
    STATICCALL: string;
    DELEGATECALL: string;
    DEPLOY: string;
    TRANSFERVALUE: string;
    SIGN: string;
    SUPER_SETDATA: string;
    SUPER_TRANSFERVALUE: string;
    SUPER_CALL: string;
    SUPER_STATICCALL: string;
    SUPER_DELEGATECALL: string;
};
export declare const LSP6_ALL_PERMISSIONS = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
