import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, User } from "lucide-react";

type MobileMenuProps = {
  onMenuToggle?: (isOpen: boolean) => void;
};

const MobileMenu = ({ onMenuToggle }: MobileMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    if (onMenuToggle) {
      onMenuToggle(newState);
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    if (onMenuToggle) {
      onMenuToggle(false);
    }
  };

  return (
    <>
      <header className="bg-white shadow-sm md:hidden">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center">
            <button
              className="text-gray-500 focus:outline-none"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="ml-3 text-xl font-semibold text-[#0F766E]">Poultry Manager</h1>
          </div>
          <div>
            <button className="p-1 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none">
              <User size={20} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="bg-[#0F766E] text-white">
            <nav className="px-2 py-2 space-y-1">
              <Link href="/">
                <a
                  className={`block px-3 py-2 rounded-md text-white ${
                    location === "/" ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"
                  }`}
                  onClick={closeMenu}
                >
                  Dashboard
                </a>
              </Link>
              <Link href="/finances">
                <a
                  className={`block px-3 py-2 rounded-md text-white ${
                    location === "/finances" ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"
                  }`}
                  onClick={closeMenu}
                >
                  Finances
                </a>
              </Link>
              <Link href="/chicken-health">
                <a
                  className={`block px-3 py-2 rounded-md text-white ${
                    location === "/chicken-health" ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"
                  }`}
                  onClick={closeMenu}
                >
                  Chicken Health
                </a>
              </Link>
              <Link href="/production">
                <a
                  className={`block px-3 py-2 rounded-md text-white ${
                    location === "/production" ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"
                  }`}
                  onClick={closeMenu}
                >
                  Production
                </a>
              </Link>
              <Link href="/research-notes">
                <a
                  className={`block px-3 py-2 rounded-md text-white ${
                    location === "/research-notes" ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"
                  }`}
                  onClick={closeMenu}
                >
                  Research Notes
                </a>
              </Link>
              <Link href="/maintenance">
                <a
                  className={`block px-3 py-2 rounded-md text-white ${
                    location === "/maintenance" ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"
                  }`}
                  onClick={closeMenu}
                >
                  Maintenance
                </a>
              </Link>
              <Link href="/reports">
                <a
                  className={`block px-3 py-2 rounded-md text-white ${
                    location === "/reports" ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"
                  }`}
                  onClick={closeMenu}
                >
                  Reports
                </a>
              </Link>
              <Link href="/settings">
                <a
                  className={`block px-3 py-2 rounded-md text-white ${
                    location === "/settings" ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"
                  }`}
                  onClick={closeMenu}
                >
                  Settings
                </a>
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default MobileMenu;
