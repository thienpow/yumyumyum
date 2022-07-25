/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { setup, tw } from "@twind";

/*
setup({
  theme: {
    fontFamily: {
      sans: ["Helvetica", "sans-serif"],
      serif: ["Times", "serif"],
    },
  }
});
*/

export default function Layout({children}:any) {

  const menu = tw`group relative font-medium leading-6 text-gray-600 transition duration-150 ease-out hover:text-gray-900`;
  const underline = tw`group-hover:bg-black bg-white h-0.5 absolute top-7 inset-0 inline-block w-full`;
  
  return (
    <div class={tw`w-full p-4`}>


      <section class={tw`relative w-full px-8 text-gray-700 bg-white body-font`}>
          <div class={tw`container flex flex-col flex-wrap items-center justify-between py-5 mx-auto md:flex-row max-w-7xl`}>
              <a href="/" class={tw`relative z-10 flex items-center w-auto text-2xl font-extrabold leading-none text-black select-none`}>YumYumYum</a>

              <nav class={tw`top-0 left-0 z-0 flex items-center justify-center w-full h-full py-5 -ml-0 space-x-5 text-base md:-ml-5 md:py-0 md:absolute`}>
                  <a class={menu} href="/">
                      <span>Home</span>
                      <span class={underline}></span>                  
                  </a>
                  <a class={menu} href="/creator">
                      <span>Creator</span>
                      <span class={underline}></span>
                  </a>
                  <a class={menu} href="/follower">
                      <span>Follower</span>
                      <span class={underline}></span>
                  </a>
              </nav>

              <div class={tw`relative z-10 inline-flex items-center space-x-3 md:ml-5 lg:justify-end`}>
                  <a href="#" class={tw`inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-gray-600 whitespace-no-wrap bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:shadow-none`}>
                      Sign in
                  </a>
                  <span class={tw`inline-flex rounded-md shadow-sm`}>
                      <a href="#" class={tw`inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-blue-600 border border-blue-700 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 `}>
                          Sign up
                      </a>
                  </span>
              </div>
          </div>
      </section>

      <div class={tw`p-4`}>
      {children}
      </div>

    </div>
  );
}
