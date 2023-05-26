import Nav from './server/Nav';
 
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen w-full flex flex-col">
      <Nav />
      {children}
    </main>
  );
}