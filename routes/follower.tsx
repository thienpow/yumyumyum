/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "../utils/twind.ts";
import SubLayout from "../components/SubLayout.tsx";
import { TODOS, TodoData } from "../model/todo.ts";


export const handler: Handlers<TodoData | null> = {
  GET(_, ctx) {
    const result = TODOS[1];
    return ctx.render(result.data);
  },
};

export default function Follower({ data }: PageProps<TodoData | null>) {
  if (!data) {
    return <h1>Data not found</h1>;
  }
  return (
    <SubLayout>
      <div>
        
        
        <strong>TODO:</strong>
        <p>
          <strong>{data.item}</strong>
          <ul>
          {
            data.detail.map(v => {
              return <li>{v}</li>
            })
          }
          </ul>

        </p>
        
      </div>
    </SubLayout>
  );
}
