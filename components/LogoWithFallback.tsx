"use client";

export function LogoWithFallback() {
  return (
    <>
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
      <div className="hidden text-sm font-medium tracking-wide text-[#0A2643]">
        ダイスリンク株式会社
      </div>
    </>
  );
}
