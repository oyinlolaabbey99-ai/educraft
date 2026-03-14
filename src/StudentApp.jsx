import { useState, useEffect, useCallback, useRef } from 'react';

const navy = '#0c1f3f';
const gold = '#c8952a';
const cream = '#f8f5f0';
const bg = '#eef2f8';
const green = '#27ae60';
const red = '#e74c3c';
const F = { body: "'Outfit', sans-serif", display: "'Cormorant Garamond', serif" };

const ELECTIVE_SUBJECTS = [
  'Biology','Chemistry','Physics','Mathematics',
  'Economics','Government','Literature in English',
  'Geography','Commerce','Accounting',
  'Agricultural Science','Christian Religious Studies',
  'Islamic Religious Studies','Civic Education',
];

const SUBJECT_ICONS = {
  'Biology':'🧬','Chemistry':'⚗️','Physics':'⚡','Mathematics':'📐',
  'Economics':'📊','Government':'🏛️','Literature in English':'📚',
  'Geography':'🌍','Commerce':'🏪','Accounting':'🔢',
  'Agricultural Science':'🌱','Christian Religious Studies':'✝️',
  'Islamic Religious Studies':'☪️','Civic Education':'🗳️',
  'Use of English':'✍️',
};

const SUBJECT_TOPICS = {
  'Use of English':['Comprehension','Lexis and Structure','Oral Forms','Cloze Test','Antonyms and Synonyms'],
  'Biology':['Cell Biology','Ecology','Genetics','Human Physiology','Plant Biology','Classification','Reproduction','Adaptation and Evolution'],
  'Chemistry':['Atomic Structure','Chemical Bonding','Mole Concept','Acids Bases and Salts','Electrochemistry','Organic Chemistry','Periodic Table','Chemical Equilibrium'],
  'Physics':['Mechanics','Waves','Sound','Light and Optics','Electricity','Electromagnetism','Heat','Modern Physics'],
  'Mathematics':['Algebra','Number and Numeration','Geometry','Trigonometry','Statistics','Calculus','Sets','Permutation and Combination'],
  'Economics':['Demand and Supply','National Income','Money and Banking','International Trade','Production','Market Structures','Public Finance','Nigerian Economy'],
  'Government':['Nigerian Political History','Constitutional Development','Organs of Government','Political Concepts','Electoral Systems','International Relations'],
  'Literature in English':['Poetry','Prose','Drama','Literary Devices','Oral Literature','African Literature'],
  'Geography':['Physical Geography','Human Geography','Economic Geography','Map Reading','Nigerian Geography','Environmental Issues'],
  'Commerce':['Trade','Banking','Insurance','Transportation','Communication','Warehousing'],
  'Accounting':['Bookkeeping','Final Accounts','Bank Reconciliation','Partnership Accounts','Company Accounts','Costing'],
  'Agricultural Science':['Crop Production','Animal Husbandry','Soil Science','Agricultural Economics','Farm Machinery','Fisheries'],
  'Christian Religious Studies':['Old Testament','New Testament','Christian Ethics','Church History','Nigerian Christianity'],
  'Islamic Religious Studies':['Quran','Hadith','Islamic History','Islamic Ethics','Islam in Nigeria'],
  'Civic Education':['Democracy','Citizenship','Human Rights','Rule of Law','National Values','Constitutional Democracy'],
};

const buildPrompt = (subject, count) => {
  const topics = (SUBJECT_TOPICS[subject]||[]).join(', ');
  const base = `You are a JAMB UTME expert. Generate exactly ${count} JAMB-style multiple choice questions for ${subject}.

Topics to cover: ${topics}

STRICT JAMB RULES:
- 4 options (A B C D), exactly ONE correct answer
- Difficulty: 35% easy (recall), 45% medium (application), 20% hard (synthesis)
- ~40 seconds solvable per question
- Formal Nigerian secondary school English
- NO "all of the above" or "none of the above"
- Distribute correct answers evenly across A B C D
- All distractors must be plausible — from same topic area
- Use JAMB stems: "Which of the following...", "All EXCEPT...", direct definitions, short calculations (max 2 steps)
- Each explanation must say WHY the answer is correct AND briefly why others are wrong

Return ONLY valid JSON array, no markdown, no other text:
[{"id":1,"subject":"${subject}","topic":"exact topic name","question":"full question","options":{"A":"text","B":"text","C":"text","D":"text"},"answer":"B","explanation":"Why B is correct. Why A, C, D are wrong."}]`;
  return base;
};

export default function StudentApp() {
  const [screen, setScreen] = useState('setup');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(7200);
  const [genProgress, setGenProgress] = useState({ done: 0, total: 9 });
  const [genError, setGenError] = useState('');
  const [results, setResults] = useState(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [activeReviewSubject, setActiveReviewSubject] = useState(null);
  const timerRef = useRef(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    if (screen !== 'test') return;
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [screen]);

  const fmt = s => {
    const h = Math.floor(s/3600), m = Math.floor((s%3600)/60), sec = s%60;
    return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`;
  };

  const callAPI = async prompt => {
    const r = await fetch('/api/chat', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ max_tokens:4000, messages:[{role:'user',content:prompt}] })
    });
    const d = await r.json();
    if (d.error) throw new Error(d.error.message);
    const text = (d.content?.[0]?.text||'').replace(/```json|```/g,'').trim();
    const s = text.indexOf('['), e = text.lastIndexOf(']');
    if (s===-1||e===-1) throw new Error('Invalid response format');
    return JSON.parse(text.substring(s,e+1));
  };

  const generate = async () => {
    setScreen('generating');
    setGenError('');
    submittedRef.current = false;

    const allSubjects = ['Use of English', ...selectedSubjects];
    // English: 3 batches of 20 = 60 | Each elective: 2 batches of 20 = 40
    const batches = [
      { subject:'Use of English', count:20 },
      { subject:'Use of English', count:20 },
      { subject:'Use of English', count:20 },
      ...selectedSubjects.flatMap(s => [{ subject:s, count:20 },{ subject:s, count:20 }])
    ];
    setGenProgress({ done:0, total:batches.length });

    try {
      const collected = {};
      allSubjects.forEach(s => { collected[s] = []; });

      for (let i = 0; i < batches.length; i += 3) {
        const group = batches.slice(i, i+3);
        const results = await Promise.all(group.map(b => callAPI(buildPrompt(b.subject, b.count))));
        results.forEach((qs, idx) => {
          const sub = group[idx].subject;
          qs.forEach(q => collected[sub].push(q));
        });
        setGenProgress(prev => ({ ...prev, done: Math.min(i+3, batches.length) }));
      }

      let id = 1;
      const final = [];
      allSubjects.forEach(sub => {
        (collected[sub]||[]).forEach(q => final.push({ ...q, id: id++ }));
      });

      setQuestions(final);
      setCurrentIdx(0);
      setAnswers({});
      setFlagged(new Set());
      setTimeLeft(7200);
      setScreen('test');
    } catch(err) {
      setGenError(`Generation failed: ${err.message}. Please try again.`);
      setScreen('setup');
    }
  };

  const handleSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    clearInterval(timerRef.current);

    const subR = {}, topR = {};
    let correct = 0;

    questions.forEach(q => {
      const isCorrect = answers[q.id] === q.answer;
      if (isCorrect) correct++;
      if (!subR[q.subject]) subR[q.subject] = { correct:0, total:0 };
      subR[q.subject].total++;
      if (isCorrect) subR[q.subject].correct++;
      const tk = `${q.subject}||${q.topic}`;
      if (!topR[tk]) topR[tk] = { subject:q.subject, topic:q.topic, correct:0, total:0 };
      topR[tk].total++;
      if (isCorrect) topR[tk].correct++;
    });

    const weakTopics = Object.values(topR)
      .filter(t => t.total >= 2 && (t.correct/t.total) < 0.5)
      .sort((a,b) => (a.correct/a.total)-(b.correct/b.total));

    const subjectOrder = ['Use of English', ...selectedSubjects];
    const totalJAMB = subjectOrder.reduce((sum, s) => {
      if (!subR[s]) return sum;
      return sum + Math.round((subR[s].correct/subR[s].total)*100);
    }, 0);

    setResults({ correct, total:questions.length, subjectResults:subR, weakTopics, totalJAMB, subjectOrder });
    setScreen('results');
  }, [questions, answers, selectedSubjects]);

  const toggleSubject = sub => {
    setSelectedSubjects(prev =>
      prev.includes(sub) ? prev.filter(s=>s!==sub) : prev.length < 3 ? [...prev, sub] : prev
    );
  };

  const toggleFlag = id => setFlagged(prev => {
    const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n;
  });

  const currentQ = questions[currentIdx];
  const allSubjectsInOrder = results ? results.subjectOrder : ['Use of English', ...selectedSubjects];

  // ─── SETUP SCREEN ───────────────────────────────────────────
  if (screen === 'setup') return (
    <div style={{ minHeight:'100vh', background:bg, fontFamily:F.body, padding:'32px 20px' }}>
      <div style={{ maxWidth:700, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:40 }}>
          <div style={{ fontFamily:F.display, fontSize:38, color:navy, fontWeight:700, lineHeight:1.1 }}>
            JAMB Practice
          </div>
          <div style={{ color:'#666', fontSize:15, marginTop:8 }}>
            Full 180-question mock · 2-hour timer · Use of English is compulsory
          </div>
        </div>

        <div style={{ background:cream, borderRadius:16, padding:28, marginBottom:24, boxShadow:'0 4px 20px rgba(12,31,63,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
            <div style={{ background:navy, borderRadius:10, padding:'8px 14px', color:cream, fontWeight:600, fontSize:14 }}>
              ✍️ Use of English
            </div>
            <div style={{ color:'#888', fontSize:13 }}>60 questions · Always included</div>
          </div>

          <div style={{ color:navy, fontWeight:600, marginBottom:14, fontSize:15 }}>
            Choose 3 elective subjects ({selectedSubjects.length}/3 selected)
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px,1fr))', gap:10 }}>
            {ELECTIVE_SUBJECTS.map(sub => {
              const selected = selectedSubjects.includes(sub);
              const disabled = !selected && selectedSubjects.length >= 3;
              return (
                <button key={sub} onClick={()=>!disabled&&toggleSubject(sub)}
                  style={{
                    padding:'10px 12px', borderRadius:10, border:`2px solid ${selected?gold:'#ddd'}`,
                    background:selected?`${gold}15`:'#fff', cursor:disabled?'not-allowed':'pointer',
                    display:'flex', alignItems:'center', gap:8, fontFamily:F.body,
                    fontSize:13, color:disabled&&!selected?'#bbb':navy, fontWeight:selected?600:400,
                    opacity:disabled&&!selected?0.5:1, textAlign:'left', transition:'all 0.15s'
                  }}>
                  <span>{SUBJECT_ICONS[sub]}</span>
                  <span style={{ lineHeight:1.2 }}>{sub}</span>
                  {selected && <span style={{ marginLeft:'auto', color:gold }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>

        {genError && (
          <div style={{ background:'#fde8e8', border:'1px solid #f5c6c6', borderRadius:10, padding:14, marginBottom:16, color:red, fontSize:14 }}>
            {genError}
          </div>
        )}

        <button
          onClick={generate}
          disabled={selectedSubjects.length < 3}
          style={{
            width:'100%', padding:'16px 24px', background:selectedSubjects.length<3?'#ccc':navy,
            color:'#fff', border:'none', borderRadius:12, fontSize:17, fontFamily:F.body,
            fontWeight:700, cursor:selectedSubjects.length<3?'not-allowed':'pointer',
            transition:'all 0.2s'
          }}>
          {selectedSubjects.length < 3
            ? `Select ${3 - selectedSubjects.length} more subject${3-selectedSubjects.length>1?'s':''}`
            : '🚀 Start Practice — 180 Questions'}
        </button>

        <div style={{ textAlign:'center', color:'#888', fontSize:12, marginTop:12 }}>
          Questions are AI-generated using the JAMB fingerprint · Takes ~30 seconds to prepare
        </div>
      </div>
    </div>
  );

  // ─── GENERATING SCREEN ──────────────────────────────────────
  if (screen === 'generating') {
    const pct = Math.round((genProgress.done / genProgress.total) * 100);
    const subjectsInProgress = ['Use of English', ...selectedSubjects];
    return (
      <div style={{ minHeight:'100vh', background:bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:F.body, padding:20 }}>
        <div style={{ background:cream, borderRadius:20, padding:'48px 40px', maxWidth:480, width:'100%', textAlign:'center', boxShadow:'0 8px 40px rgba(12,31,63,0.12)' }}>
          <div style={{ fontFamily:F.display, fontSize:32, color:navy, fontWeight:700, marginBottom:8 }}>
            Preparing Your Exam
          </div>
          <div style={{ color:'#666', fontSize:14, marginBottom:32 }}>
            Generating {questions.length || 180} JAMB-calibrated questions...
          </div>

          <div style={{ background:'#e8ecf0', borderRadius:100, height:10, marginBottom:12, overflow:'hidden' }}>
            <div style={{ height:'100%', background:`linear-gradient(90deg, ${navy}, ${gold})`, borderRadius:100, width:`${pct}%`, transition:'width 0.5s ease' }} />
          </div>
          <div style={{ color:navy, fontWeight:700, fontSize:22, marginBottom:24 }}>{pct}%</div>

          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {subjectsInProgress.map((sub, i) => {
              const batchesPerSubject = sub === 'Use of English' ? 3 : 2;
              const subjectBatchStart = sub === 'Use of English' ? 0 : 3 + selectedSubjects.indexOf(sub) * 2;
              const done = Math.max(0, Math.min(batchesPerSubject, genProgress.done - subjectBatchStart));
              const isComplete = done >= batchesPerSubject;
              const isActive = done > 0 && !isComplete;
              return (
                <div key={sub} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 12px', borderRadius:8, background:isComplete?`${green}12`:isActive?`${gold}12`:'transparent' }}>
                  <span style={{ fontSize:18 }}>{SUBJECT_ICONS[sub]}</span>
                  <span style={{ fontSize:14, color:navy, flex:1, textAlign:'left' }}>{sub}</span>
                  <span style={{ fontSize:13, color:isComplete?green:isActive?gold:'#bbb', fontWeight:600 }}>
                    {isComplete ? '✓ Ready' : isActive ? 'Generating...' : 'Waiting'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // ─── TEST SCREEN ────────────────────────────────────────────
  if (screen === 'test' && currentQ) {
    const answered = Object.keys(answers).length;
    const isFlagged = flagged.has(currentQ.id);
    const isUrgent = timeLeft < 600; // < 10 minutes
    const subjectGroups = {};
    questions.forEach((q,i) => {
      if (!subjectGroups[q.subject]) subjectGroups[q.subject] = [];
      subjectGroups[q.subject].push({ ...q, idx:i });
    });

    return (
      <div style={{ minHeight:'100vh', background:'#0a1628', fontFamily:F.body, display:'flex', flexDirection:'column' }}>

        {/* TOP BAR */}
        <div style={{ background:navy, borderBottom:'1px solid rgba(255,255,255,0.1)', padding:'10px 20px', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:100 }}>
          <div style={{ fontFamily:F.display, color:cream, fontSize:20, fontWeight:700 }}>EduCraft JAMB</div>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <div style={{ color:isUrgent?'#ff6b6b':gold, fontWeight:700, fontSize:18, fontFamily:'monospace' }}>
              ⏱ {fmt(timeLeft)}
            </div>
            <div style={{ color:'rgba(255,255,255,0.6)', fontSize:13 }}>
              {answered}/{questions.length} answered
            </div>
            <button onClick={() => { if (window.confirm('Submit the exam now?')) handleSubmit(); }}
              style={{ background:gold, color:'#fff', border:'none', borderRadius:8, padding:'7px 16px', fontFamily:F.body, fontWeight:700, fontSize:13, cursor:'pointer' }}>
              Submit
            </button>
          </div>
        </div>

        <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

          {/* QUESTION GRID SIDEBAR */}
          <div style={{ width:220, background:'rgba(255,255,255,0.04)', borderRight:'1px solid rgba(255,255,255,0.08)', padding:16, overflowY:'auto', flexShrink:0 }}>
            {Object.entries(subjectGroups).map(([sub, qs]) => (
              <div key={sub} style={{ marginBottom:16 }}>
                <div style={{ color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, marginBottom:8 }}>
                  {SUBJECT_ICONS[sub]} {sub.length > 15 ? sub.substring(0,14)+'…' : sub}
                </div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                  {qs.map(q => {
                    const isAnswered = !!answers[q.id];
                    const isCurrent = currentIdx === q.idx;
                    const isQ_Flagged = flagged.has(q.id);
                    return (
                      <button key={q.id} onClick={() => setCurrentIdx(q.idx)}
                        style={{
                          width:28, height:28, borderRadius:6, border:`2px solid ${isCurrent?gold:isQ_Flagged?'#e67e22':isAnswered?'rgba(39,174,96,0.6)':'rgba(255,255,255,0.2)'}`,
                          background:isCurrent?gold:isAnswered?'rgba(39,174,96,0.15)':'transparent',
                          color:isCurrent?'#fff':'rgba(255,255,255,0.7)', fontSize:10, fontWeight:700, cursor:'pointer', fontFamily:F.body
                        }}>
                        {q.id}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            <div style={{ marginTop:12, fontSize:11, color:'rgba(255,255,255,0.3)', lineHeight:1.6 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <div style={{ width:12, height:12, borderRadius:3, background:'rgba(39,174,96,0.3)', border:'2px solid rgba(39,174,96,0.6)' }} />
                Answered
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                <div style={{ width:12, height:12, borderRadius:3, border:'2px solid #e67e22' }} />
                Flagged
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <div style={{ width:12, height:12, borderRadius:3, border:'2px solid rgba(255,255,255,0.2)' }} />
                Unanswered
              </div>
            </div>
          </div>

          {/* MAIN QUESTION AREA */}
          <div style={{ flex:1, overflowY:'auto', padding:'28px 32px', maxWidth:760 }}>

            {/* Subject & topic badge */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <span style={{ background:`${gold}25`, color:gold, padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:700 }}>
                {SUBJECT_ICONS[currentQ.subject]} {currentQ.subject}
              </span>
              <span style={{ color:'rgba(255,255,255,0.35)', fontSize:12 }}>{currentQ.topic}</span>
              <span style={{ marginLeft:'auto', color:'rgba(255,255,255,0.3)', fontSize:12 }}>
                Question {currentIdx+1} of {questions.length}
              </span>
            </div>

            {/* Question */}
            <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:14, padding:'24px 28px', marginBottom:24, border:'1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ color:cream, fontSize:16, lineHeight:1.7, fontWeight:500 }}>
                {currentQ.question}
              </div>
            </div>

            {/* Options */}
            <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:28 }}>
              {['A','B','C','D'].map(opt => {
                const isSelected = answers[currentQ.id] === opt;
                return (
                  <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [currentQ.id]:opt }))}
                    style={{
                      display:'flex', alignItems:'flex-start', gap:14, padding:'14px 18px',
                      borderRadius:12, border:`2px solid ${isSelected?gold:'rgba(255,255,255,0.12)'}`,
                      background:isSelected?`${gold}20`:'rgba(255,255,255,0.04)',
                      cursor:'pointer', textAlign:'left', fontFamily:F.body, transition:'all 0.15s'
                    }}>
                    <span style={{ fontWeight:700, color:isSelected?gold:'rgba(255,255,255,0.5)', fontSize:14, minWidth:20, marginTop:1 }}>
                      {opt}.
                    </span>
                    <span style={{ color:isSelected?cream:'rgba(255,255,255,0.75)', fontSize:15, lineHeight:1.5 }}>
                      {currentQ.options[opt]}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <button onClick={() => setCurrentIdx(prev => Math.max(0, prev-1))}
                disabled={currentIdx===0}
                style={{ padding:'10px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:currentIdx===0?'rgba(255,255,255,0.2)':cream, cursor:currentIdx===0?'not-allowed':'pointer', fontFamily:F.body, fontSize:14 }}>
                ← Previous
              </button>

              <button onClick={() => toggleFlag(currentQ.id)}
                style={{ padding:'10px 16px', borderRadius:10, border:`1px solid ${isFlagged?'#e67e22':'rgba(255,255,255,0.2)'}`, background:isFlagged?`rgba(230,126,34,0.15)`:'transparent', color:isFlagged?'#e67e22':cream, cursor:'pointer', fontFamily:F.body, fontSize:13 }}>
                {isFlagged ? '🚩 Flagged' : '🏳️ Flag for Review'}
              </button>

              <button onClick={() => setCurrentIdx(prev => Math.min(questions.length-1, prev+1))}
                disabled={currentIdx===questions.length-1}
                style={{ padding:'10px 20px', borderRadius:10, border:'1px solid rgba(255,255,255,0.2)', background:'transparent', color:currentIdx===questions.length-1?'rgba(255,255,255,0.2)':cream, cursor:currentIdx===questions.length-1?'not-allowed':'pointer', fontFamily:F.body, fontSize:14 }}>
                Next →
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS SCREEN ─────────────────────────────────────────
  if (screen === 'results' && results) {
    const pct = Math.round((results.correct/results.total)*100);
    const grade = pct>=70?'Excellent':pct>=55?'Good':pct>=45?'Average':pct>=35?'Below Average':'Needs Work';
    const gradeColor = pct>=70?green:pct>=55?'#2980b9':pct>=45?gold:pct>=35?'#e67e22':red;

    const reviewableQs = activeReviewSubject
      ? questions.filter(q=>q.subject===activeReviewSubject)
      : questions;

    if (reviewMode) {
      const rq = reviewableQs[reviewIdx];
      const studentAns = answers[rq.id];
      const isCorrect = studentAns === rq.answer;
      return (
        <div style={{ minHeight:'100vh', background:bg, fontFamily:F.body }}>
          <div style={{ background:navy, padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <button onClick={()=>setReviewMode(false)} style={{ color:cream, background:'none', border:'none', cursor:'pointer', fontFamily:F.body, fontSize:14 }}>
              ← Back to Results
            </button>
            <div style={{ color:cream, fontSize:14 }}>
              {reviewIdx+1} / {reviewableQs.length} · {activeReviewSubject || 'All Subjects'}
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setReviewIdx(p=>Math.max(0,p-1))} disabled={reviewIdx===0}
                style={{ background:'rgba(255,255,255,0.1)', border:'none', color:cream, padding:'6px 14px', borderRadius:8, cursor:reviewIdx===0?'not-allowed':'pointer', fontFamily:F.body }}>
                ←
              </button>
              <button onClick={()=>setReviewIdx(p=>Math.min(reviewableQs.length-1,p+1))} disabled={reviewIdx===reviewableQs.length-1}
                style={{ background:'rgba(255,255,255,0.1)', border:'none', color:cream, padding:'6px 14px', borderRadius:8, cursor:reviewIdx===reviewableQs.length-1?'not-allowed':'pointer', fontFamily:F.body }}>
                →
              </button>
            </div>
          </div>
          <div style={{ maxWidth:700, margin:'32px auto', padding:'0 20px' }}>
            <div style={{ display:'flex', gap:10, marginBottom:16 }}>
              <span style={{ background:`${gold}20`, color:gold, padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:700 }}>
                {rq.subject}
              </span>
              <span style={{ background:'rgba(0,0,0,0.06)', color:'#666', padding:'4px 12px', borderRadius:100, fontSize:12 }}>
                {rq.topic}
              </span>
              <span style={{ marginLeft:'auto', background:isCorrect?`${green}15`:red+'15', color:isCorrect?green:red, padding:'4px 12px', borderRadius:100, fontSize:12, fontWeight:700 }}>
                {isCorrect ? '✓ Correct' : '✗ Wrong'}
              </span>
            </div>

            <div style={{ background:cream, borderRadius:14, padding:'22px 24px', marginBottom:20, boxShadow:'0 2px 12px rgba(12,31,63,0.08)' }}>
              <div style={{ color:navy, fontSize:16, lineHeight:1.7, fontWeight:500 }}>{rq.question}</div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
              {['A','B','C','D'].map(opt => {
                const isCorrectOpt = opt === rq.answer;
                const isStudentOpt = opt === studentAns;
                let borderColor = '#ddd', bgColor = '#fff', textColor = '#444';
                if (isCorrectOpt) { borderColor = green; bgColor = `${green}12`; textColor = green; }
                else if (isStudentOpt && !isCorrectOpt) { borderColor = red; bgColor = `${red}12`; textColor = red; }
                return (
                  <div key={opt} style={{ display:'flex', gap:14, padding:'13px 16px', borderRadius:12, border:`2px solid ${borderColor}`, background:bgColor }}>
                    <span style={{ fontWeight:700, color:borderColor, minWidth:18 }}>{opt}.</span>
                    <span style={{ color:textColor, fontSize:14, lineHeight:1.5 }}>{rq.options[opt]}</span>
                    {isCorrectOpt && <span style={{ marginLeft:'auto', color:green, fontWeight:700, fontSize:13 }}>✓ Correct</span>}
                    {isStudentOpt && !isCorrectOpt && <span style={{ marginLeft:'auto', color:red, fontWeight:700, fontSize:13 }}>Your answer</span>}
                  </div>
                );
              })}
            </div>

            <div style={{ background:`${navy}08`, borderRadius:12, padding:'16px 18px', borderLeft:`4px solid ${gold}` }}>
              <div style={{ fontWeight:700, color:navy, marginBottom:6, fontSize:13 }}>📖 Explanation</div>
              <div style={{ color:'#555', fontSize:14, lineHeight:1.7 }}>{rq.explanation}</div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ minHeight:'100vh', background:bg, fontFamily:F.body, padding:'32px 20px' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>

          {/* HEADER */}
          <div style={{ background:`linear-gradient(135deg, ${navy} 0%, #1a3a6b 100%)`, borderRadius:20, padding:'36px 40px', marginBottom:24, color:cream, textAlign:'center' }}>
            <div style={{ fontFamily:F.display, fontSize:42, fontWeight:700, marginBottom:4 }}>
              {results.correct}/{results.total}
            </div>
            <div style={{ fontSize:18, opacity:0.7, marginBottom:16 }}>questions correct</div>
            <div style={{ display:'flex', justifyContent:'center', gap:32 }}>
              <div>
                <div style={{ fontSize:32, fontWeight:800, color:gradeColor }}>{pct}%</div>
                <div style={{ fontSize:12, opacity:0.6 }}>Score</div>
              </div>
              <div style={{ width:1, background:'rgba(255,255,255,0.15)' }} />
              <div>
                <div style={{ fontSize:32, fontWeight:800, color:gold }}>{results.totalJAMB}</div>
                <div style={{ fontSize:12, opacity:0.6 }}>JAMB Aggregate</div>
              </div>
              <div style={{ width:1, background:'rgba(255,255,255,0.15)' }} />
              <div>
                <div style={{ fontSize:32, fontWeight:800, color:gradeColor }}>{grade}</div>
                <div style={{ fontSize:12, opacity:0.6 }}>Performance</div>
              </div>
            </div>
          </div>

          {/* SUBJECT BREAKDOWN */}
          <div style={{ background:cream, borderRadius:16, padding:24, marginBottom:20, boxShadow:'0 4px 20px rgba(12,31,63,0.08)' }}>
            <div style={{ fontWeight:700, color:navy, fontSize:16, marginBottom:16 }}>📊 Subject Breakdown</div>
            {results.subjectOrder.map(sub => {
              const sr = results.subjectResults[sub];
              if (!sr) return null;
              const subPct = Math.round((sr.correct/sr.total)*100);
              const subColor = subPct>=70?green:subPct>=50?gold:red;
              return (
                <div key={sub} style={{ marginBottom:16 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span>{SUBJECT_ICONS[sub]}</span>
                      <span style={{ color:navy, fontWeight:600, fontSize:14 }}>{sub}</span>
                    </div>
                    <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                      <span style={{ color:'#888', fontSize:13 }}>{sr.correct}/{sr.total}</span>
                      <span style={{ fontWeight:700, color:subColor, fontSize:14 }}>{subPct}%</span>
                      <button onClick={()=>{ setActiveReviewSubject(sub); setReviewIdx(0); setReviewMode(true); }}
                        style={{ padding:'4px 10px', borderRadius:6, border:`1px solid ${navy}30`, background:'none', color:navy, fontSize:12, cursor:'pointer', fontFamily:F.body }}>
                        Review
                      </button>
                    </div>
                  </div>
                  <div style={{ height:8, background:'#e8ecf0', borderRadius:100, overflow:'hidden' }}>
                    <div style={{ height:'100%', background:subColor, borderRadius:100, width:`${subPct}%`, transition:'width 1s ease' }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* WEAK TOPICS */}
          {results.weakTopics.length > 0 && (
            <div style={{ background:cream, borderRadius:16, padding:24, marginBottom:20, boxShadow:'0 4px 20px rgba(12,31,63,0.08)' }}>
              <div style={{ fontWeight:700, color:navy, fontSize:16, marginBottom:4 }}>⚠️ Topics to Focus On</div>
              <div style={{ color:'#888', fontSize:13, marginBottom:16 }}>You scored below 50% in these areas — prioritise them in your next study session.</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
                {results.weakTopics.map((t, i) => {
                  const tPct = Math.round((t.correct/t.total)*100);
                  return (
                    <div key={i} style={{ background:`${red}10`, border:`1px solid ${red}30`, borderRadius:10, padding:'8px 14px' }}>
                      <div style={{ fontWeight:700, color:red, fontSize:13 }}>{t.topic}</div>
                      <div style={{ color:'#888', fontSize:12 }}>{t.subject} · {tPct}% ({t.correct}/{t.total})</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          <div style={{ display:'flex', gap:12 }}>
            <button onClick={()=>{ setActiveReviewSubject(null); setReviewIdx(0); setReviewMode(true); }}
              style={{ flex:1, padding:'14px 20px', background:navy, color:cream, border:'none', borderRadius:12, fontFamily:F.body, fontWeight:700, fontSize:15, cursor:'pointer' }}>
              📝 Review All Questions
            </button>
            <button onClick={()=>{ setScreen('setup'); setQuestions([]); setAnswers({}); setFlagged(new Set()); setResults(null); setSelectedSubjects([]); submittedRef.current=false; }}
              style={{ flex:1, padding:'14px 20px', background:'transparent', color:navy, border:`2px solid ${navy}`, borderRadius:12, fontFamily:F.body, fontWeight:700, fontSize:15, cursor:'pointer' }}>
              🔄 New Practice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
