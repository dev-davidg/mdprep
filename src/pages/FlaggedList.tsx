import { Link } from 'react-router-dom';
export default function FlaggedList() {
  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Flagged & Hard Questions</h1>
      <p className="text-gray-600 mb-4">This will list your flagged/hard questions once wired to Supabase.</p>
      <Link to="/" className="text-blue-600 underline">← Back to Categories</Link>
    </main>
  );
}