/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "@twind";

export default function TopLogo() {

  return (
    <a href="/" class={tw`relative z-10 flex items-center w-auto text-2xl font-extrabold leading-none text-black select-none`}>YumYumYum</a>
  );
}
