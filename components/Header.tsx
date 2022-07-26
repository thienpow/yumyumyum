/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "@twind";

export default function Header(props: { title: string }) {

  return (
    <div class={tw`flex flex-col justify-start w-full`}>
      <div class={tw`font-bold text-4xl md:text-5xl text-gray-900`}>{props.title}</div>      
      <hr class={tw`mt-7 h-.5 bg-black w-full`} />
        
    </div>
  );
}
