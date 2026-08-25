import { AppLogo } from "@/components/app-logo";

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center bg-background px-6">
      <AppLogo size="lg" showText={false} showSpinner />
    </div>
  );
}
