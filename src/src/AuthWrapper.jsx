import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

const FREE_LIMIT = 3;

export default function AuthWrapper({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usageCount, setUsageCount] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUsage(session.user.id);
      else setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchUsage(session.user.id);
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const fetchUsage = async (userId) => {
    const { data } = await supabase.from('usage').select('count').eq('user_id', userId).single();
    setUsageCount(data?.count ?? 0);
    setLoading(false);
  };

  const incrementUsage = async () => {
    if (!user) return;
    const newCount = usageCount + 1;
    await supabase.from('usage').upsert({ user_id: user.id, count: newCount }, { onConflict: 'user_id' });
    setUsageCount(newCount);
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) setAuthError(error.message);
    setAuthLoading(false);
  };

  const handleEmailAuth = async () => {
    setAuthLoading(true);
    setAuthError('');
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError(error.message);
      else setMagicSent(true);
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError(error.message);
    }
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsageCount(0);
  };

  const F = { body: "'Outfit', sans-serif", display: "'Cormorant Garamond', serif" };
  const navy = '#0c1f3f', gold = '#c8952a', cream = '#f8f5f0';

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#eef2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body }}>
      <div style={{ color: navy, fontSize: 18 }}>Loading...</div>
    </div>
  );

  if (!user) return (
    <div style={{ minHeight: '100vh', background: '#eef2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, padding: 20 }}>
      <div style={{ background: cream, borderRadius: 16, padding: '48px 40px', maxWidth: 420, width: '100%', boxShadow: '0 8px 40px rgba(12,31,63,0.12)' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: F.display, fontSize: 36, color: navy, fontWeight: 700 }}>EduCraft</div>
          <div style={{ color: gold, fontSize: 13, marginTop: 4 }}>Powered by Abbey</div>
          <div style={{ color: '#666', fontSize: 14, marginTop: 12 }}>Sign in to generate exam papers</div>
        </div>

        <button onClick={handleGoogleLogin} disabled={authLoading} style={{ width: '100%', padding: '12px 20px', background: '#fff', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 15, fontFamily: F.body, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20, fontWeight: 500 }}>
          <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: 18 }} />
          Continue with Google
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#ddd' }} />
          <span style={{ color: '#999', fontSize: 13 }}>or</span>
          <div style={{ flex: 1, height: 1, background: '#ddd' }} />
        </div>

        {magicSent ? (
          <div style={{ textAlign: 'center', color: navy, fontSize: 15, padding: 20 }}>
            ✓ Check your email to confirm your account, then sign in below.
            <button onClick={() => setMagicSent(false)} style={{ display: 'block', margin: '12px auto 0', background: 'none', border: 'none', color: gold, cursor: 'pointer', textDecoration: 'underline' }}>Back to sign in</button>
          </div>
        ) : (
          <>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email address" type="email" style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, fontFamily: F.body, marginBottom: 10, boxSizing: 'border-box' }} />
            <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" style={{ width: '100%', padding: '11px 14px', border: '1.5px solid #ddd', borderRadius: 8, fontSize: 14, fontFamily: F.body, marginBottom: 16, boxSizing: 'border-box' }} />
            {authError && <div style={{ color: '#c0392b', fontSize: 13, marginBottom: 12 }}>{authError}</div>}
            <button onClick={handleEmailAuth} disabled={authLoading || !email || !password} style={{ width: '100%', padding: '12px 20px', background: navy, color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontFamily: F.body, cursor: 'pointer', fontWeight: 600, marginBottom: 12 }}>
              {authLoading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#666' }}>
              {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
              <button onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} style={{ background: 'none', border: 'none', color: gold, cursor: 'pointer', textDecoration: 'underline', fontSize: 13 }}>
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  if (usageCount >= FREE_LIMIT) return (
    <div style={{ minHeight: '100vh', background: '#eef2f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.body, padding: 20 }}>
      <div style={{ background: cream, borderRadius: 16, padding: '48px 40px', maxWidth: 460, width: '100%', textAlign: 'center', boxShadow: '0 8px 40px rgba(12,31,63,0.12)' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🎓</div>
        <div style={{ fontFamily: F.display, fontSize: 30, color: navy, fontWeight: 700, marginBottom: 12 }}>You've used your 3 free papers</div>
        <div style={{ color: '#666', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>Upgrade to EduCraft Pro to generate unlimited exam papers, marking schemes, and more.</div>
        <button style={{ width: '100%', padding: '14px 20px', background: gold, color: '#fff', border: 'none', borderRadius: 8, fontSize: 16, fontFamily: F.body, cursor: 'pointer', fontWeight: 700, marginBottom: 12 }}>
          Upgrade to Pro — ₦5,000/month
        </button>
        <button onClick={handleLogout} style={{ background: 'none', border: 'none', color: '#999', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>Sign out</button>
      </div>
    </div>
  );

  return (
    <div>
      <div style={{ background: navy, padding: '8px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: F.body }}>
        <div style={{ color: '#aaa', fontSize: 13 }}>
          <span style={{ color: gold, fontWeight: 600 }}>{FREE_LIMIT - usageCount}</span> free paper{FREE_LIMIT - usageCount !== 1 ? 's' : ''} remaining
        </div>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #444', color: '#aaa', padding: '4px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontFamily: F.body }}>Sign out</button>
      </div>
      {children({ onGenerated: incrementUsage })}
    </div>
  );
}