import { PageHeader } from "../page/PageHeader";
import { Loader2 } from "lucide-react";

export function LoadingCard() {
  return (
    <section>
      <PageHeader title="Loading..." />
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        <span className="text-gray-700 text-center">Please wait...</span>
      </div>
    </section>
  );
}