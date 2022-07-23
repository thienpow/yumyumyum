/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "../utils/twind.ts";
import Layout from "../components/Layout.tsx";
import { TODOS, TodoData } from "../model/todo.ts";


export const handler: Handlers<TodoData | null> = {
  GET(_, ctx) {
    const result = TODOS[0];
    
    return ctx.render(result.data);
  },
};

export default function Creator({ data }: PageProps<TodoData | null>) {
  if (!data) {
    return <h1>Data not found</h1>;
  }
  return (
    <Layout>
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
    </Layout>
  );
}
