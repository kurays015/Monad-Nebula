import { ReactNode } from "react";

interface ToggleButtonProps {
  isVisible: boolean;
  onToggle: () => void;
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  title: string;
  children?: ReactNode;
}

export default function ToggleButton({
  isVisible,
  onToggle,
  position,
  title,
  children,
}: ToggleButtonProps) {
  const getPositionClasses = () => {
    switch (position) {
      case "top-left":
        return "fixed top-4 left-4";
      case "top-right":
        return "fixed top-4 right-4";
      case "bottom-left":
        return "fixed bottom-4 left-4";
      case "bottom-right":
        return "fixed bottom-4 right-4";
      default:
        return "fixed top-4 right-4";
    }
  };

  return (
    <button
      onClick={onToggle}
      className={`${getPositionClasses()} z-50 w-12 h-12 bg-purple-600 hover:bg-purple-700 rounded-full shadow-lg border border-purple-500/40 transition-all duration-300 flex items-center justify-center group cursor-pointer`}
      title={title}
    >
      <div className="text-white text-lg font-bold group-hover:scale-110 transition-transform duration-200">
        {children || (isVisible ? "−" : "+")}
      </div>
    </button>
  );
}
