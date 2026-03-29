import { Suspense } from "react";
import ProductionResultContent from "./ProductionResultContent";

function ResultFallback() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] text-[#0A2643]">
      <div className="mx-auto max-w-6xl px-6 py-16 text-center text-slate-600">
        読み込み中…
      </div>
    </main>
  );
}

export default function ProductionResultPage() {
  return (
    <Suspense fallback={<ResultFallback />}>
      <ProductionResultContent />
    </Suspense>
  );
}
