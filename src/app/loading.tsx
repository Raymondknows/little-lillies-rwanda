import { AppLogo } from "@/components/app-logo";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-white px-6 text-[#191919]">
      <AppLogo size="lg" showText={false} showSpinner />
      <p className="mt-4 text-sm font-semibold">Little Lillies School</p>
    </div>
  );
}
