/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "@twind";

export default function MainContent({children}:any) {

  return (    
    <main class={tw`p-4`}>
      {children}
    </main>
  );
}
