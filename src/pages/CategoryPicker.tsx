import { Link } from 'react-router-dom';
const categories = [
  { id: 'mathematics', name: 'Mathematics' },
  { id: 'biology', name: 'Biology' },
  { id: 'physics', name: 'Physics' },
];
export default function CategoryPicker() {
  return (
    <main className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Choose a category</h1>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {categories.map(c => (
          <Link key={c.id} to={`/learn?category=${c.id}`}
                className="block rounded-xl border bg-white p-6 shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary">
            <div className="text-lg font-medium">{c.name}</div>
            <div className="text-sm text-gray-600 mt-1">Enter learning mode</div>
          </Link>
        ))}
      </div>
      <div className="mt-8 text-center">
        <p className="mb-2 text-gray-700">Ready to test your knowledge?</p>
        <Link to="/test-config" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Take a Practice Test
        </Link>
      </div>
    </main>
  );
}