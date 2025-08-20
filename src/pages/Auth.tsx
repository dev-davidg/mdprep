import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const fn = isSignUp ? signUp : signIn;
    const { error } = await fn(email, password);
    if (error) setError(error);
    else navigate(from, { replace: true });
  };

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-semibold mb-4">{isSignUp ? 'Create account' : 'Sign in'}</h1>
        <label className="block mb-2 text-sm" htmlFor="email">Email</label>
        <input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)}
               className="w-full border rounded p-2 mb-4" required/>
        <label className="block mb-2 text-sm" htmlFor="password">Password</label>
        <input id="password" type="password" value={password} onChange={e=>setPassword(e.target.value)}
               className="w-full border rounded p-2 mb-4" required/>
        {error && <div className="text-red-600 mb-3" role="alert">{error}</div>}
        <button className="w-full bg-blue-600 text-white rounded p-2 hover:bg-blue-700">Continue</button>
        <button type="button" onClick={()=>setIsSignUp(s=>!s)}
                className="w-full mt-3 text-sm underline">{isSignUp ? 'Have an account? Sign in' : 'New here? Create account'}</button>
      </form>
    </main>
  );
}