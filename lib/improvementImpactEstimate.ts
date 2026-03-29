/**
 * 売上（億円）と診断上の改善余地（%）から、年間の金額インパクトの粗いレンジを推定する。
 * 生産コスト・利益への波及を単純化した係数であり、詳細分析の代替ではない。
 */
export function estimateImpactOkuRange(
  revenueOku: number,
  improvementPotentialPct: number
): { lowOku: number; highOku: number } {
  const r = Number.isFinite(revenueOku) && revenueOku > 0 ? revenueOku : 0;
  const p =
    Math.min(100, Math.max(0, Number.isFinite(improvementPotentialPct) ? improvementPotentialPct : 0)) /
    100;
  const lowOku = r * p * 0.015;
  const highOku = r * p * 0.1;
  return { lowOku, highOku };
}

function segmentOkuToJa(oku: number): string {
  if (oku < 1) {
    const man = Math.max(1, Math.round(oku * 10000));
    return `${man.toLocaleString("ja-JP")}万円`;
  }
  const x = oku >= 10 ? Math.round(oku) : Math.round(oku * 10) / 10;
  return `${x}億円`;
}

/** カード見出し・本文用の一行（例: 約3,000万円〜2億円規模） */
export function formatImpactRangeJa(lowOku: number, highOku: number): string {
  if (!Number.isFinite(lowOku) || !Number.isFinite(highOku) || highOku <= 0) {
    return "金額インパクトは限定的と推定されます";
  }
  return `約${segmentOkuToJa(lowOku)}〜${segmentOkuToJa(highOku)}`;
}
