interface MyAILogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  sm: "w-7 h-7 text-xs rounded-lg",
  md: "w-9 h-9 text-sm rounded-xl",
  lg: "w-12 h-12 text-base rounded-2xl",
  xl: "w-16 h-16 text-xl rounded-2xl",
};

const iconSizes = {
  sm: "w-4 h-4",
  md: "w-5 h-5",
  lg: "w-7 h-7",
  xl: "w-9 h-9",
};

export default function MyAILogo({ className = "", size = 'md' }: MyAILogoProps) {
  return (
    <div
      className={`bg-[#181a20] border border-[#2a2d36] text-[#3b82f6] flex items-center justify-center font-mono font-bold shadow-md shrink-0 ${sizeClasses[size]} ${className}`}
      style={{
        boxShadow: "0 2px 10px rgba(59, 130, 246, 0.15)"
      }}
    >
      <svg
        className={`${iconSizes[size]} text-[#3b82f6] fill-none stroke-current stroke-[2.5]`}
        viewBox="0 0 24 24"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    </div>
  );
}
