/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "../utils/twind.ts";
import SubLayout from "../components/SubLayout.tsx";

export default function Blog() {
  
  return (
    <SubLayout>
      <div class={tw`flex justify-center h-screen max-w-3xl`}>
        <div class={tw`flex-0 justify-start`}>
          <h1 class={tw`text-xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-5xl p-7`}>Blog</h1>
          <hr class={tw`h-.5 bg-black w-3xl`} />
            
        </div>
        
      </div>
    </SubLayout>
  );
}
