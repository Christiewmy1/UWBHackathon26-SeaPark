import { NavLink } from "react-router-dom";
import { Map, MessageCircle, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", icon: Map, label: "Map" },
  { to: "/report", icon: Plus, label: "Report", primary: true },
  { to: "/husky", icon: MessageCircle, label: "Husky" },
];

export const BottomNav = () => {
  return (
    <nav className="absolute bottom-0 inset-x-0 z-30 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-3 mb-3 glass rounded-3xl shadow-card px-2 py-2">
        <ul className="flex items-end justify-between">
          {items.map(({ to, icon: Icon, label, primary }) => (
            <li key={to} className="flex-1">
              <NavLink to={to} end={to === "/"}>
                {({ isActive }) =>
                  primary ? (
                    <div className="flex flex-col items-center -mt-6">
                      <div
                        className={cn(
                          "h-14 w-14 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow ease-soft transition-transform",
                          isActive && "scale-105"
                        )}
                      >
                        <Icon className="h-7 w-7 text-primary-foreground" strokeWidth={2.5} />
                      </div>
                      <span className="text-[10px] mt-1 text-muted-foreground font-medium">{label}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 py-2">
                      <Icon
                        className={cn(
                          "h-5 w-5 transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                        strokeWidth={isActive ? 2.5 : 2}
                      />
                      <span
                        className={cn(
                          "text-[10px] font-medium transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        {label}
                      </span>
                    </div>
                  )
                }
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
