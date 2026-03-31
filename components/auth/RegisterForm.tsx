"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [focusedField, setFocusedField] = useState<"email" | "username" | "displayName" | "password" | "confirmPassword" | null>(null);
  const router = useRouter();

  function getPasswordStrength(pw: string) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
    setPasswordStrength(getPasswordStrength(e.target.value));
  }

  function validate() {
    setUsernameError(null);
    setPasswordError(null);
    if (!USERNAME_REGEX.test(username)) {
      setUsernameError("Username must be 3-20 characters, alphanumeric or underscores.");
      return false;
    }
    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return false;
    }
    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, password, displayName }),
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        router.push("/login?success=1");
      } else {
        setError(data.error || "Registration failed");
      }
    } catch {
      setLoading(false);
      setError("Network error. Please try again.");
    }
  }

  const strengthLabels = ["Too weak", "Weak", "Medium", "Strong", "Very strong"];
  const strengthColors = ["#ef4444", "#f59e42", "#facc15", "#3b82f6", "#22c55e"];

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "17px",
    fontWeight: 600,
    color: "#374151",
    marginBottom: "6px",
  };

  const getInputStyle = (
    name: "email" | "username" | "displayName" | "password" | "confirmPassword"
  ): React.CSSProperties => ({
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
            <label htmlFor="username" style={labelStyle}>Username</label>
            <input
              id="username"
              type="text"
              style={getInputStyle("username")}
              value={username}
              onChange={e => setUsername(e.target.value)}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="username"
            />
          </div>
          {usernameError && <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '8px' }}>{usernameError}</div>}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="displayName" style={labelStyle}>Display Name</label>
            <input
              id="displayName"
              type="text"
              style={getInputStyle("displayName")}
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              onFocus={() => setFocusedField("displayName")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="name"
            />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="password" style={labelStyle}>Password</label>
            <input
              id="password"
              type="password"
              style={getInputStyle("password")}
              value={password}
              onChange={handlePasswordChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="new-password"
            />
          </div>
          {password.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: strengthColors[passwordStrength] }}>{strengthLabels[passwordStrength]}</span>
              <span style={{ fontSize: '12px', color: '#94a3b8' }}>{password.length} chars</span>
            </div>
          )}
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="confirmPassword" style={labelStyle}>Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              style={getInputStyle("confirmPassword")}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField(null)}
              required
              autoComplete="new-password"
            />
          </div>
          {passwordError && <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '8px' }}>{passwordError}</div>}
          {error && <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '8px' }}>{error}</div>}
          <button
            type="submit"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'linear-gradient(to right, #3b82f6, #ec4899)', color: 'white', fontWeight: 600, fontSize: '16px', border: 'none', cursor: 'pointer', marginTop: '8px' }}
            disabled={loading}
          >
            {loading ? (
              <span style={{ marginRight: 8 }}>
                <svg style={{ display: 'inline', verticalAlign: 'middle', height: 20, width: 20 }} className="animate-spin" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
              </span>
            ) : null}
            Register
          </button>
          <div style={{ textAlign: 'center', fontSize: '17px', marginTop: '18px', color: '#64748b' }}>
            Already have an account?{' '}
            <a href="/login" style={{ color: '#3b82f6', fontWeight: 600, fontSize: '17px', textDecoration: 'underline', cursor: 'pointer' }}>Login</a>
          </div>
        </form>
      </div>
    </div>
  );
}
