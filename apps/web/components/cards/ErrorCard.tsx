import { AlertCircle } from "lucide-react";

// TODO: Better styling of errors
// TODO: Allow passing ApiError for more detail
export function ErrorCard({ message }: { message: string }) {
  return (
    <section className="flex justify-center items-center px-4">
      <div className="w-full sm:w-2/3 md:w-2/5 border-2 border-red-700 rounded-xl bg-gradient-to-b from-red-50 to-red-100 shadow-lg p-6 flex flex-col items-center">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-700" />
          <span className="text-red-700 font-bold text-lg">Ooops...</span>
        </div>

        <span className="text-red-600 text-sm text-left">{message}</span>
      </div>
    </section>
  );
}