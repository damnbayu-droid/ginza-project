import { Code } from "lucide-react";

interface MyAILogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: "w-7 h-7 rounded-xl",
  md: "w-9 h-9 rounded-xl",
  lg: "w-12 h-12 rounded-2xl",
  xl: "w-14 h-14 rounded-2xl",
};

const iconSizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-7 w-7",
  xl: "h-8 w-8",
};

export default function MyAILogo({ className = "", size = 'md' }: MyAILogoProps) {
  return (
    <div
      className={`bg-[#5B8DEF]/10 border border-[#5B8DEF]/20 text-[#5B8DEF] flex items-center justify-center shadow-lg transition-transform hover:scale-105 shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <Code className={iconSizes[size]} />
    </div>
  );
}
