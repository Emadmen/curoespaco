import {
  Blocks,
  Brain,
  ClipboardList,
  HeartHandshake,
  House,
  Leaf,
  MessageCircleHeart,
  Puzzle,
  Sparkles,
  Sprout,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

/** Icons available to services (selectable in the admin). */
export const serviceIcons: Record<string, { icon: LucideIcon; label: string }> = {
  user: { icon: UserRound, label: "Pessoa" },
  users: { icon: UsersRound, label: "Grupo" },
  blocks: { icon: Blocks, label: "Blocos (infantil)" },
  sprout: { icon: Sprout, label: "Rebento" },
  "heart-handshake": { icon: HeartHandshake, label: "Coração / casal" },
  home: { icon: House, label: "Casa / família" },
  clipboard: { icon: ClipboardList, label: "Avaliação" },
  brain: { icon: Brain, label: "Mente" },
  leaf: { icon: Leaf, label: "Folha" },
  message: { icon: MessageCircleHeart, label: "Conversa" },
  puzzle: { icon: Puzzle, label: "Puzzle" },
  sparkles: { icon: Sparkles, label: "Brilho" },
};

export function ServiceIcon({ name, className }: { name: string; className?: string }) {
  const Icon = (serviceIcons[name] ?? serviceIcons.sparkles).icon;
  return <Icon className={className} aria-hidden="true" strokeWidth={1.6} />;
}
