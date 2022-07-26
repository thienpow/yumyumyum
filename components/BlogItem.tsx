/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "@twind";

export default function BlogItem(props: {datetime: string, title: string, text: string}) {

  return (
    <div class={tw`mt-4 flex flex-row flex-wrap w-full`}>
      <div class={tw`py-4 w-full md:w-1/3 `}>{props.datetime}</div>
      <div class={tw`flex flex-col w-full md:w-2/3 `}>
        <div class={tw`font-semibold text-2xl w-full`}>{props.title}</div>
        <div class={tw`py-4 w-full`}>{props.text}</div>
      </div>
      <hr class={tw`mt-7 h-.5 bg-black w-full`} />    
    </div>
  );
}
