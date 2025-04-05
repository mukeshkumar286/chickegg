import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  DollarSign,
  Home,
  FileText,
  Stethoscope,
  Egg,
  Wrench,
  BarChart2,
  Settings,
  HelpCircle
} from "lucide-react";

type NavItemProps = {
  href: string;
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
};

const NavItem = ({ href, icon, label, isActive }: NavItemProps) => {
  return (
    <Link href={href}>
      <a
        className={cn(
          "flex items-center px-2 py-3 text-white rounded-md group transition-colors",
          isActive ? "bg-[#0e7490]" : "hover:bg-[#0e7490]"
        )}
      >
        <span className="mr-3 text-white">{icon}</span>
        <span>{label}</span>
      </a>
    </Link>
  );
};

const Sidebar = () => {
  const [location] = useLocation();

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <div className="flex md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-[#0F766E] text-white">
        <div className="flex items-center justify-center h-16 px-4 border-b border-[#0e6070]">
          <h1 className="text-xl font-bold">Poultry Manager</h1>
        </div>
        <div className="flex flex-col flex-grow px-4 py-4 overflow-y-auto">
          <nav className="flex-1 space-y-1">
            <NavItem 
              href="/" 
              icon={<Home size={18} />} 
              label="Dashboard" 
              isActive={isActive("/")} 
            />
            <NavItem 
              href="/finances" 
              icon={<DollarSign size={18} />} 
              label="Finances" 
              isActive={isActive("/finances")} 
            />
            <NavItem 
              href="/chicken-health" 
              icon={<Stethoscope size={18} />} 
              label="Chicken Health" 
              isActive={isActive("/chicken-health")} 
            />
            <NavItem 
              href="/production" 
              icon={<Egg size={18} />} 
              label="Production" 
              isActive={isActive("/production")} 
            />
            <NavItem 
              href="/research-notes" 
              icon={<FileText size={18} />} 
              label="Research Notes" 
              isActive={isActive("/research-notes")} 
            />
            <NavItem 
              href="/maintenance" 
              icon={<Wrench size={18} />} 
              label="Maintenance" 
              isActive={isActive("/maintenance")} 
            />
            <NavItem 
              href="/reports" 
              icon={<BarChart2 size={18} />} 
              label="Reports" 
              isActive={isActive("/reports")} 
            />
          </nav>
          <div className="pt-4 mt-6 border-t border-[#0e6070]">
            <NavItem 
              href="/settings" 
              icon={<Settings size={18} />} 
              label="Settings" 
              isActive={isActive("/settings")} 
            />
            <NavItem 
              href="/help" 
              icon={<HelpCircle size={18} />} 
              label="Help & Support" 
              isActive={isActive("/help")} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
