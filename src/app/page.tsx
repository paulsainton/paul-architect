import { Sparkles, ArrowRight, Layers, Search, Palette, Code, Zap, CheckCircle } from "lucide-react";
import Link from "next/link";

const TUNNELS = [
  { id: 1, label: "Collecte", icon: Layers, color: "bg-tunnel-1" },
  { id: 2, label: "Inspirations", icon: Search, color: "bg-tunnel-2" },
  { id: 3, label: "Clone", icon: Zap, color: "bg-tunnel-3" },
  { id: 4, label: "Identité", icon: Palette, color: "bg-tunnel-4" },
  { id: 5, label: "Analyse", icon: Sparkles, color: "bg-tunnel-5" },
  { id: 6, label: "Code", icon: Code, color: "bg-tunnel-6" },
  { id: 7, label: "Maquettes", icon: Sparkles, color: "bg-tunnel-7" },
  { id: 8, label: "QA", icon: CheckCircle, color: "bg-tunnel-8" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Paul Architect</h1>
          <p className="text-sm text-text-muted">Pipeline design ultime</p>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-12">
        {TUNNELS.map((t, i) => (
          <div key={t.id} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg ${t.color} flex items-center justify-center`} title={t.label}>
              <t.icon className="w-4 h-4 text-white" />
            </div>
            {i < TUNNELS.length - 1 && <ArrowRight className="w-3 h-3 text-text-muted" />}
          </div>
        ))}
      </div>

      <Link
        href="/pipeline/new"
        className="flex items-center gap-2 px-6 py-3 rounded-lg bg-accent hover:bg-accent-hover text-white font-medium transition-colors"
      >
        Nouveau pipeline
        <ArrowRight className="w-4 h-4" />
      </Link>

      <p className="text-xs text-text-muted mt-8">
        Bench (3010) + Stitch (3012) + Clone Architect + LiveLoop (3015)
      </p>
    </div>
  );
}
