import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function Layout({ role, children, wide = false }) {
  return (
    <div className="flex min-h-screen bg-[#F5F6FA]">
      <Sidebar role={role} />
      <div className="flex-1 flex flex-col ml-60">
        <Navbar role={role} />
        <main className="flex-1 p-8">
          <div className={`${wide ? 'max-w-[1440px]' : 'max-w-7xl'} mx-auto`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
