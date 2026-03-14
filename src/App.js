import { useState } from 'react';
import QuizBuilder from './QuizBuilder';
import StudentApp from './StudentApp';
import AuthWrapper from './AuthWrapper';

const navy = '#0c1f3f';
const gold = '#c8952a';
const cream = '#f8f5f0';
const F = { body: "'Outfit', sans-serif", display: "'Cormorant Garamond', serif" };

function LandingSelector({ onSelect }) {
  return (
    <div style={{ minHeight:'100vh', background:'#eef2f8', fontFamily:F.body, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:24 }}>
      <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div style={{ textAlign:'center', marginBottom:48 }}>
        <div style={{ fontFamily:F.display, fontSize:52, color:navy, fontWeight:700, lineHeight:1 }}>EduCraft</div>
        <div style={{ color:gold, fontSize:14, marginTop:6, letterSpacing:2, fontWeight:600 }}>POWERED BY ABBEY</div>
        <div style={{ color:'#666', fontSize:16, marginTop:12 }}>Nigeria's AI-powered exam intelligence platform</div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, maxWidth:640, width:'100%' }}>
        <button onClick={() => onSelect('teacher')} style={{
          background:cream, borderRadius:20, padding:'36px 28px', border:`2px solid transparent`,
          cursor:'pointer', textAlign:'left', boxShadow:'0 8px 32px rgba(12,31,63,0.10)',
          fontFamily:F.body, transition:'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.border=`2px solid ${navy}`; e.currentTarget.style.transform='translateY(-4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.border='2px solid transparent'; e.currentTarget.style.transform='translateY(0)'; }}>
          <div style={{ fontSize:40, marginBottom:16 }}>👩‍🏫</div>
          <div style={{ fontFamily:F.display, fontSize:26, color:navy, fontWeight:700, marginBottom:8 }}>I'm a Teacher</div>
          <div style={{ color:'#666', fontSize:14, lineHeight:1.6 }}>Generate exam papers, MCQ sets and marking schemes for your class.</div>
          <div style={{ marginTop:20, display:'inline-block', background:navy, color:cream, padding:'8px 18px', borderRadius:8, fontSize:13, fontWeight:600 }}>
            Build Exam Papers →
          </div>
        </button>

        <button onClick={() => onSelect('student')} style={{
          background:navy, borderRadius:20, padding:'36px 28px', border:`2px solid transparent`,
          cursor:'pointer', textAlign:'left', boxShadow:'0 8px 32px rgba(12,31,63,0.20)',
          fontFamily:F.body, transition:'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='translateY(0)'; }}>
          <div style={{ fontSize:40, marginBottom:16 }}>🎓</div>
          <div style={{ fontFamily:F.display, fontSize:26, color:cream, fontWeight:700, marginBottom:8 }}>I'm a Student</div>
          <div style={{ color:'rgba(255,255,255,0.65)', fontSize:14, lineHeight:1.6 }}>Practice timed JAMB mocks, get instant feedback and weak topic analysis.</div>
          <div style={{ marginTop:20, display:'inline-block', background:gold, color:'#fff', padding:'8px 18px', borderRadius:8, fontSize:13, fontWeight:600 }}>
            Start Practising →
          </div>
        </button>
      </div>

      <div style={{ marginTop:32, color:'#aaa', fontSize:13 }}>
        JAMB · WAEC · Cambridge · SAT — Coming soon
      </div>
    </div>
  );
}

function App() {
  const [role, setRole] = useState(null);

  if (!role) return <LandingSelector onSelect={setRole} />;

  return (
    <AuthWrapper>
      {({ onGenerated }) =>
        role === 'teacher'
          ? <QuizBuilder onGenerated={onGenerated} />
          : <StudentApp onGenerated={onGenerated} />
      }
    </AuthWrapper>
  );
}

export default App;
