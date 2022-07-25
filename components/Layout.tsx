/** @jsx h */
import { h } from "preact";
import { useState } from "preact/hooks";
import { IS_BROWSER } from "$fresh/runtime.ts";
import { tw } from "@twind";

import TopNavBar from "./TopNavBar.tsx";
import SignInButton from "./SignInButton.tsx";
import SignUpButton from "./SignUpButton.tsx";
import TopLogo from "./TopLogo.tsx";
import TopMenuItem from "./TopMenuItem.tsx";
import TopNavBarMid from "./TopNavBarMid.tsx";
import TopNavBarRight from "./TopNavBarRight.tsx";
import MainContent from "./MainContent.tsx";

export default function Layout({children}:any) {

  return (
    <div class={tw`w-full p-4`}>
      <TopNavBar>
          <TopLogo />

          <TopNavBarMid>
            <TopMenuItem title="Home" url="/" />
            <TopMenuItem title="Creator" url="/creator" />
            <TopMenuItem title="Follower" url="/follower" />
            <TopMenuItem title="Blog" url="/blog" />
          </TopNavBarMid>

          <TopNavBarRight>
            <SignInButton />
            <SignUpButton />
          </TopNavBarRight>            

      </TopNavBar>

      <MainContent>
        {children}
      </MainContent>

    </div>
  );
}
