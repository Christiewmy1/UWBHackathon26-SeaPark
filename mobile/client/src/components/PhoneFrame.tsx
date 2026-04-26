import { ReactNode } from "react";

interface PhoneFrameProps {
  children: ReactNode;
}

/**
 * Mobile-first frame. On small screens it fills the viewport;
 * on desktop it renders a centered phone preview so designers can review.
 */
export const PhoneFrame = ({ children }: PhoneFrameProps) => {
  return (
    <div className="min-h-screen w-full bg-gradient-surface flex items-center justify-center md:p-8">
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-glow opacity-70" />

      <div className="relative w-full md:w-[400px] md:h-[860px] h-screen md:rounded-[3rem] md:border md:border-white/10 md:shadow-elevated overflow-hidden bg-background">
        {children}
      </div>
    </div>
  );
};
