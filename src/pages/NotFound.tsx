import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="text-4xl">🧭</p>
      <h1 className="mt-3 text-xl font-bold">Page not found</h1>
      <Link to="/explore" className="mt-4 inline-block text-sm font-medium text-brand-600">
        ← Back to Explore
      </Link>
    </div>
  );
}
