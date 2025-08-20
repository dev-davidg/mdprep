import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TestConfig() {
  const [count, setCount] = useState(5);
  const navigate = useNavigate();
  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    const n = Math.max(1, count|0);
    navigate(`/test-run?count=${n}`);
  };
  return (
    <main className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Practice Test</h1>
      <form onSubmit={handleStart} className="bg-white p-4 rounded-xl shadow">
        <label className="block mb-2 text-sm" htmlFor="count">Number of questions</label>
        <input id="count" type="number" min={1} value={count} onChange={e=>setCount(parseInt(e.target.value))}
               className="w-full border rounded p-2 mb-4"/>
        <button className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700">Start</button>
      </form>
    </main>
  );
}