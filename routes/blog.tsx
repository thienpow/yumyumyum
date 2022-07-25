/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "../utils/twind.ts";
import SubLayout from "../components/SubLayout.tsx";
import Header from "../components/Header.tsx";
import BlogItem from "../components/BlogItem.tsx";

export default function Blog() {
  
  return (
    <SubLayout>
      <div class={tw`flex flex-col sm:w-full max-w-3xl mr-auto ml-auto`}>
        <Header title="Blog" /><br />
        <BlogItem datetime="Jul 26, 2022" title="Blog is created!" text="This is the very first Official blog of YumYumYum." />
        
      </div>
    </SubLayout>
  );
}
