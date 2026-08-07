import { Bot, Sparkles } from "lucide-react";

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
  lg: "h-6 w-6",
  xl: "h-7 w-7",
};

export default function MyAILogo({ className = "", size = 'md' }: MyAILogoProps) {
  return (
    <div
      className={`bg-gradient-to-tr from-purple-600 via-blue-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/20 border border-purple-400/30 transition-transform hover:scale-105 shrink-0 ${sizeClasses[size]} ${className}`}
    >
      <Bot className={iconSizes[size]} />
    </div>
  );
}
