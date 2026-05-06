import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/logo.png";

const navItems = [
  { to: "/", label: "Inicio", icon: "dashboard" },
  { to: "/clientes", label: "Clientes", icon: "group" },
  { to: "/prestamos", label: "Préstamos", icon: "account_balance_wallet" },
  { to: "/pagos", label: "Pagos", icon: "payments" },
  { to: "/reportes", label: "Reportes", icon: "assessment" },
] as const;

export function AppShell({
  title,
  children,
  action,
}: {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  const { pathname } = useLocation();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Cargando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <header className="fixed top-0 inset-x-0 z-40 h-16 bg-surface-elevated/95 backdrop-blur border-b border-border flex items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="Pool Solo Pool" className="w-10 h-10 rounded-full object-cover ring-2 ring-accent" />
          <div className="leading-tight">
            <p className="text-[10px] font-bold tracking-[0.2em] text-accent-foreground/70">POOL SOLO POOL</p>
            <h1 className="text-base font-bold text-primary -mt-0.5">{title}</h1>
          </div>
        </Link>
        <div className="flex items-center gap-1">
          {action}
          <button
            onClick={() => supabase.auth.signOut()}
            title="Cerrar sesión"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-secondary text-primary transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </header>

      <main className="pt-20 px-4 max-w-2xl mx-auto">{children}</main>

      <nav className="fixed bottom-0 inset-x-0 z-40 bg-surface-elevated/95 backdrop-blur border-t border-border">
        <div className="max-w-2xl mx-auto flex justify-around items-stretch px-2 py-2">
          {navItems.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center justify-center min-w-[56px] py-1.5 px-2 rounded-2xl transition-all duration-200 active:scale-90 ${
                  active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[22px]"
                  style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
                >
                  {item.icon}
                </span>
                <span className="text-[10px] font-semibold mt-0.5">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
