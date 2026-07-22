import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

export function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <Compass className="mx-auto h-10 w-10 text-gold-500" strokeWidth={1.75} />
      <h1 className="mt-3 text-xl font-bold text-slate-100">Page not found</h1>
      <Link to="/explore" className="mt-4 inline-block text-sm font-medium text-sky-400">
        ← Back to Explore
      </Link>
    </div>
  );
}
