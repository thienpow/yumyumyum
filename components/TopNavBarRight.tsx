/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "@twind";

export default function TopNavBarRight({children}:any) {

  return (    
    <nav class={tw`relative z-10 inline-flex items-center space-x-3 md:ml-5 lg:justify-end`}>
      {children}
    </nav>
  );
}
