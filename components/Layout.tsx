/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "@twind";


export default function Layout({children}:any) {
  const btn = tw`px-2 py-1 border(gray-100 1) hover:bg-green-200`;
  return (
    <div class={tw`w-full p-4`}>

      <nav class={tw`flex-grow-1 font-bold text-xl`}>
        <a
          class={btn}
          href="./"
          disabled={!IS_BROWSER}
        >
          Home
        </a>
        <a
          class={btn}
          href="./creator"
          disabled={!IS_BROWSER}
        >
          Creator
        </a>
        <a
          class={btn}
          href="./follower"
          disabled={!IS_BROWSER}
        >
          Follower
        </a>
      </nav>
      <div class={tw`p-4`}>
      {children}
      </div>

    </div>
  );
}
