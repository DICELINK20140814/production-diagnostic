import Link from "next/link";
import { LogoWithFallback } from "@/components/LogoWithFallback";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-[#0A2643]">
      <header className="border-b-4 border-[#CEC1A1] bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <LogoWithFallback />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="max-w-3xl">
          <div className="mb-4 inline-flex rounded-full border border-[#CEC1A1] px-4 py-1 text-sm font-medium text-[#0A2643]">
            Production Profit Diagnostic
          </div>

          <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl">
            生産診断
          </h1>

          <p className="mb-10 text-lg leading-8 text-slate-600">
            生産計画、能力計画、段取り、設備稼働、品質、仕掛・滞留、
            改善基盤をもとに、生産改善ポテンシャルと主要な改善論点を可視化します。
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/production"
              className="rounded-xl bg-[#0A2643] px-8 py-4 text-white transition hover:opacity-90"
            >
              診断を開始する
            </Link>
          </div>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-[#CEC1A1]">
              対象
            </div>
            <div className="text-base leading-7 text-slate-700">
              量産 / 多品種少量 / 受注生産 / 組立・混流
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-[#CEC1A1]">
              出力
            </div>
            <div className="text-base leading-7 text-slate-700">
              改善スコア、改善余地、弱点TOP3、優先アクション
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 text-sm font-semibold text-[#CEC1A1]">
              用途
            </div>
            <div className="text-base leading-7 text-slate-700">
              営業ヒアリング、初回提案、工場・生産部門との対話
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
