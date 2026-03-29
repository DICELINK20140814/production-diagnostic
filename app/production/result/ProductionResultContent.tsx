"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  estimateImpactOkuRange,
  formatImpactRangeJa,
} from "@/lib/improvementImpactEstimate";

type Driver = {
  key: string;
  label: string;
  rawAverage: number;
  weight: number;
  weightedScore: number;
  comment: string;
};

type ResultPayload = {
  businessType: string;
  revenueOku: number;
  totalScore: number;
  rank: string;
  rankComment: string;
  improvementPotential: number;
  improvementRange: string;
  topDrivers: Driver[];
  priorityAction: string;
};

const BUSINESS_LABELS: Record<string, string> = {
  mass_production: "量産中心",
  multi_small: "多品種少量",
  make_to_order: "受注生産",
  assembly_mixed: "組立・混流",
};

export default function ProductionResultContent() {
  const searchParams = useSearchParams();
  const raw = searchParams.get("data");

  if (!raw) {
    return (
      <main className="min-h-screen bg-white p-10 text-[#0A2643]">
        <div className="mx-auto max-w-4xl">
          <p className="mb-6">結果データが見つかりませんでした。</p>
          <Link
            href="/production"
            className="rounded-xl bg-[#0A2643] px-6 py-3 text-white"
          >
            診断画面に戻る
          </Link>
        </div>
      </main>
    );
  }

  // get() は既にデコード済み。JSON 内の「%」で decodeURIComponent を重ねると例外になる。
  let data: ResultPayload;
  try {
    data = JSON.parse(raw) as ResultPayload;
  } catch {
    return (
      <main className="min-h-screen bg-white p-10 text-[#0A2643]">
        <div className="mx-auto max-w-4xl">
          <p className="mb-6">
            結果データの形式が正しくないか、URL が壊れています。もう一度診断をお試しください。
          </p>
          <Link
            href="/production"
            className="rounded-xl bg-[#0A2643] px-6 py-3 text-white"
          >
            診断画面に戻る
          </Link>
        </div>
      </main>
    );
  }

  const { lowOku, highOku } = estimateImpactOkuRange(
    data.revenueOku,
    data.improvementPotential
  );
  const impactRangeText = formatImpactRangeJa(lowOku, highOku);
  const impactCardLabel =
    highOku > 0 ? `${impactRangeText}規模` : impactRangeText;

  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0A2643]">
      <header className="border-b-4 border-[#CEC1A1] bg-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-4">
          <img
            src="/logo.png"
            alt="ダイスリンク株式会社"
            className="h-10 w-auto"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const next = target.nextElementSibling as HTMLElement | null;
              if (next) next.style.display = "block";
            }}
          />
          <div
            className="hidden text-sm font-medium tracking-wide text-[#0A2643]"
            style={{ display: "none" }}
          >
            ダイスリンク株式会社
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <section className="mb-8 rounded-3xl border border-[#CEC1A1] bg-white p-8 shadow-sm">
          <div className="mb-2 text-sm font-semibold tracking-wide text-[#CEC1A1]">
            生産診断結果
          </div>
          <div className="mb-3 text-4xl font-bold md:text-5xl">
            {data.totalScore.toFixed(0)}点
          </div>
          <div className="text-lg text-slate-600">
            {data.rank}ランク / {data.rankComment}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 text-2xl font-bold">前提条件</div>
          <div className="space-y-2 text-base leading-8 text-slate-700">
            <div>対象業種：{BUSINESS_LABELS[data.businessType]}</div>
            <div>売上規模：{data.revenueOku}億円</div>
          </div>
        </section>

        <section className="mb-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-[#CEC1A1]">
              改善余地（推定）
            </div>
            <div className="text-2xl font-bold">
              約{data.improvementPotential.toFixed(0)}%
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-[#CEC1A1]">
              一般的な改善レンジ
            </div>
            <div className="text-2xl font-bold">{data.improvementRange}</div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-[#CEC1A1]">
              改善インパクトの目安
            </div>
            <div className="text-2xl font-bold">{impactCardLabel}</div>
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 text-base leading-8 text-slate-700">
            本診断結果から、改善余地は約
            <span className="font-bold text-[#0A2643]">
              {data.improvementPotential.toFixed(0)}%
            </span>
            と推定されます。
          </div>
          <div className="text-base leading-8 text-slate-700">
            一般的に製造業における生産改善は
            <span className="font-bold text-[#0A2643]">
              {" "}
              {data.improvementRange}{" "}
            </span>
            程度の改善余地が存在すると言われています。
            {highOku > 0 ? (
              <>
                売上規模と改善余地から単純換算すると、
                <span className="font-bold text-[#0A2643]">
                  {impactRangeText}規模
                </span>
                の改善インパクトが見込まれる可能性があります。
              </>
            ) : (
              <>改善余地が小さく、金額面での大きな効果は見込みにくい可能性があります。</>
            )}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-5 text-2xl font-bold">主な改善論点</div>
          <div className="space-y-5">
            {data.topDrivers.map((driver, index) => (
              <div key={driver.key} className="rounded-xl border border-slate-100 p-5">
                <div className="mb-2 text-lg font-semibold">
                  {index + 1}. {driver.label}（{driver.rawAverage.toFixed(0)}点）
                </div>
                <div className="text-base leading-8 text-slate-600">
                  {driver.comment}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 text-2xl font-bold">優先的に取り組むべき施策</div>
          <div className="text-base leading-8 text-slate-700">
            {data.priorityAction}
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-4 text-2xl font-bold">詳細診断のご案内</div>
          <div className="text-base leading-8 text-slate-700">
            本診断はヒアリングベースの簡易評価です。実データを用いた詳細分析により、
            ボトルネック工程、停止ロス、不良コスト、仕掛滞留の改善ポテンシャルを
            より具体的に算出できます。
          </div>
        </section>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-3 text-lg font-semibold">注意書き</div>
          <div className="text-sm leading-7 text-slate-500">
            ※本診断結果はヒアリング内容に基づく簡易評価であり、
            実際の改善効果は詳細分析により変動します。
            金額の目安は売上規模と改善余地から算出した概算であり、原価構造により実額は異なります。
          </div>
        </section>

        <div className="flex gap-4">
          <Link
            href="/production"
            className="rounded-xl bg-[#0A2643] px-6 py-3 text-white transition hover:opacity-90"
          >
            入力画面に戻る
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-[#0A2643] px-6 py-3 text-[#0A2643] transition hover:bg-slate-50"
          >
            トップに戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
