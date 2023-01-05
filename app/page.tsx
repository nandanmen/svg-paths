import { PathEditor } from "./path-editor";

export default function Home() {
  return (
    <main className="h-screen grid grid-cols-[35ch_1fr] p-8">
      <div>
        <PathEditor />
      </div>
    </main>
  );
}
