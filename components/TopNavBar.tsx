/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "@twind";

export default function TopNavBar({children}:any) {

  return (    
    <section class={tw`relative w-full px-8 text-gray-700 bg-white body-font`}>
      <div class={tw`container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7xl`}>
        {children}
      </div>
    </section>
  );
}
