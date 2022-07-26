/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "../utils/twind.ts";
import SubLayout from "../components/SubLayout.tsx";
import { TODOS, TodoData, TodoDetailData } from "../model/todo.ts";
import Header from "../components/Header.tsx";
import AppMainButton from "../components/AppMainButton.tsx";
import AppTopBanner from "../components/AppTopBanner.tsx";


export const handler: Handlers<TodoData[] | null> = {
  GET(_, ctx) {  
    return ctx.render(TODOS);
  },
};

export default function Creator({ data }: PageProps<TodoData[] | null>) {
  if (!data) {
    return <h1>Data not found</h1>;
  }
  return (
    <SubLayout>
      <div class={tw`w-full mr-auto ml-auto justify-center items-center`}>
        <div class={tw`flex flex-row flex-wrap sm:w-full max-w-3xl mr-auto ml-auto`}>
          <AppTopBanner title="Special Reward" color="red" url="/app/specialrewards" />
        </div>
        <div class={tw`flex flex-row flex-wrap justify-center items-center sm:w-full max-w-3xl mr-auto ml-auto`}>
          <AppMainButton title="Post" color="green" url="/app/post" />
          <AppMainButton title="Discover" color="yellow" url="/app/discover"/>
          <AppMainButton title="Rewards" color="red" url="/app/rewards"/>
          <AppMainButton title="Ranks" color="gray" url="/app/ranks"/>
        </div>

        <h1 class={tw`py-7 font-bold text-2xl text-gray-900`}>TODO</h1>
        <strong class={tw`text-xl`}>Creator</strong>
        <hr class={tw`py-4`} />
        <p>
          <strong>{data[0].data.item}</strong>
          <ul>
          {
            data[0].data.detail.map(v => {
              return <li>{v}</li>
            })
          }
          </ul>
        </p>
        
        <hr class={tw`py-4 border-0`} />
        <strong class={tw`text-xl`}>Follower</strong>
        <hr class={tw`py-4`} />
        <p>
          <strong>{data[1].data.item}</strong>
          <ul>
          {
            data[1].data.detail.map(v => {
              return <li>{v}</li>
            })
          }
          </ul>

        </p>
      </div>
    </SubLayout>
  );
}
