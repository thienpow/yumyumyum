/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "../utils/twind.ts";
import Layout from "../components/Layout.tsx";
import { TODOS, TodoData } from "../model/todo.ts";

import web3 from "web3";
import { ERC725 } from "@erc725/erc725.js";


const schema = [
  {
    name: 'SupportedStandards:ERC725Account',
    key: '0xeafec4d89fa9619884b6b89135626455000000000000000000000000afdeb5d6',
    keyType: 'Mapping',
    valueContent: '0xafdeb5d6',
    valueType: 'bytes'
  },
  {
    name: 'LSP3Profile',
    key: '0x5ef83ad9559033e6e941db7d7c495acdce616347d28e90c7ce47cbfcfcad3bc5',
    keyType: 'Singleton',
    valueContent: 'JSONURL',
    valueType: 'bytes'
  },
  {
    name: 'LSP1UniversalReceiverDelegate',
    key: '0x0cfc51aec37c55a4d0b1a65c6255c4bf2fbdf6277f3cc0730c45b828b6db8b47',
    keyType: 'Singleton',
    valueContent: 'Address',
    valueType: 'address'
  },
  {
    name: 'LSP3IssuedAssets[]',
    key: '0x3a47ab5bd3a594c3a8995f8fa58d0876c96819ca4516bd76100c92462f2f9dc0',
    keyType: 'Array',
    valueContent: 'Number',
    valueType: 'uint256',
    elementValueContent: 'Address',
    elementValueType: 'address'
  }
];

const address = '0x3000783905Cc7170cCCe49a4112Deda952DDBe24';
const provider = new web3.providers.HttpProvider(
  'https://rpc.l14.lukso.network'
);
const config = {
  ipfsGateway: 'https://ipfs.lukso.network/ipfs/'
};

const myERC725 = new ERC725(schema, address, provider, config);

// Your code goes here.
console.log(myERC725);

export const handler: Handlers<TodoData | null> = {
  GET(_, ctx) {
    const result = TODOS[1];
    return ctx.render(result.data);
  },
};

export default function Follower({ data }: PageProps<TodoData | null>) {
  if (!data) {
    return <h1>Data not found</h1>;
  }
  return (
    <Layout>
      <div>
        
        
        <strong>TODO:</strong>
        <p>
          <strong>{data.item}</strong>
          <ul>
          {
            data.detail.map(v => {
              return <li>{v}</li>
            })
          }
          </ul>

        </p>
        
      </div>
    </Layout>
  );
}
