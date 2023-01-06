import { App } from "./app";

export default function Home() {
  return (
    <div className="flex h-screen flex-col p-8 w-fit max-w-[100vw] gap-6 mx-auto">
      <Header />
      <App />
    </div>
  );
}

const Header = () => {
  return (
    <header className="border-b border-slate-6 pb-4 flex">
      <h1 className="font-serif text-2xl">Interactive SVG Paths</h1>
      <h2 className="font-serif text-2xl text-slate-10 ml-auto">NaN</h2>
    </header>
  );
};
