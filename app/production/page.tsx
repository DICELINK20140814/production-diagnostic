"use client";

import { useMemo, useState } from "react"; import { useRouter } from "next/navigation";

type BusinessType =
  | "mass_production"
  | "multi_small"
  | "make_to_order"
  | "assembly_mixed";

type DriverKey =
  | "planning"
  | "capacity"
  | "setup"
  | "equipment"
  | "quality"
  | "wip"
  | "visibility";

type Question = {
  id: string;
  section: string;
  text: string;
  driver: DriverKey;
};

const DRIVER_LABELS: Record<DriverKey, string> = {
  planning: "需要・生産計画",
  capacity: "能力計画",
  setup: "段取り・切替",
  equipment: "設備稼働",
  quality: "品質・不良",
  wip: "仕掛・滞留",
  visibility: "可視化・改善基盤",
};

const DRIVER_COMMENTS: Record<DriverKey, string> = {
  planning:
    "需要予測や生産計画の精度に改善余地があり、計画変更・割込み・生産ロスの要因になっている可能性があります。",
  capacity:
    "設備・人員の能力と計画の整合が十分でなく、能力不足または過剰が発生している可能性があります。",
  setup:
    "段取り・切替に起因するロスが大きく、段取り時間や生産順序の最適化余地がある可能性があります。",
  equipment:
    "設備停止・手待ち・保全不足により、本来の生産能力を十分に活用できていない可能性があります。",
  quality:
    "不良・手直し・再加工が発生し、品質ロスが利益を圧迫している可能性があります。",
  wip:
    "仕掛在庫や工程間滞留が多く、リードタイム長期化や資金拘束の要因になっている可能性があります。",
  visibility:
    "KPIの定義・可視化・改善サイクルが不十分で、問題が継続的に是正されていない可能性があります。",
};

const PRIORITY_ACTIONS: Record<DriverKey, string> = {
  planning:
    "まずは需要予測と生産計画の精度を検証し、計画変更・割込み要因の可視化から着手することが重要と考えられます。",
  capacity:
    "まずは設備・人員能力の定量把握と、ボトルネック工程の明確化から着手することが重要と考えられます。",
  setup:
    "まずは段取り時間の実測と、段取り短縮および生産順序最適化から着手することが重要と考えられます。",
  equipment:
    "まずは設備停止要因の分類と稼働率の可視化を行い、予防保全と停止ロス低減から着手することが重要と考えられます。",
  quality:
    "まずは不良率・手直し量・品質ロスコストの可視化を進め、原因分析と再発防止から着手することが重要と考えられます。",
  wip:
    "まずは工程間仕掛在庫と滞留の実態を把握し、リードタイム短縮と仕掛削減から着手することが重要と考えられます。",
  visibility:
    "まずはKPI定義と現場可視化を進め、改善テーマの継続運営基盤づくりから着手することが重要と考えられます。",
};

const WEIGHTS: Record<BusinessType, Record<DriverKey, number>> = {
  mass_production: {
    planning: 1.3,
    capacity: 1.5,
    setup: 1.2,
    equipment: 1.5,
    quality: 1.4,
    wip: 1.1,
    visibility: 1.2,
  },
  multi_small: {
    planning: 1.5,
    capacity: 1.2,
    setup: 1.5,
    equipment: 1.2,
    quality: 1.3,
    wip: 1.4,
    visibility: 1.3,
  },
  make_to_order: {
    planning: 1.4,
    capacity: 1.3,
    setup: 1.3,
    equipment: 1.2,
    quality: 1.3,
    wip: 1.5,
    visibility: 1.3,
  },
  assembly_mixed: {
    planning: 1.4,
    capacity: 1.4,
    setup: 1.4,
    equipment: 1.3,
    quality: 1.4,
    wip: 1.3,
    visibility: 1.3,
  },
};

const QUESTIONS: Question[] = [
  // ① 需要・生産計画
  {
    id: "q1",
    section: "需要・生産計画",
    text: "需要予測は過去実績データに基づいて行われている",
    driver: "planning",
  },
  {
    id: "q2",
    section: "需要・生産計画",
    text: "生産計画は需要予測と連動している",
    driver: "planning",
  },
  {
    id: "q3",
    section: "需要・生産計画",
    text: "生産計画の精度（計画 vs 実績）を定期的に検証している",
    driver: "planning",
  },
  {
    id: "q4",
    section: "需要・生産計画",
    text: "計画変更（特急・割込み）の発生要因が分析されている",
    driver: "planning",
  },

  // ② 能力計画
  {
    id: "q5",
    section: "能力計画",
    text: "設備・人員の能力が定量的に把握されている",
    driver: "capacity",
  },
  {
    id: "q6",
    section: "能力計画",
    text: "生産計画と能力の整合性が取れている",
    driver: "capacity",
  },
  {
    id: "q7",
    section: "能力計画",
    text: "ボトルネック工程が特定され、それが生産全体の制約になっていることを理解している",
    driver: "capacity",
  },
  {
    id: "q8",
    section: "能力計画",
    text: "能力不足・過剰の発生要因が分析されている",
    driver: "capacity",
  },

  // ③ 段取り・切替
  {
    id: "q9",
    section: "段取り・切替",
    text: "段取り時間が測定・管理されている",
    driver: "setup",
  },
  {
    id: "q10",
    section: "段取り・切替",
    text: "段取り短縮の改善活動が実施されている",
    driver: "setup",
  },
  {
    id: "q11",
    section: "段取り・切替",
    text: "生産順序（シーケンス）が最適化されている",
    driver: "setup",
  },
  {
    id: "q12",
    section: "段取り・切替",
    text: "段取り起因のロスが把握されている",
    driver: "setup",
  },

  // ④ 設備稼働
  {
    id: "q13",
    section: "設備稼働",
    text: "設備稼働率（稼働・停止）が把握されている",
    driver: "equipment",
  },
  {
    id: "q14",
    section: "設備稼働",
    text: "設備停止の原因（故障・待ち）が分類されている",
    driver: "equipment",
  },
  {
    id: "q15",
    section: "設備稼働",
    text: "稼働率向上の改善活動が行われている",
    driver: "equipment",
  },
  {
    id: "q16",
    section: "設備稼働",
    text: "設備の予防保全が実施されている",
    driver: "equipment",
  },
  {
    id: "q17",
    section: "設備稼働",
    text: "設備の実効能力（理論 vs 実績）が把握されている",
    driver: "equipment",
  },

  // ⑤ 品質・不良
  {
    id: "q18",
    section: "品質・不良",
    text: "不良率が工程別に把握されている",
    driver: "quality",
  },
  {
    id: "q19",
    section: "品質・不良",
    text: "不良原因が分析されている",
    driver: "quality",
  },
  {
    id: "q20",
    section: "品質・不良",
    text: "再発防止の仕組みが機能している",
    driver: "quality",
  },
  {
    id: "q21",
    section: "品質・不良",
    text: "手直し・再加工の発生量が把握されている",
    driver: "quality",
  },
  {
    id: "q22",
    section: "品質・不良",
    text: "品質ロスがコストとして認識されている",
    driver: "quality",
  },

  // ⑥ 仕掛・滞留
  {
    id: "q23",
    section: "仕掛・滞留",
    text: "工程間の仕掛在庫が把握されている",
    driver: "wip",
  },
  {
    id: "q24",
    section: "仕掛・滞留",
    text: "滞留品（止まっている仕掛）が特定されている",
    driver: "wip",
  },
  {
    id: "q25",
    section: "仕掛・滞留",
    text: "リードタイムが工程別に把握されている",
    driver: "wip",
  },
  {
    id: "q26",
    section: "仕掛・滞留",
    text: "工程間の待ち時間が把握されている",
    driver: "wip",
  },
  {
    id: "q27",
    section: "仕掛・滞留",
    text: "過剰仕掛の発生原因が分析されている",
    driver: "wip",
  },
  {
    id: "q28",
    section: "仕掛・滞留",
    text: "生産リードタイム短縮の取り組みがある",
    driver: "wip",
  },

  // ⑦ 可視化・改善基盤
  {
    id: "q29",
    section: "可視化・改善基盤",
    text: "KPI（生産性・稼働・品質）が定義されている",
    driver: "visibility",
  },
  {
    id: "q30",
    section: "可視化・改善基盤",
    text: "KPIが定期的にモニタリングされている",
    driver: "visibility",
  },
  {
    id: "q31",
    section: "可視化・改善基盤",
    text: "現場で数値が可視化されている",
    driver: "visibility",
  },
  {
    id: "q32",
    section: "可視化・改善基盤",
    text: "問題発生時に原因分析が行われる",
    driver: "visibility",
  },
  {
    id: "q33",
    section: "可視化・改善基盤",
    text: "改善活動が継続的に行われている",
    driver: "visibility",
  },
  {
    id: "q34",
    section: "可視化・改善基盤",
    text: "改善結果が数値で評価されている",
    driver: "visibility",
  },

  // ⑧ KPI実績把握
  {
    id: "q35",
    section: "KPI・コスト認識",
    text: "生産リードタイムは適正だと考えている",
    driver: "wip",
  },
  {
    id: "q36",
    section: "KPI・コスト認識",
    text: "設備稼働率は十分に活用できている",
    driver: "equipment",
  },
  {
    id: "q37",
    section: "KPI・コスト認識",
    text: "不良率は利益に影響しない水準である",
    driver: "quality",
  },
  {
    id: "q38",
    section: "KPI・コスト認識",
    text: "仕掛在庫は過剰ではないと考えている",
    driver: "wip",
  },

  // ⑨ コスト接続
  {
    id: "q39",
    section: "KPI・コスト認識",
    text: "設備停止や手待ちは利益に影響していない",
    driver: "equipment",
  },
  {
    id: "q40",
    section: "KPI・コスト認識",
    text: "不良・手直しは利益を圧迫していない",
    driver: "quality",
  },
];

const SECTION_ORDER = [
  "需要・生産計画",
  "能力計画",
  "段取り・切替",
  "設備稼働",
  "品質・不良",
  "仕掛・滞留",
  "可視化・改善基盤",
  "KPI・コスト認識",
] as const;

type Option = {
  label: string;
  score: number;
};

const OPTIONS: Option[] = [
  { label: "十分できている", score: 100 },
  { label: "一部できている", score: 70 },
  { label: "課題あり", score: 40 },
  { label: "大きな課題", score: 10 },
  { label: "不明", score: 20 },
];

function getRank(score: number) {
  if (score >= 80) return "S";
  if (score >= 60) return "A";
  if (score >= 40) return "B";
  return "C";
}

function getRankComment(score: number) {
  if (score >= 80) return "最適化が進んでいる状態です。";
  if (score >= 60) return "改善余地がある状態です。";
  if (score >= 40) return "構造的な課題が存在する状態です。";
  return "抜本的な見直しが必要な状態です。";
}

function getImprovementPotential(score: number) {
  return 100 - score;
}

function getImprovementRange(score: number) {
  if (score >= 80) return "5%未満";
  if (score >= 60) return "5〜10%";
  if (score >= 40) return "10〜20%";
  return "20%以上";
}

export default function ProductionPage() {
  const router = useRouter();
  const [businessType, setBusinessType] =
    useState<BusinessType>("mass_production");
  const [revenueOku, setRevenueOku] = useState<string>("");
  const [answers, setAnswers] = useState<Record<string, number>>(
    Object.fromEntries(QUESTIONS.map((q) => [q.id, 0]))
  );

  const groupedQuestions = useMemo(() => {
    return SECTION_ORDER.map((section) => ({
      section,
      items: QUESTIONS.filter((q) => q.section === section),
    }));
  }, []);

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = () => {
    const revenueOkuNum = Number(revenueOku);

    if (!Number.isFinite(revenueOkuNum) || revenueOkuNum <= 0) {
      alert("売上規模（億円）を入力してください。");
      return;
    }

    const driverQuestionMap: Record<DriverKey, number[]> = {
      planning: [],
      capacity: [],
      setup: [],
      equipment: [],
      quality: [],
      wip: [],
      visibility: [],
    };

    QUESTIONS.forEach((q) => {
      driverQuestionMap[q.driver].push(answers[q.id] ?? 20);
    });

    const weightedDriverScores = Object.entries(driverQuestionMap).map(
      ([driver, scores]) => {
        const rawAverage =
          scores.length > 0
            ? scores.reduce((sum, current) => sum + current, 0) / scores.length
            : 20;

        const weight = WEIGHTS[businessType][driver as DriverKey];
        const weightedScore = rawAverage * weight;

        return {
          key: driver as DriverKey,
          label: DRIVER_LABELS[driver as DriverKey],
          rawAverage,
          weight,
          weightedScore,
          comment: DRIVER_COMMENTS[driver as DriverKey],
        };
      }
    );

    const totalScore =
      weightedDriverScores.reduce((sum, d) => sum + d.weightedScore, 0) /
      weightedDriverScores.reduce((sum, d) => sum + d.weight, 0);

    const rank = getRank(totalScore);
    const rankComment = getRankComment(totalScore);
    const improvementPotential = getImprovementPotential(totalScore);
    const improvementRange = getImprovementRange(totalScore);

    const topDrivers = [...weightedDriverScores]
      .sort((a, b) => a.rawAverage - b.rawAverage)
      .slice(0, 3);

    const priorityAction = PRIORITY_ACTIONS[topDrivers[0].key];

    const payload = {
      businessType,
      revenueOku: revenueOkuNum,
      totalScore,
      rank,
      rankComment,
      improvementPotential,
      improvementRange,
      topDrivers,
      priorityAction,
    };

    router.push(
      `/production/result?data=${encodeURIComponent(JSON.stringify(payload))}`
    );
  };

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
        <div className="mb-10">
          <h1 className="mb-3 text-3xl font-bold md:text-4xl">
            生産診断
          </h1>
          <p className="max-w-3xl text-base leading-8 text-slate-600">
            生産計画、能力計画、段取り、設備稼働、品質、仕掛・滞留、
            改善基盤をもとに、生産改善ポテンシャルと主要論点を可視化します。
          </p>
        </div>

        <section className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 text-lg font-semibold">基本情報</div>

          <div className="mb-8">
            <div className="mb-3 text-sm font-semibold text-slate-700">
              主な生産形態
            </div>
            <div className="grid gap-3 md:grid-cols-4">
              {[
                { value: "mass_production", label: "量産中心" },
                { value: "multi_small", label: "多品種少量" },
                { value: "make_to_order", label: "受注生産" },
                { value: "assembly_mixed", label: "組立・混流" },
              ].map((item) => (
                <label
                  key={item.value}
                  className={`cursor-pointer rounded-xl border p-4 text-sm transition ${
                    businessType === item.value
                      ? "border-[#CEC1A1] bg-[#0A2643] text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#CEC1A1]"
                  }`}
                >
                  <input
                    type="radio"
                    name="businessType"
                    value={item.value}
                    checked={businessType === item.value}
                    onChange={() => setBusinessType(item.value as BusinessType)}
                    className="hidden"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-700">
              売上規模（億円）
            </label>
            <input
              type="number"
              inputMode="decimal"
              placeholder="例：50"
              value={revenueOku}
              onChange={(e) => setRevenueOku(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-[#0A2643]"
            />
            <div className="mt-2 text-sm text-slate-500">
              例：50 と入力した場合、売上規模50億円として診断します。
            </div>
          </div>
        </section>

        <div className="space-y-8">
          {groupedQuestions.map((group) => (
            <section
              key={group.section}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-5 border-l-4 border-[#CEC1A1] pl-4 text-xl font-semibold">
                {group.section}
              </div>

              <div className="space-y-6">
                {group.items.map((q) => (
                  <div key={q.id} className="rounded-xl border border-slate-100 p-5">
                    <div className="mb-4 text-sm font-semibold text-slate-800">
                      {q.id.replace("q", "Q")}
                      {`. `}
                      {q.text}
                    </div>

                    <div className="grid gap-2 md:grid-cols-5">
                      {OPTIONS.map((option, i) => {
                        const optionId = `${q.id}-${i}`;
                        const checked = answers[q.id] === option.score;

                        return (
                          <label
                            key={optionId}
                            htmlFor={optionId}
                            className={`cursor-pointer rounded-lg border px-3 py-3 text-center text-sm transition ${
                              checked
                                ? "border-[#CEC1A1] bg-[#0A2643] text-white"
                                : "border-slate-200 bg-white text-slate-700 hover:border-[#CEC1A1]"
                            }`}
                          >
                            <input
                              id={optionId}
                              type="radio"
                              name={q.id}
                              value={option.score}
                              checked={checked}
                              onChange={() =>
                                handleAnswerChange(q.id, option.score)
                              }
                              className="sr-only"
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="sticky bottom-0 mt-10 border-t border-[#CEC1A1] bg-white/95 py-6 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <div className="text-sm leading-7 text-slate-600">
              入力完了後、生産診断結果を算出します。
            </div>
            <button
              onClick={handleSubmit}
              className="rounded-xl bg-[#0A2643] px-8 py-4 text-white transition hover:opacity-90"
            >
              診断結果を表示する
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
