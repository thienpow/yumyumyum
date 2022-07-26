/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "../utils/twind.ts";
import SubLayout from "../components/SubLayout.tsx";
import { TODOS, TodoData, TodoDetailData } from "../model/todo.ts";


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
      <div>
        
        <strong>Creator features:</strong>
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
        <strong>Follower features:</strong>
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
