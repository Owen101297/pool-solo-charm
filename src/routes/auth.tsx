import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { z } from "zod";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceder — Pool Solo Pool" },
      { name: "description", content: "Inicia sesión o crea tu cuenta de Pool Solo Pool." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Email inválido").max(255),
  password: z.string().min(6, "Mínimo 6 caracteres").max(72),
});

function AuthPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/" });
  }, [user, loading, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Revisa tu email para confirmar.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Error de autenticación");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "var(--gradient-primary)" }}>
      <div className="w-full max-w-md bg-card rounded-3xl shadow-2xl p-8">
        <div className="flex flex-col items-center text-center mb-6">
          <img src={logo} alt="Pool Solo Pool" className="w-20 h-20 rounded-full ring-4 ring-accent" />
          <h1 className="mt-4 text-2xl font-bold text-primary">POOL SOLO POOL</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">Email</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1">Contraseña</label>
            <input
              type="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-3 bg-background border border-border rounded-lg outline-none focus:border-primary"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 bg-accent text-accent-foreground rounded-xl font-bold shadow-md active:scale-[0.98] transition-transform disabled:opacity-60"
          >
            {busy ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
          </button>
        </form>

        <button
          onClick={() => setMode((m) => (m === "login" ? "signup" : "login"))}
          className="w-full text-center mt-4 text-sm text-primary font-semibold"
        >
          {mode === "login" ? "¿No tienes cuenta? Regístrate" : "Ya tengo una cuenta"}
        </button>

        <Link to="/" className="block text-center mt-6 text-xs text-muted-foreground hover:underline">
          Volver
        </Link>
      </div>
    </div>
  );
}
