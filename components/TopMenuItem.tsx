/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "@twind";
  
export default function TopMenuItem(props: { title: string, url: string }) {

  const menu = tw`group relative font-medium leading-6 text-gray-600 transition duration-150 ease-out hover:text-gray-900`;
  const underline = tw`group-hover:bg-black bg-white h-0.5 absolute top-7 inset-0 inline-block w-full`;
  
  return (
    <a class={menu} href={props.url}>
      <span>{props.title}</span>
      <span class={underline}></span>
    </a>
  );
}
