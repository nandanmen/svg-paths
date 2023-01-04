import { PathEditor } from "./path-editor";

export default function Home() {
  return (
    <main className="h-screen flex items-center justify-center">
      <div className="w-[350px] h-[120px]">
        <PathEditor />
      </div>
    </main>
  );
}
