/** @jsx h */
import { h } from "preact";
import { tw } from "@twind";
import Layout from "../components/Layout.tsx";

export default function Home() {
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
      </div>
    </Layout>
  );
}
