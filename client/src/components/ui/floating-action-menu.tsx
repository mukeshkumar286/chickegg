import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";

interface ActionItem {
  label: string;
  icon: string;
  onClick: () => void;
}

const FloatingActionMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  // Define page-specific actions
  const getPageActions = (): ActionItem[] => {
    switch (location) {
      case "/finances":
        return [
          {
            label: "Add Financial Entry",
            icon: "ri-money-dollar-circle-line",
            onClick: () => {
              const addBtn = document.querySelector(".finances-add-btn") as HTMLButtonElement;
              if (addBtn) addBtn.click();
              setIsOpen(false);
            }
          }
        ];
      case "/production":
        return [
          {
            label: "Record Production",
            icon: "ri-egg-line",
            onClick: () => {
              const addBtn = document.querySelector(".production-add-btn") as HTMLButtonElement;
              if (addBtn) addBtn.click();
              setIsOpen(false);
            }
          }
        ];
      case "/inventory":
        return [
          {
            label: "Add Inventory Item",
            icon: "ri-store-2-line",
            onClick: () => {
              const addBtn = document.querySelector(".inventory-add-btn") as HTMLButtonElement;
              if (addBtn) addBtn.click();
              setIsOpen(false);
            }
          }
        ];
      case "/health":
        return [
          {
            label: "Add Health Record",
            icon: "ri-heart-pulse-line",
            onClick: () => {
              const addBtn = document.querySelector(".health-add-btn") as HTMLButtonElement;
              if (addBtn) addBtn.click();
              setIsOpen(false);
            }
          }
        ];
      case "/maintenance":
        return [
          {
            label: "Add Maintenance Task",
            icon: "ri-tools-line",
            onClick: () => {
              const addBtn = document.querySelector(".maintenance-add-btn") as HTMLButtonElement;
              if (addBtn) addBtn.click();
              setIsOpen(false);
            }
          }
        ];
      case "/research":
        return [
          {
            label: "Add Research Note",
            icon: "ri-file-text-line",
            onClick: () => {
              const addBtn = document.querySelector(".research-add-btn") as HTMLButtonElement;
              if (addBtn) addBtn.click();
              setIsOpen(false);
            }
          }
        ];
      case "/":
        return [
          {
            label: "Record Production",
            icon: "ri-egg-line",
            onClick: () => {
              window.location.href = "/production";
              setIsOpen(false);
            }
          },
          {
            label: "Add Financial Entry",
            icon: "ri-money-dollar-circle-line",
            onClick: () => {
              window.location.href = "/finances";
              setIsOpen(false);
            }
          },
          {
            label: "Add Task",
            icon: "ri-tools-line",
            onClick: () => {
              window.location.href = "/maintenance";
              setIsOpen(false);
            }
          }
        ];
      default:
        return [];
    }
  };
  
  const actions = getPageActions();
  
  // If no actions for this page, don't show the menu
  if (actions.length === 0) return null;
  
  return (
    <div className="fixed bottom-6 right-6 z-10">
      {/* Action menu items */}
      <div className={cn(
        "flex flex-col-reverse gap-2 mb-2 transition-all duration-300",
        isOpen ? "opacity-100 transform translate-y-0" : "opacity-0 pointer-events-none transform translate-y-4"
      )}>
        {actions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            className="h-12 shadow-md px-4 flex items-center gap-2 bg-green-100 text-green-800 hover:bg-green-200 rounded-full border border-green-300"
          >
            <i className={`${action.icon} text-lg text-green-600`}></i>
            <span>{action.label}</span>
          </Button>
        ))}
      </div>
      
      {/* Main action button */}
      <Button
        onClick={toggleMenu}
        className={cn(
          "h-14 w-14 rounded-full shadow-lg p-0 transition-all duration-300",
          isOpen ? "bg-red-600 hover:bg-red-700 rotate-45" : "bg-green-600 hover:bg-green-700"
        )}
      >
        <i className="ri-add-line text-2xl text-white"></i>
      </Button>
    </div>
  );
};

export default FloatingActionMenu;