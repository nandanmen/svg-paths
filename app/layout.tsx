import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className="bg-background text-slate-12 relative">
        <div className="fixed inset-0 bg-[url(/background.svg)] pointer-events-none" />
        {children}
      </body>
    </html>
  );
}
