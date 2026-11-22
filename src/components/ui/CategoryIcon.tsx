import {
  Calculator,
  FileText,
  Image as ImageIcon,
  Sparkles,
  Search,
  Code2,
  GraduationCap,
  Headphones,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Calculator,
  FileText,
  Image: ImageIcon,
  Sparkles,
  Search,
  Code2,
  GraduationCap,
  Headphones,
};

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? Calculator;
  return <Icon className={className} aria-hidden="true" />;
}
