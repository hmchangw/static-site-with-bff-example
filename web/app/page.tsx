import { BFF_URL } from "@/lib/bff";
import TodoApp from "./todos/TodoApp";

export default function Home() {
  return (
    <main>
      <h1>Static Next.js + BFF demo</h1>
      <p>
        This page is part of a fully statically exported Next.js site
        (<code>output: &quot;export&quot;</code>). All dynamic data comes from a
        separate BFF at <code>{BFF_URL}</code>.
      </p>

      <div className="card">
        <h2>How it works</h2>
        <ul>
          <li>The frontend is built once with <code>next build</code> and emitted to <code>web/out/</code>.</li>
          <li>It can be served from any static host (S3, Netlify, GitHub Pages, nginx, …).</li>
          <li>At runtime it calls the BFF over HTTP using <code>fetch</code>.</li>
          <li>The BFF lives in <code>bff/</code> and is a small Express server with CORS enabled.</li>
        </ul>
      </div>

      <TodoApp />
    </main>
  );
}
