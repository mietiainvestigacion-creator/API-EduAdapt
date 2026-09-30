import { GraduationCap, Sparkle } from "lucide-react";

interface Props {
  size?: number;
  withText?: boolean;
}

export function EduLogo({ size = 36, withText = true }: Props) {
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="relative flex items-center justify-center rounded-xl gradient-hero shadow-glow"
        style={{ width: size, height: size }}
      >
        <GraduationCap className="text-white" style={{ width: size * 0.55, height: size * 0.55 }} />
        <Sparkle
          className="absolute -top-1 -right-1 text-warning fill-warning"
          style={{ width: size * 0.3, height: size * 0.3 }}
        />
      </div>
      {withText && (
        <div className="leading-tight">
          <div className="font-display text-lg font-bold tracking-tight">EduAdapt</div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
            Agente Pedagógico
          </div>
        </div>
      )}
    </div>
  );
}
