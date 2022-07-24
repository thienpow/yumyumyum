export interface JsonRpc {
    jsonrpc: '2.0';
    method: 'eth_call';
    params: [
        {
            to: string;
            gas: string;
            value: string;
            data: any;
        },
        'latest'
    ];
    id: number;
}
export interface JsonRpcEthereumProviderParams {
    to: string;
    gas: string;
    value: string;
    data: any;
}
