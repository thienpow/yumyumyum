/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "@twind";

import TopNavBar from "./TopNavBar.tsx";
import TopLogo from "./TopLogo.tsx";
import SignInButton from "./SignInButton.tsx";
import TopNavBarMid from "./TopNavBarMid.tsx";
import TopNavBarRight from "./TopNavBarRight.tsx";
import MainContent from "./MainContent.tsx";

export default function SubLayout({children}:any) {

  return (
    <div class={tw`w-full p-4`}>
      <TopNavBar>
        <TopLogo />
        
        <TopNavBarMid />

        <TopNavBarRight>
          <SignInButton />
        </TopNavBarRight>    
        
      </TopNavBar>

      <MainContent>
        {children}
      </MainContent>

    </div>
  );
}
