import { Hono, type Context } from "hono";
import type { FC, PropsWithChildren } from "hono/jsx";
import type { JSX } from "hono/jsx/jsx-runtime";
import { serveStatic } from "@hono/node-server/serve-static";
import { sValidator } from "@hono/standard-validator";
import * as v from "valibot";

type Todo = { id: string; title: string };
const todos: Todo[] = [];

const isHxRequest = (c: Context) => c.req.header("HX-Request") === "true";

const Layout: FC<PropsWithChildren<{ title: string }>> = (props) => (
  <html lang="ja">
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{props.title}</title>

      <link rel="stylesheet" href="/static/app.css" />

      <meta
        name="htmx-config"
        content={JSON.stringify({
          allowScriptTags: false,
          allowEval: false,
          // htmx 2.x は既定で true ですが、意図を明示するなら入れてOK
          selfRequestsOnly: true,
          // 履歴キャッシュを使わないなら 0（任意）
          historyCacheSize: 0,
          // HX-Request で partial/full を分岐しているなら推奨
          historyRestoreAsHxRequest: false,
        })}
      />

      <script
        src="https://cdn.jsdelivr.net/npm/htmx.org@2.0.8/dist/htmx.min.js"
        integrity="sha384-/TgkGk7p307TH7EXJDuUlgG3Ce1UVolAOFopFekQkkXihi5u/6OCvVKyz1W+idaz"
        crossorigin="anonymous"
      ></script>
    </head>

    <body class="min-h-screen bg-slate-50 text-slate-900">
      <main class="mx-auto max-w-xl p-6">{props.children}</main>
    </body>
  </html>
);

type TitleInputProps = JSX.IntrinsicElements["input"];
const TitleInput: FC<TitleInputProps> = ({ class: className, ...props }) => (
  <input
    id="todo-title"
    name="title"
    required
    placeholder="例: 牛乳を買う"
    {...props}
    class={[
      "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm",
      "outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200",
      className ?? "",
    ].join(" ")}
  />
);

const TodoItem: FC<{ todo: Todo }> = ({ todo }) => (
  <li class="flex items-center gap-3 px-3 py-2">
    <span class="flex-1">{todo.title}</span>
    <button
      type="button"
      hx-delete={`/todos/${todo.id}`}
      hx-target="closest li"
      hx-swap="outerHTML"
      hx-confirm="削除しますか？"
      class="rounded-md bg-rose-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-700"
    >
      Delete
    </button>
  </li>
);

const TodoList: FC<{ todos: Todo[] }> = ({ todos }) => (
  <ul
    id="todo-list"
    class="mt-4 divide-y divide-slate-200 rounded-md border border-slate-200 bg-white"
  >
    {todos.map((t) => (
      <TodoItem todo={t} />
    ))}
  </ul>
);

const schema = v.object({
  title: v.pipe(v.string(), v.minLength(1), v.maxLength(100)),
});

const app = new Hono();

// 静的ファイル配信（/static/app.css を配る）
app.use("/static/*", serveStatic({ root: "./" }));

app.get("/", (c) => {
  return c.html(
    <Layout title="Hono + typed-htmx + Tailwind">
      <h1 class="text-2xl font-semibold tracking-tight">Todo</h1>

      <form
        method="post"
        action="/todos"
        hx-post="/todos"
        hx-target="#todo-list"
        hx-swap="beforeend"
        class="mt-4 flex gap-2"
      >
        <div class="flex-1">
          <TitleInput />
        </div>
        <button
          type="submit"
          class="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Add
        </button>
      </form>

      <div class="mt-3">
        <button
          type="button"
          hx-get="/todos"
          hx-target="#todo-list"
          hx-swap="outerHTML"
          class="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Reload list
        </button>
      </div>

      <TodoList todos={todos} />
    </Layout>
  );
});

// 部分更新用：リストだけ返す
app.get("/todos", (c) => c.html(<TodoList todos={todos} />));

// 追加：htmxなら<li>だけ返して追加、非htmxならリダイレクト
app.post("/todos", sValidator("form", schema), (c) => {
  const { title } = c.req.valid("form");
  const todo: Todo = { id: crypto.randomUUID(), title };
  todos.push(todo);

  // htmxはHX-Request: true を送る（partialレスポンス分岐に使える）
  if (!isHxRequest(c)) return c.redirect("/", 303);

  return c.html(
    <>
      <TodoItem todo={todo} />
      {/* OOBで入力欄を空にする */}
      <TitleInput value="" hx-swap-oob="true" />
    </>
  );
});

app.delete("/todos/:id", (c) => {
  const { id } = c.req.param();
  const i = todos.findIndex((t) => t.id === id);
  if (i >= 0) todos.splice(i, 1);

  if (!isHxRequest(c)) return c.redirect("/", 303);

  // outerHTML swap対象に空を返すと要素が消える
  return c.html("");
});

export default app;
export type AppType = typeof app;
