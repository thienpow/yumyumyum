/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import Layout from "../components/Layout.tsx";

export default function Home() {
  const btn = tw`px-2 py-1 border(gray-100 1) hover:bg-green-200`;
  return (
    <Layout>
      <div>
        <img
          src="/logo.svg"
          height="100px"
          alt="the fresh logo: a sliced lemon dripping with juice"
        />
        <p class={tw`my-6`}>
          Welcome to `YumYumYum`.
        </p>

        <a
          class={btn}
          href="/tests/erc725"
        >
          test ERC725
        </a>
      </div>
    </Layout>
  );
}
