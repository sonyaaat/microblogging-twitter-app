"use client";
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';


export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<"email" | "password" | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push("/feed");
    } else {
      setError(res?.error || "Invalid email or password");
    }
  }

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "17px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
  };

  const getInputStyle = (name: "email" | "password"): React.CSSProperties => ({
    width: "100%",
    height: "48px",
    padding: "0 14px",
    borderRadius: "10px",
    border: focusedField === name ? "1.5px solid #3b82f6" : "1.5px solid #e2e8f0",
    background: "#ffffff",
    fontSize: "17px",
    boxSizing: "border-box",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    outline: "none",
    transition: "border-color 0.15s ease",
  });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'white', borderRadius: '16px', padding: '48px', width: '90vw', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)' }}>
        <div style={{ background: 'linear-gradient(to right, #3b82f6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontSize: '2rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '24px' }}>
          Microlog
        </div>
        <form onSubmit={handleSubmit} autoComplete="off">
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="email" style={labelStyle}>Email</label>
            <input
              id="email"
              type="email"
              style={getInputStyle("email")}
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="email"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              type="password"
              style={getInputStyle("password")}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="current-password"
            />
          </div>
          {error && <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '8px' }}>{error}</div>}
          <button
            type="submit"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'linear-gradient(to right, #3b82f6, #ec4899)', color: 'white', fontWeight: 600, fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '8px' }}
            disabled={loading || !email.trim() || !password}
          >
            {loading ? (
              <span style={{ marginRight: 8 }}>
                <svg style={{ display: 'inline', verticalAlign: 'middle', height: 20, width: 20 }} className="animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </span>
            ) : null}
            Sign In
          </button>
          <div style={{ textAlign: 'center', fontSize: '17px', marginTop: '18px', color: '#64748b' }}>
            Don't have an account?{' '}
            <a href="/register" style={{ color: '#3b82f6', fontWeight: 600, fontSize: '17px', textDecoration: 'underline', cursor: 'pointer' }}>Register</a>
          </div>
        </form>
      </div>
    </div>
  );
}
