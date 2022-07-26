/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "@twind";

export default function AppMainButton(props: {title: string, color: string, url: string}) {

  return (
    <a class={tw`w-full`} href={props.url}>
      <div class={tw`font-bold text-gray-300 hover:text-${props.color}-500 hover:cursor-pointer border-2 rounded-3xl border-${props.color}-300 hover:border-${props.color}-500 w-full h-36 p-4 m-2`}>{props.title}</div>
    </a>
  );
}
