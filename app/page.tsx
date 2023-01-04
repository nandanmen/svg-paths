import { Editor } from "./editor";

export default function Home() {
  return (
    <main className="h-screen flex flex-col gap-6 items-center justify-center">
      <h1 className="text-2xl font-bold">Hello world</h1>
      <Editor />
    </main>
  );
}
