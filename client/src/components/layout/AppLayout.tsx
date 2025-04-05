import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";

type AppLayoutProps = {
  children: ReactNode;
};

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar (desktop) */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile header & nav */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <MobileMenu onMenuToggle={setIsMobileMenuOpen} />

        {/* Main content */}
        <main className={`flex-1 overflow-y-auto ${isMobileMenuOpen ? 'hidden md:block' : 'block'}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
