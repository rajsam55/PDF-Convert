import * as Icons from "lucide-react";

interface LucideIconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function LucideIcon({ name, className = "", size = 20 }: LucideIconProps) {
  // Map icons to avoid bundler issues if tree shaking is strict
  const IconComponent = (Icons as any)[name];

  if (!IconComponent) {
    // Fallback icon
    return <Icons.FileQuestion className={className} size={size} />;
  }

  return <IconComponent className={className} size={size} />;
}
