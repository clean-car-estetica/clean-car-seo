"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
    setCarregando(false);

    if (error) {
      setErro("E-mail ou senha inválidos.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-carbon flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-card border border-card-line rounded-2xl p-8">
        <h1 className="font-display font-extrabold text-2xl text-steel mb-1">
          CLEAN <span className="text-verniz-shine">CAR</span>
        </h1>
        <p className="text-steel-line text-sm mb-6">Console administrativo</p>

        <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">E-mail</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-3 rounded-lg bg-carbon border border-card-line text-steel focus:outline-none focus:border-verniz"
        />

        <label className="block text-xs font-bold uppercase tracking-wide text-steel-line mb-1">Senha</label>
        <input
          type="password"
          required
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full mb-6 px-4 py-3 rounded-lg bg-carbon border border-card-line text-steel focus:outline-none focus:border-verniz"
        />

        {erro && <p className="text-warn text-sm mb-4">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="w-full rounded-full bg-verniz text-carbon font-display font-bold py-3 hover:bg-verniz-shine transition-colors disabled:opacity-50"
        >
          {carregando ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
