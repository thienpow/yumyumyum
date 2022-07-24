/** @jsx h */
import { h } from "preact";
import { Handlers, PageProps } from "$fresh/server.ts";
import { tw } from "../utils/twind.ts";
import Layout from "../components/Layout.tsx";
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
    <Layout>
      <div>
      
        <p><a href="../">Back to Landing Page</a></p>

        <h2>Account dApp</h2>

        <div id="notifications"></div>

        <hr />

        <table>
          <thead>
            <tr>
              <th>Address</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody id="accounts">
            <tr>
              <td colSpan={2}>Trying to load your accounts...</td>
            </tr>
          </tbody>
        </table>

        <hr />

        <script src="./utils.js"></script>
        <script src="./events.js"></script>

        
      </div>
    </Layout>
  );
}
