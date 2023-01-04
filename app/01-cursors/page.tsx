import { parseMarkdown } from "./parse-markdown";

export default async function CursorsPage() {
  const doc = await parseMarkdown("01-cursors.md");
  return (
    <>
      <aside className="p-6">
        <article className="prose" dangerouslySetInnerHTML={{ __html: doc }} />
      </aside>
      <main>Main</main>
    </>
  );
}
