import { useState, useCallback } from "react";

// ─── Google Fonts ─────────────────────────────────────────────────────────────
const _fl = document.createElement("link");
_fl.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap";
_fl.rel = "stylesheet";
document.head.appendChild(_fl);

// ─── Design Tokens ────────────────────────────────────────────────────────────
const C = {
  navy:"#0c1f3f",navyMid:"#16325e",navyLight:"#1e4080",
  gold:"#c8952a",goldLight:"#e2b04a",goldPale:"#fdf6e8",goldBorder:"rgba(200,149,42,0.28)",
  cream:"#f8f5f0",white:"#ffffff",ink:"#111827",
  slate:"#4b5e78",muted:"#7a8fa8",mutedLight:"#a8bcd0",
  border:"#e2e8f0",borderMid:"#cbd5e1",
  success:"#15803d",successBg:"#f0fdf4",
  amber:"#d97706",amberBg:"#fffbeb",
  red:"#dc2626",redBg:"#fef2f2",
  bg:"#eef2f8",
};
const F = { display:"'Cormorant Garamond',Georgia,serif", body:"'Outfit',system-ui,sans-serif" };

// ─── Constants ────────────────────────────────────────────────────────────────
const SUBJECTS = ["Mathematics","English Language","Biology","Chemistry","Physics","Agricultural Science","Economics","Government","History","Geography","Literature in English","Civic Education","Further Mathematics","Technical Drawing","Food and Nutrition","Computer Science","Financial Accounting","Commerce","French","Yoruba","Igbo","Hausa","Other"];
const GRADE_LEVELS = [
  {label:"Primary 1–3",     value:"Primary 1-3", curriculum:"Nigerian Primary Curriculum",       waec:false},
  {label:"Primary 4–6",     value:"Primary 4-6", curriculum:"Nigerian Primary Curriculum",       waec:false},
  {label:"JSS 1",           value:"JSS 1",        curriculum:"Nigerian Junior Secondary (NERDC)", waec:false},
  {label:"JSS 2",           value:"JSS 2",        curriculum:"Nigerian Junior Secondary (NERDC)", waec:false},
  {label:"JSS 3 / BECE",    value:"JSS 3",        curriculum:"Nigerian Junior Secondary / BECE",  waec:false},
  {label:"SS 1",            value:"SS 1",          curriculum:"Nigerian Senior Secondary",          waec:false},
  {label:"SS 2",            value:"SS 2",          curriculum:"WAEC & NECO Standards",             waec:true},
  {label:"SS 3 / WAEC / NECO",value:"SS 3",       curriculum:"WAEC & NECO Standards",             waec:true},
];
const DIFFICULTIES = [
  {value:"Recall",        label:"Recall",        sub:"Knowledge & definition",             dot:"#22c55e"},
  {value:"Comprehension", label:"Comprehension", sub:"Explanation & interpretation",       dot:"#eab308"},
  {value:"Application",   label:"Application",   sub:"Problem-solving & use of concepts",  dot:"#f97316"},
  {value:"Analysis",      label:"Analysis",      sub:"WAEC/NECO — critical & evaluative",  dot:"#ef4444"},
];
const TERMS     = ["First Term","Second Term","Third Term"];
const SESSIONS  = Array.from({length:7},(_,i)=>{const y=2023+i;return `${y}/${y+1}`;});
const DURATIONS = ["30 Minutes","45 Minutes","1 Hour","1 Hour 30 Minutes","2 Hours","2 Hours 30 Minutes","3 Hours"];
const MCQ_OPTS  = [5,10,15,20,25,30,40,50,60,70];
const ESS_OPTS  = [2,3,4,5,6,7,8,10];
const DEFAULT_MCQ_INSTR = "From the options lettered A–D, choose the most correct answer. Each question carries one (1) mark.";
const DEFAULT_ESS_INSTR = "Answer all questions. Write clearly and in full sentences. Show all working where applicable.";

// ─── Primitive Components ────────────────────────────────────────────────────
const Lbl = ({children,note}) => (
  <p style={{fontFamily:F.body,fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 8px 0",display:"flex",alignItems:"center",gap:6}}>
    {children}{note&&<span style={{fontWeight:400,textTransform:"none",letterSpacing:0,fontSize:11,color:C.mutedLight}}>{note}</span>}
  </p>
);

const base={width:"100%",padding:"12px 15px",borderRadius:9,border:`1.5px solid ${C.border}`,fontFamily:F.body,fontSize:14,color:C.ink,background:C.white,outline:"none",boxSizing:"border-box",transition:"border-color 0.18s,box-shadow 0.18s"};
const onF=e=>{e.target.style.borderColor=C.gold;e.target.style.boxShadow=`0 0 0 3px rgba(200,149,42,0.22)`;};
const onB=e=>{e.target.style.borderColor=C.border;e.target.style.boxShadow="none";};
const Inp=({style,...p})=><input style={{...base,...style}} onFocus={onF} onBlur={onB} {...p}/>;
const Txt=({style,...p})=><textarea style={{...base,resize:"vertical",...style}} onFocus={onF} onBlur={onB} {...p}/>;
const Sel=({children,style,...p})=>(
  <select style={{...base,appearance:"none",cursor:"pointer",paddingRight:36,
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%237a8fa8'/%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat",backgroundPosition:"right 14px center",...style}}
    onFocus={onF} onBlur={onB} {...p}>{children}</select>
);

const Card=({children,style})=>(
  <div style={{background:C.white,borderRadius:16,border:`1px solid ${C.border}`,
    boxShadow:"0 1px 3px rgba(12,31,63,0.06),0 4px 24px rgba(12,31,63,0.05)",overflow:"hidden",...style}}>
    {children}
  </div>
);

const CardTop=({icon,title,sub})=>(
  <div style={{padding:"20px 32px",borderBottom:`1px solid ${C.border}`,background:C.cream,display:"flex",alignItems:"center",gap:14}}>
    <div style={{width:40,height:40,borderRadius:10,background:C.navy,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{icon}</div>
    <div>
      <p style={{fontFamily:F.display,fontSize:18,fontWeight:700,color:C.navy,margin:0,lineHeight:1.2}}>{title}</p>
      {sub&&<p style={{fontFamily:F.body,fontSize:12,color:C.muted,margin:"3px 0 0 0"}}>{sub}</p>}
    </div>
  </div>
);

const Divider=({label})=>(
  <div style={{display:"flex",alignItems:"center",gap:12,margin:"26px 0 20px"}}>
    <div style={{height:1,flex:1,background:C.border}}/>
    <span style={{fontFamily:F.body,fontSize:10.5,fontWeight:700,color:C.muted,textTransform:"uppercase",letterSpacing:"0.12em",whiteSpace:"nowrap"}}>{label}</span>
    <div style={{height:1,flex:1,background:C.border}}/>
  </div>
);

const BtnBase=({children,bg,color,border,style,...p})=>(
  <button style={{background:bg,color,border:border||"none",fontFamily:F.body,fontSize:13,fontWeight:600,padding:"9px 16px",borderRadius:8,cursor:"pointer",transition:"all 0.18s",display:"inline-flex",alignItems:"center",gap:6,...style}} {...p}>{children}</button>
);
const BtnPrimary =p=><BtnBase bg={C.navy}     color={C.white}   {...p}/>;
const BtnGold    =p=><BtnBase bg={C.gold}     color={C.ink}     {...p}/>;
const BtnGhost   =p=><BtnBase bg="transparent" color={C.slate}  border={`1.5px solid ${C.border}`} {...p}/>;
const BtnSuccess =p=><BtnBase bg={C.successBg} color={C.success} border={`1.5px solid rgba(21,128,61,0.3)`} {...p}/>;

const IconBtn=({title,onClick,children,style})=>(
  <button title={title} onClick={onClick}
    style={{background:"transparent",border:"none",cursor:"pointer",padding:"6px 7px",borderRadius:7,color:C.muted,display:"flex",alignItems:"center",transition:"all 0.15s",...style}}
    onMouseEnter={e=>{e.currentTarget.style.background=C.cream;e.currentTarget.style.color=C.navy;}}
    onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=C.muted;}}>
    {children}
  </button>
);

const Spinner=({size=16,color=C.white})=>(
  <span style={{display:"inline-block",width:size,height:size,border:"2px solid rgba(255,255,255,0.25)",borderTopColor:color,borderRadius:"50%",animation:"spin 0.7s linear infinite",flexShrink:0}}/>
);

const Badge=({children,color=C.navy})=>(
  <span style={{background:`${color}14`,color,fontFamily:F.body,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,border:`1px solid ${color}28`}}>{children}</span>
);

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function QuizBuilder() {
  const [schoolName,   setSchoolName]   = useState("");
  const [session,      setSession]      = useState("2024/2025");
  const [term,         setTerm]         = useState("First Term");
  const [examDuration, setExamDuration] = useState("1 Hour");
  const [mode,         setMode]         = useState("topic");
  const [subject,      setSubject]      = useState("");
  const [customSub,    setCustomSub]    = useState("");
  const [topics,       setTopics]       = useState([]);
  const [topicInput,   setTopicInput]   = useState("");
  const [pastedText,   setPastedText]   = useState("");
  const [gradeLevel,   setGradeLevel]   = useState(GRADE_LEVELS[7]);
  const [difficulty,   setDifficulty]   = useState(DIFFICULTIES[1]);
  const [mcqCount,     setMcqCount]     = useState(10);
  const [essayCount,   setEssayCount]   = useState(3);
  const [quiz,         setQuiz]         = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [activeTab,    setActiveTab]    = useState("questions");
  const [mcqInstr,     setMcqInstr]     = useState(DEFAULT_MCQ_INSTR);
  const [essayInstr,   setEssayInstr]   = useState(DEFAULT_ESS_INSTR);
  const [editMcqI,     setEditMcqI]     = useState(false);
  const [editEssI,     setEditEssI]     = useState(false);
  const [editingMcq,   setEditingMcq]   = useState(null);
  const [editingEssay, setEditingEssay] = useState(null);
  const [regenerating, setRegenerating] = useState(new Set());
  const [history,      setHistory]      = useState([]);
  const [showHistory,  setShowHistory]  = useState(false);
  const [progress,     setProgress]     = useState("");

  const finalSub = subject==="Other"?customSub:subject;

  const addTopic=()=>{
    const t=topicInput.trim();
    if(!t||topics.length>=15||topics.includes(t))return;
    setTopics(p=>[...p,t]);setTopicInput("");
  };
  const removeTopic=i=>setTopics(p=>p.filter((_,j)=>j!==i));
  const onTopicKey=e=>{if(e.key==="Enter"||e.key===","){e.preventDefault();addTopic();}};

  const waecNote=()=>gradeLevel.waec
    ?`CRITICAL: This is for ${gradeLevel.value} (${gradeLevel.curriculum}). ALL questions MUST strictly follow WAEC and NECO examination standards — authentic command words (State, Explain, Describe, Differentiate, Discuss with examples, With the aid of a labelled diagram, Calculate and explain, Outline, Enumerate, etc.), depth, marking conventions, and question structure as seen in official WAEC/NECO past questions.`
    :`Follow the Nigerian ${gradeLevel.curriculum} curriculum standards for ${gradeLevel.value}.`;

  const contentBlock=()=>mode==="topic"
    ?`Subject: ${finalSub}\nTopics covered:\n${topics.map((t,i)=>`${i+1}. ${t}`).join("\n")}`
    :`Subject: ${finalSub||"General"}\nContent provided:\n\n${pastedText}`;

  // ── Shared API caller ────────────────────────────────────────────────────────
  const callAPI=async(prompt,maxTok=4000)=>{
    const r=await fetch("https://api.anthropic.com/v1/messages",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:maxTok,messages:[{role:"user",content:prompt}]})
    });
    const d=await r.json();
    // Handle API-level errors (rate limits, auth, etc.) cleanly
    if(d.error){
      if(d.error.type==="exceeded_limit"||d.error.type==="rate_limit_error"){
        throw new Error("API rate limit reached. Please wait a moment and try again.");
      }
      throw new Error(d.error.message||"API error");
    }
    // Also check if the response itself contains an error object (some error shapes)
    const firstBlock=d.content?.[0];
    if(!firstBlock) throw new Error("Empty response from API. Please try again.");
    const raw=d.content.map(b=>b.text||"").join("").replace(/```json|```/g,"").trim();
    if(!raw) throw new Error("Empty response from API. Please try again.");
    try{
      return JSON.parse(raw);
    }catch(parseErr){
      throw new Error("Response was cut off. Please try again — this usually resolves itself.");
    }
  };

  // ── Generate ─────────────────────────────────────────────────────────────────
  const generate=async()=>{
    if(!finalSub){setError("Please select a subject.");return;}
    if(mode==="topic"&&topics.length===0){setError("Add at least one topic.");return;}
    if(mode==="paste"&&!pastedText.trim()){setError("Please paste some content.");return;}
    setError("");setLoading(true);setQuiz(null);

    const ctx=contentBlock();
    const wn=waecNote();
    // With max_tokens=4000 we can fit ~20 MCQs comfortably per call (~150 tokens each)
    const batchSize=20;
    const batches=Math.ceil(mcqCount/batchSize);

    try{
      // ── CALL 1+: Generate MCQs in batches of 10 ──────────────────────────
      let allMcq=[];
      for(let b=0;b<batches;b++){
        const start=b*batchSize+1;
        const count=Math.min(batchSize,mcqCount-b*batchSize);
        const existingQs=allMcq.map(q=>q.question);
        const avoidBlock=existingQs.length>0?`\nDo NOT repeat these questions: ${existingQs.slice(-20).map((q,i)=>`${i+1}. ${q}`).join(" | ")}`:"";

        const mcqPrompt=`You are a senior Nigerian curriculum examination officer.
${ctx}
Grade Level: ${gradeLevel.label} | Difficulty: ${difficulty.label} — ${difficulty.sub}
${wn}

Generate exactly ${count} multiple choice questions (questions ${start} to ${start+count-1} of ${mcqCount} total).${avoidBlock}

RULES:
1. 4 options each labeled A, B, C, D.
2. SCRAMBLE answers randomly — vary correct answer position, no clustering around any letter.
3. Nigerian curriculum context and examples.
4. Difficulty strictly: ${difficulty.value} — ${difficulty.sub}

Return ONLY a JSON array, no markdown:
[{"question":"","options":{"A":"","B":"","C":"","D":""},"answer":"A","explanation":""}]`;

        const batch=await callAPI(mcqPrompt,4000);
        if(!Array.isArray(batch)) throw new Error("MCQ batch not array");
        allMcq=[...allMcq,...batch];
        setProgress(`Generating questions… (${Math.min(allMcq.length,mcqCount)}/${mcqCount} MCQs done)`);
      }
      allMcq=allMcq.slice(0,mcqCount);

      // ── Generate Essays — all in one call (10 max fits within 4000 tokens) ─
      let allEssay=[];
      const essayBatchSize=10;
      const essayBatches=Math.ceil(essayCount/essayBatchSize);
      for(let b=0;b<essayBatches;b++){
        const startNum=b*essayBatchSize+1;
        const count=Math.min(essayBatchSize,essayCount-b*essayBatchSize);
        setProgress(`Generating theory questions… (${allEssay.length}/${essayCount} done)`);

        const essayPrompt=`You are a senior Nigerian curriculum examination officer.
${ctx}
Grade Level: ${gradeLevel.label} | Difficulty: ${difficulty.label} — ${difficulty.sub}
Subject: ${finalSub}
${wn}

Generate exactly ${count} theory/essay question${count>1?"s":""} numbered ${startNum} to ${startNum+count-1}.

RULES:
1. Every question MUST have sub-questions: minimum (a) and (b), optionally (c)/(d).
2. Use WAEC/NECO command words: State, Explain, Describe, Differentiate, Discuss with examples, Outline, Enumerate, Calculate and explain, etc.
3. Sub-question marks MUST sum exactly to parent totalMarks.
4. Nigerian curriculum context. Difficulty: ${difficulty.value} — ${difficulty.sub}
5. Keep explanations concise (1–2 sentences each).

Return ONLY a JSON array, no markdown:
[{"questionNumber":${startNum},"totalMarks":10,"subQuestions":[{"label":"a","question":"","marks":4,"markingGuide":""},{"label":"b","question":"","marks":6,"markingGuide":""}]}]`;

        const batch=await callAPI(essayPrompt,4000);
        if(!Array.isArray(batch)) throw new Error("Essay batch not array");
        allEssay=[...allEssay,...batch];
      }
      allEssay=allEssay.slice(0,essayCount);

      // ── Merge into final quiz object ─────────────────────────────────────
      const mcqTotal=allMcq.length;
      const essayTotal=allEssay.reduce((s,q)=>s+q.totalMarks,0);
      const title=`${finalSub} Examination — ${gradeLevel.label}`;
      const merged={
        title,
        subject:finalSub,
        topics:mode==="topic"?topics:["Based on provided content"],
        gradeLevel:gradeLevel.label,
        curriculum:gradeLevel.curriculum,
        difficulty:difficulty.label,
        totalMarks:mcqTotal+essayTotal,
        mcqMarksEach:1,
        mcq:allMcq,
        essay:allEssay,
      };

      setQuiz(merged);
      setMcqInstr(DEFAULT_MCQ_INSTR);
      setEssayInstr(DEFAULT_ESS_INSTR);
      setActiveTab("questions");
      setHistory(prev=>[{
        id:Date.now(),
        date:new Date().toLocaleDateString("en-GB"),
        title:merged.title,subject:merged.subject,
        gradeLevel:gradeLevel.label,mcqCount,essayCount,quiz:merged
      },...prev].slice(0,5));

    }catch(e){
      console.error(e);
      setError(`Generation failed: ${e.message||"Unknown error"}. Please try again.`);
    }finally{
      setLoading(false);
      setProgress("");
    }
  };

  // ── Regenerate single MCQ ────────────────────────────────────────────────────
  const regenMcq=useCallback(async(index)=>{
    if(!quiz)return;
    const key=`mcq-${index}`;
    setRegenerating(p=>new Set([...p,key]));
    const existing=quiz.mcq.map(q=>q.question);
    const p=`Nigerian curriculum examination officer. Generate ONE replacement MCQ.
Subject: ${quiz.subject}, Topics: ${quiz.topics.join(", ")}, Grade: ${quiz.gradeLevel}, Difficulty: ${quiz.difficulty}
${waecNote()}
Do NOT reuse: ${existing.map((q,i)=>`${i+1}. ${q}`).join(" | ")}
Place correct answer in a truly random position (A, B, C, or D).
Return ONLY a JSON object, no markdown, no array:
{"question":"","options":{"A":"","B":"","C":"","D":""},"answer":"A","explanation":""}`;
    try{
      const newQ=await callAPI(p);
      setQuiz(prev=>({...prev,mcq:prev.mcq.map((q,i)=>i===index?newQ:q)}));
    }catch(e){}
    finally{setRegenerating(p=>{const n=new Set(p);n.delete(key);return n;});}
  },[quiz,gradeLevel]);

  // ── Regenerate single Essay ──────────────────────────────────────────────────
  const regenEssay=useCallback(async(index)=>{
    if(!quiz)return;
    const key=`essay-${index}`;
    setRegenerating(p=>new Set([...p,key]));
    const q=quiz.essay[index];
    const p=`Nigerian curriculum examination officer. Generate ONE replacement theory/essay question.
Subject: ${quiz.subject}, Topics: ${quiz.topics.join(", ")}, Grade: ${quiz.gradeLevel}, Difficulty: ${quiz.difficulty}
${waecNote()}
Question number: ${q.questionNumber}, Total marks: ${q.totalMarks}
Must be completely different. Must have at least 2 sub-questions. Sub-marks must sum to ${q.totalMarks}. Use WAEC/NECO command words.
Return ONLY a JSON object, no markdown, no array:
{"questionNumber":${q.questionNumber},"totalMarks":${q.totalMarks},"subQuestions":[{"label":"a","question":"","marks":0,"markingGuide":""}]}`;
    try{
      const newQ=await callAPI(p);
      setQuiz(prev=>({...prev,essay:prev.essay.map((q,i)=>i===index?newQ:q)}));
    }catch(e){}
    finally{setRegenerating(p=>{const n=new Set(p);n.delete(key);return n;});}
  },[quiz,gradeLevel]);

  const saveMcqEdit=()=>{if(!editingMcq)return;setQuiz(p=>({...p,mcq:p.mcq.map((q,i)=>i===editingMcq.index?editingMcq.data:q)}));setEditingMcq(null);};
  const saveEssayEdit=()=>{if(!editingEssay)return;setQuiz(p=>({...p,essay:p.essay.map((q,i)=>i===editingEssay.index?editingEssay.data:q)}));setEditingEssay(null);};

  // ── Word export helper ───────────────────────────────────────────────────────
  const dl=(html,name)=>{
    const b=new Blob(["\ufeff",html],{type:"application/msword"});
    const u=URL.createObjectURL(b);
    const a=document.createElement("a");
    a.href=u;a.download=name;
    document.body.appendChild(a);a.click();
    document.body.removeChild(a);URL.revokeObjectURL(u);
  };

  const sharedStyles=`@page{margin:2.54cm;size:A4;}body{font-family:'Times New Roman',serif;font-size:12pt;color:#111;line-height:1.7;}`;

  // ── Download full paper ──────────────────────────────────────────────────────
  const downloadWord=()=>{
    if(!quiz)return;
    const today=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
    const essayTotal=quiz.essay.reduce((s,q)=>s+q.totalMarks,0);

    let h=`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='UTF-8'><style>
${sharedStyles}
h2{font-size:12.5pt;font-weight:bold;text-transform:uppercase;border-bottom:2.5px solid #0c1f3f;padding-bottom:5px;margin:28px 0 14px 0;letter-spacing:1px;color:#0c1f3f;}
.school{text-align:center;font-size:19pt;font-weight:bold;text-transform:uppercase;letter-spacing:2.5px;margin-bottom:3px;}
.meta{text-align:center;font-size:11pt;color:#333;margin-bottom:2px;}
.box{border:2.5px solid #0c1f3f;padding:16px 22px;margin-bottom:18px;}
.fields{display:grid;grid-template-columns:2fr 1fr 1fr;gap:0 26px;margin-top:14px;}
.fl{font-size:9.5pt;color:#555;margin-bottom:2px;}
.fv{border-bottom:1pt solid #111;min-height:20px;padding:1px 0;}
.instr{background:#fdf6e8;border:1pt solid #d4a017;padding:10pt 14pt;font-size:11pt;margin-bottom:18px;}
.instr p{margin:0 0 4px 0;}
.si{font-size:11pt;font-style:italic;margin:0 0 16px 0;}
.q{margin-bottom:16px;page-break-inside:avoid;}
.qt{font-size:12pt;margin:0 0 8px 0;}
.opts{display:grid;grid-template-columns:1fr 1fr;gap:2px 24px;margin:0 0 0 22px;font-size:11.5pt;}
.sub{margin:8px 0 8px 26px;font-size:12pt;}
.mk{float:right;font-weight:bold;font-size:11pt;border:1px solid #bbb;padding:1px 8px;background:#f5f5f5;}
.lines{margin-top:6px;}
.ln{border-bottom:1px solid #ccc;height:20px;margin-bottom:4px;}
.pb{page-break-before:always;}
.kb{text-align:center;background:#0c1f3f;color:#fff;padding:13px;font-size:14pt;font-weight:bold;letter-spacing:2.5px;text-transform:uppercase;margin-bottom:14px;}
.kw{text-align:center;font-size:11pt;color:#8b0000;font-style:italic;border:1px dashed #8b0000;padding:7px;margin-bottom:18px;}
.ag{border-left:4px solid #15803d;padding:9px 13px;margin-bottom:9px;background:#f0fdf4;}
.ac{color:#15803d;font-weight:bold;font-size:12pt;}
.ae{font-style:italic;color:#444;font-size:11pt;margin-top:3px;}
.mg{border-left:4px solid #c8952a;padding:10px 14px;margin-bottom:11px;background:#fdf6e8;}
.ms{margin:6px 0 0 18px;font-size:11.5pt;}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:4px 10px;font-family:monospace;font-size:12pt;margin-bottom:18px;border:1px solid #ddd;padding:12px;background:#f8f8f8;}
</style></head><body>
<div class="box">
  <div class="school">${schoolName||"School Name"}</div>
  <div class="meta" style="font-weight:bold;font-size:13pt;margin-top:6px;">${quiz.title}</div>
  <div class="meta">${session} Academic Session &nbsp;|&nbsp; ${term} Examination</div>
  <div class="meta">Subject: <strong>${quiz.subject}</strong> &nbsp;·&nbsp; Class: <strong>${quiz.gradeLevel}</strong> &nbsp;·&nbsp; Curriculum: <strong>${quiz.curriculum}</strong></div>
  <div class="meta">Difficulty: <strong>${quiz.difficulty}</strong> &nbsp;·&nbsp; Total Marks: <strong>${quiz.totalMarks}</strong> &nbsp;·&nbsp; Duration: <strong>${examDuration}</strong></div>
  <div class="fields">
    <div><div class="fl">Candidate's Full Name</div><div class="fv">&nbsp;</div></div>
    <div><div class="fl">Class / Arm</div><div class="fv">&nbsp;</div></div>
    <div><div class="fl">Score / Total</div><div class="fv">&nbsp;</div></div>
  </div>
</div>
<div class="instr">
<p><strong>GENERAL INSTRUCTIONS:</strong></p>
<p>1. Answer <strong>ALL</strong> questions in both sections.</p>
<p>2. Section A: Choose the most correct option. Shade or circle the letter of your choice.</p>
<p>3. Section B: Write clearly and legibly. Show all workings where applicable.</p>
<p>4. Marks may be deducted for poor presentation and irrelevant answers.</p>
<p>5. Duration: <strong>${examDuration}</strong>. Begin only when the invigilator signals.</p>
</div>
<h2>SECTION A — OBJECTIVES &nbsp;<span style="font-size:11pt;font-weight:normal;">(${mcqCount} Questions · ${quiz.mcqMarksEach} mark each · Total: ${mcqCount} Marks)</span></h2>
<p class="si">${mcqInstr}</p>`;

    quiz.mcq.forEach((q,i)=>{
      h+=`<div class="q"><p class="qt"><strong>${i+1}.</strong> ${q.question}</p>
<div class="opts"><div>A.&nbsp;${q.options.A}</div><div>B.&nbsp;${q.options.B}</div><div>C.&nbsp;${q.options.C}</div><div>D.&nbsp;${q.options.D}</div></div></div>`;
    });

    const essTotal=quiz.essay.reduce((s,q)=>s+q.totalMarks,0);
    h+=`<h2>SECTION B — THEORY / ESSAY &nbsp;<span style="font-size:11pt;font-weight:normal;">(${essayCount} Questions · Total: ${essTotal} Marks)</span></h2>
<p class="si">${essayInstr}</p>`;

    quiz.essay.forEach(q=>{
      h+=`<div class="q"><p class="qt"><strong>Question ${q.questionNumber}</strong><span class="mk">[${q.totalMarks} marks]</span></p>`;
      q.subQuestions.forEach(s=>{
        h+=`<div class="sub"><strong>(${s.label})</strong> ${s.question}<span class="mk">[${s.marks} marks]</span>
<div class="lines">${Array(7).fill('<div class="ln"></div>').join("")}</div></div>`;
      });
      h+=`</div>`;
    });

    h+=`<div class="pb"></div>
<div class="kb">✦ &nbsp; EXAMINER'S ANSWER KEY — STRICTLY CONFIDENTIAL &nbsp; ✦</div>
<div class="kw">⚠ For the examiner / teacher only. Do not reproduce or distribute to candidates.</div>
<p style="font-size:11pt;"><strong>Paper:</strong> ${quiz.subject} &nbsp;·&nbsp; <strong>Class:</strong> ${quiz.gradeLevel} &nbsp;·&nbsp; <strong>Session:</strong> ${session} ${term} &nbsp;·&nbsp; <strong>Printed:</strong> ${today}</p>
<h2>SECTION A — OBJECTIVE ANSWERS</h2>
<div class="grid">${quiz.mcq.map((q,i)=>`<div><strong>${i+1}.</strong> ${q.answer}</div>`).join("")}</div>
<h2>DETAILED EXPLANATIONS</h2>`;

    quiz.mcq.forEach((q,i)=>{
      h+=`<div class="ag"><p style="font-size:11.5pt;margin:0 0 3px 0;"><strong>Q${i+1}.</strong> ${q.question}</p>
<p class="ac">✓ ${q.answer}. &nbsp;${q.options[q.answer]}</p>
<p class="ae">${q.explanation}</p></div>`;
    });

    h+=`<h2>SECTION B — MARKING GUIDE</h2>`;
    quiz.essay.forEach(q=>{
      h+=`<div class="mg"><p style="font-size:12.5pt;font-weight:bold;margin:0 0 8px 0;">Question ${q.questionNumber}<span class="mk">[${q.totalMarks} marks]</span></p>`;
      q.subQuestions.forEach(s=>{
        h+=`<div class="ms"><strong>(${s.label})</strong> ${s.question}<span class="mk">[${s.marks} marks]</span><br><em>Key Points: </em>${s.markingGuide}</div>`;
      });
      h+=`</div>`;
    });
    h+=`</body></html>`;

    dl(h,`${quiz.subject.replace(/\s/g,"_")}_${gradeLevel.value.replace(/\s/g,"_")}_${term.replace(/\s/g,"_")}.doc`);
  };

  // ── Download marking scheme only ─────────────────────────────────────────────
  const downloadMarkingScheme=()=>{
    if(!quiz)return;
    const today=new Date().toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"});
    let h=`<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head><meta charset='UTF-8'><style>
${sharedStyles}
h2{font-size:13pt;font-weight:bold;border-bottom:2px solid #0c1f3f;padding-bottom:4px;margin:26px 0 14px 0;text-transform:uppercase;color:#0c1f3f;}
.banner{text-align:center;background:#0c1f3f;color:#fff;padding:16px;font-size:16pt;font-weight:bold;letter-spacing:3px;text-transform:uppercase;margin-bottom:5px;}
.warn{text-align:center;background:#fff3cd;border:1.5px solid #c8952a;color:#7a4f00;font-weight:bold;padding:9px;font-size:11pt;margin-bottom:18px;}
.meta{font-size:11pt;margin-bottom:4px;}
.grid{display:grid;grid-template-columns:repeat(5,1fr);gap:5px 12px;font-size:13pt;font-family:monospace;margin-bottom:18px;border:1px solid #ddd;padding:14px;background:#f8f8f8;}
.ag{border-left:4px solid #15803d;padding:9px 13px;margin-bottom:9px;background:#f0fdf4;page-break-inside:avoid;}
.ac{color:#15803d;font-weight:bold;font-size:12pt;}
.ae{font-style:italic;color:#444;font-size:11pt;margin-top:3px;}
.mg{border-left:4px solid #c8952a;padding:10px 14px;margin-bottom:12px;background:#fdf6e8;page-break-inside:avoid;}
.ms{margin:7px 0 0 18px;font-size:11.5pt;}
.mk{float:right;font-weight:bold;font-size:11pt;border:1px solid #ccc;padding:1px 8px;background:#f5f5f5;}
</style></head><body>
<div class="banner">MARKING SCHEME</div>
<div class="warn">⚠ EXAMINER'S COPY — STRICTLY CONFIDENTIAL — DO NOT DISTRIBUTE TO CANDIDATES</div>
<p class="meta"><strong>School:</strong> ${schoolName||"—"}</p>
<p class="meta"><strong>Paper:</strong> ${quiz.title}</p>
<p class="meta"><strong>Subject:</strong> ${quiz.subject} &nbsp;·&nbsp; <strong>Class:</strong> ${quiz.gradeLevel} &nbsp;·&nbsp; <strong>Curriculum:</strong> ${quiz.curriculum}</p>
<p class="meta"><strong>Session:</strong> ${session} ${term} &nbsp;·&nbsp; <strong>Difficulty:</strong> ${quiz.difficulty} &nbsp;·&nbsp; <strong>Total Marks:</strong> ${quiz.totalMarks}</p>
<p class="meta"><strong>Date Printed:</strong> ${today}</p>
<h2>SECTION A — OBJECTIVE ANSWERS (Quick Reference)</h2>
<div class="grid">${quiz.mcq.map((q,i)=>`<div><strong>${i+1}.</strong> ${q.answer}</div>`).join("")}</div>
<h2>SECTION A — DETAILED EXPLANATIONS</h2>`;

    quiz.mcq.forEach((q,i)=>{
      h+=`<div class="ag">
<p style="font-size:11.5pt;margin:0 0 3px 0;"><strong>Q${i+1}.</strong> ${q.question}</p>
<p class="ac">✓ Correct: ${q.answer}. &nbsp;${q.options[q.answer]}</p>
<p class="ae">Reason: ${q.explanation}</p></div>`;
    });

    h+=`<h2>SECTION B — THEORY MARKING GUIDE</h2>`;
    quiz.essay.forEach(q=>{
      h+=`<div class="mg"><p style="font-size:12.5pt;font-weight:bold;margin:0 0 8px 0;">Question ${q.questionNumber}<span class="mk">[${q.totalMarks} marks]</span></p>`;
      q.subQuestions.forEach(s=>{
        h+=`<div class="ms"><strong>(${s.label})</strong> ${s.question}<span class="mk">[${s.marks} marks]</span><br><em style="color:#555;">Key Points Required: </em>${s.markingGuide}</div>`;
      });
      h+=`</div>`;
    });
    h+=`</body></html>`;

    dl(h,`MARKING_SCHEME_${quiz.subject.replace(/\s/g,"_")}_${gradeLevel.value.replace(/\s/g,"_")}.doc`);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div style={{minHeight:"100vh",background:C.bg,fontFamily:F.body}}>
      <style>{`
        *{box-sizing:border-box;} ::placeholder{color:#adbdd0;}
        ::-webkit-scrollbar{width:5px;} ::-webkit-scrollbar-thumb{background:#c4cdd8;border-radius:3px;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
        .lift{transition:all 0.2s;} .lift:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 26px rgba(12,31,63,0.22)!important;}
        .diff-c{transition:all 0.18s;cursor:pointer;} .diff-c:hover{border-color:#c8952a!important;transform:translateY(-2px);}
        .tab-b{transition:all 0.18s;cursor:pointer;} .tab-b:hover{color:#0c1f3f!important;}
        .q-row .q-acts{opacity:0;transition:opacity 0.15s;} .q-row:hover .q-acts{opacity:1;}
        .pill{transition:all 0.2s;} .pill:hover{border-color:#c8952a!important;}
        .hist-c{transition:all 0.18s;cursor:pointer;} .hist-c:hover{border-color:#c8952a!important;background:#fdf6e8!important;}
        .instr-area{transition:border-color 0.18s,box-shadow 0.18s;}
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header style={{background:C.navy,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,
          backgroundImage:`radial-gradient(ellipse at 78% 45%,rgba(200,149,42,0.11) 0%,transparent 55%),
            repeating-linear-gradient(45deg,transparent,transparent 50px,rgba(255,255,255,0.012) 50px,rgba(255,255,255,0.012) 100px)`}}/>
        <div style={{position:"absolute",top:0,left:0,right:0,height:3,
          background:`linear-gradient(90deg,transparent 0%,${C.gold} 20%,${C.goldLight} 50%,${C.gold} 80%,transparent 100%)`}}/>

        <div style={{maxWidth:980,margin:"0 auto",padding:"30px 32px 26px",position:"relative",display:"flex",justifyContent:"space-between",alignItems:"flex-end",gap:20,flexWrap:"wrap"}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:11,marginBottom:13}}>
              <div style={{width:46,height:46,background:`linear-gradient(135deg,${C.gold},${C.goldLight})`,borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,boxShadow:`0 4px 16px rgba(200,149,42,0.4)`,flexShrink:0}}>📋</div>
              <div>
                <div style={{display:"flex",alignItems:"baseline",gap:9}}>
                  <span style={{fontFamily:F.display,fontSize:25,fontWeight:700,color:C.white,letterSpacing:"0.01em",lineHeight:1}}>EduCraft</span>
                  <span style={{fontFamily:F.body,fontSize:11,color:"rgba(200,149,42,0.6)",letterSpacing:"0.07em",fontWeight:500}}>powered by Abbey</span>
                </div>
              </div>
            </div>
            <h1 style={{fontFamily:F.display,fontSize:36,fontWeight:700,color:C.white,margin:"0 0 9px 0",lineHeight:1.12}}>
              Quiz & Assessment Builder
            </h1>
            <p style={{fontFamily:F.body,fontSize:14,color:C.mutedLight,margin:0,maxWidth:520,lineHeight:1.65}}>
              Nigerian curriculum–aligned exam papers. WAEC &amp; NECO standards built in.<br/>Generate, edit, and export a print-ready paper in seconds.
            </p>
          </div>

          <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"flex-end"}}>
            {gradeLevel.waec&&(
              <div style={{background:"rgba(200,149,42,0.14)",border:`1px solid rgba(200,149,42,0.35)`,borderRadius:10,padding:"9px 18px",textAlign:"center"}}>
                <p style={{fontFamily:F.body,fontSize:10,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 2px 0"}}>Active Mode</p>
                <p style={{fontFamily:F.body,fontSize:14,fontWeight:700,color:C.white,margin:0}}>WAEC / NECO</p>
              </div>
            )}
            {history.length>0&&(
              <button onClick={()=>setShowHistory(p=>!p)}
                style={{background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.16)",borderRadius:9,padding:"10px 18px",color:C.mutedLight,fontFamily:F.body,fontSize:13,fontWeight:500,cursor:"pointer",transition:"all 0.2s"}}
                onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.14)"}
                onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
                🕐 &nbsp;History ({history.length})
              </button>
            )}
          </div>
        </div>
      </header>

      <div style={{maxWidth:980,margin:"0 auto",padding:"30px 32px 70px"}}>

        {/* History panel */}
        {showHistory&&history.length>0&&(
          <Card style={{marginBottom:22,animation:"fadeUp 0.3s ease"}}>
            <CardTop icon="🕐" title="Recent Quizzes" sub="Click any entry to restore it — up to 5 are kept this session"/>
            <div style={{padding:"22px 28px",display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))",gap:12}}>
              {history.map(h=>(
                <div key={h.id} className="hist-c" onClick={()=>{setQuiz(h.quiz);setMcqCount(h.mcqCount);setEssayCount(h.essayCount);setActiveTab("questions");setShowHistory(false);}}
                  style={{border:`1.5px solid ${C.border}`,borderRadius:11,padding:"16px 18px",background:C.white}}>
                  <p style={{fontFamily:F.display,fontSize:16,fontWeight:700,color:C.navy,margin:"0 0 5px 0",lineHeight:1.3}}>{h.title}</p>
                  <p style={{fontFamily:F.body,fontSize:12,color:C.muted,margin:"0 0 10px 0"}}>{h.subject} · {h.gradeLevel}</p>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                    <Badge color={C.navy}>{h.mcqCount} MCQ</Badge>
                    <Badge color={C.amber}>{h.essayCount} Essay</Badge>
                    <Badge color={C.muted}>{h.date}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* ══ SECTION 1: SCHOOL INFORMATION ══════════════════════════════════ */}
        <Card style={{marginBottom:18,animation:"fadeUp 0.35s ease"}}>
          <CardTop icon="🏫" title="School Information" sub="These details appear on the printed exam paper header"/>
          <div style={{padding:"30px 32px"}}>
            <div style={{marginBottom:24}}>
              <Lbl>School / Institution Name</Lbl>
              <Inp value={schoolName} onChange={e=>setSchoolName(e.target.value)}
                placeholder="e.g. Greenfield Secondary School, Abuja" style={{fontSize:15,padding:"14px 16px"}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:20}}>
              <div>
                <Lbl>Academic Session</Lbl>
                <Sel value={session} onChange={e=>setSession(e.target.value)}>
                  {SESSIONS.map(s=><option key={s}>{s}</option>)}
                </Sel>
              </div>
              <div>
                <Lbl>Term</Lbl>
                <Sel value={term} onChange={e=>setTerm(e.target.value)}>
                  {TERMS.map(t=><option key={t}>{t}</option>)}
                </Sel>
              </div>
              <div>
                <Lbl>Exam Duration</Lbl>
                <Sel value={examDuration} onChange={e=>setExamDuration(e.target.value)}>
                  {DURATIONS.map(d=><option key={d}>{d}</option>)}
                </Sel>
              </div>
            </div>
          </div>
        </Card>

        {/* ══ SECTION 2: CONTENT SOURCE ══════════════════════════════════════ */}
        <Card style={{marginBottom:18,animation:"fadeUp 0.35s ease 0.04s both"}}>
          <CardTop icon="📚" title="Content Source" sub="Enter subject & topics, or paste your notes or textbook content directly"/>
          <div style={{padding:"30px 32px"}}>
            <div style={{display:"flex",gap:10,marginBottom:26}}>
              {[["topic","📌","Enter Subject & Topics"],["paste","📋","Paste Content / Notes"]].map(([val,icon,label])=>(
                <button key={val} className="pill" onClick={()=>setMode(val)} style={{
                  flex:1,padding:"14px 18px",borderRadius:10,border:"2px solid",
                  borderColor:mode===val?C.navy:C.border,
                  background:mode===val?C.navy:C.white,
                  color:mode===val?C.white:C.slate,
                  fontFamily:F.body,fontSize:14,fontWeight:600,cursor:"pointer",
                  display:"flex",alignItems:"center",justifyContent:"center",gap:8
                }}>{icon} {label}</button>
              ))}
            </div>

            <div style={{display:"grid",gridTemplateColumns:subject==="Other"?"1fr 1fr":"1.2fr 1fr",gap:18,marginBottom:22}}>
              <div>
                <Lbl>Subject</Lbl>
                <Sel value={subject} onChange={e=>setSubject(e.target.value)}>
                  <option value="">— Select subject —</option>
                  {SUBJECTS.map(s=><option key={s}>{s}</option>)}
                </Sel>
              </div>
              {subject==="Other"&&(
                <div>
                  <Lbl>Custom Subject Name</Lbl>
                  <Inp value={customSub} onChange={e=>setCustomSub(e.target.value)} placeholder="Enter your subject name..."/>
                </div>
              )}
            </div>

            {mode==="topic"?(
              <div>
                <Lbl note="— press Enter or comma after each · max 15 topics">Topics</Lbl>
                <div className="instr-area" style={{border:`1.5px solid ${C.border}`,borderRadius:10,padding:"11px 13px",background:C.white,minHeight:58,display:"flex",flexWrap:"wrap",gap:7,alignItems:"center",cursor:"text"}}
                  onClick={()=>document.getElementById("t-inp").focus()}>
                  {topics.map((t,i)=>(
                    <span key={i} style={{background:C.navy,color:C.white,borderRadius:7,padding:"5px 12px",fontSize:13,fontFamily:F.body,fontWeight:500,display:"flex",alignItems:"center",gap:7}}>
                      {t}
                      <span onClick={e=>{e.stopPropagation();removeTopic(i);}} style={{cursor:"pointer",opacity:.65,fontSize:15,lineHeight:1,fontWeight:700}}>×</span>
                    </span>
                  ))}
                  {topics.length<15&&(
                    <input id="t-inp" value={topicInput} onChange={e=>setTopicInput(e.target.value)} onKeyDown={onTopicKey} onBlur={addTopic}
                      placeholder={topics.length===0?"e.g. Photosynthesis, Cell Division — press Enter to add...":"Add another topic..."}
                      style={{border:"none",outline:"none",fontFamily:F.body,fontSize:14,color:C.ink,background:"transparent",flex:1,minWidth:200}}/>
                  )}
                </div>
                <p style={{fontFamily:F.body,fontSize:12,color:C.muted,marginTop:7}}>
                  {topics.length===0?"No topics added yet.":`${topics.length}/15 topic${topics.length>1?"s":""} · All topics will be combined into one unified exam paper`}
                </p>
              </div>
            ):(
              <div>
                <Lbl>Paste Your Content</Lbl>
                <Txt value={pastedText} onChange={e=>setPastedText(e.target.value)} rows={7}
                  placeholder="Paste textbook passages, class notes, or any material here. All questions will be drawn directly from this content..."/>
              </div>
            )}
          </div>
        </Card>

        {/* ══ SECTION 3: QUIZ SETTINGS ════════════════════════════════════════ */}
        <Card style={{marginBottom:22,animation:"fadeUp 0.35s ease 0.08s both"}}>
          <CardTop icon="⚙️" title="Quiz Settings" sub="Configure grade level, question counts, and difficulty — all in one place"/>
          <div style={{padding:"30px 32px"}}>

            {/* Grade level — full width, prominent */}
            <div style={{marginBottom:8}}>
              <Lbl>Grade Level / Class</Lbl>
              <div style={{position:"relative"}}>
                <Sel value={gradeLevel.value} onChange={e=>setGradeLevel(GRADE_LEVELS.find(g=>g.value===e.target.value))}
                  style={{fontSize:15,padding:"13px 16px",paddingRight:gradeLevel.waec?180:40}}>
                  {GRADE_LEVELS.map(g=><option key={g.value} value={g.value}>{g.label}</option>)}
                </Sel>
                {gradeLevel.waec&&(
                  <div style={{position:"absolute",right:42,top:"50%",transform:"translateY(-50%)",display:"flex",alignItems:"center",gap:6,pointerEvents:"none"}}>
                    <span style={{width:7,height:7,borderRadius:"50%",background:C.gold,display:"inline-block",boxShadow:`0 0 0 3px rgba(200,149,42,0.28)`}}/>
                    <span style={{fontFamily:F.body,fontSize:12,fontWeight:700,color:C.gold,whiteSpace:"nowrap"}}>WAEC / NECO Active</span>
                  </div>
                )}
              </div>
              <p style={{fontFamily:F.body,fontSize:12.5,color:gradeLevel.waec?C.amber:C.muted,margin:"8px 0 0 0",lineHeight:1.6}}>
                {gradeLevel.waec
                  ?"⚡ Questions will strictly follow WAEC and NECO examination standards — command words, question depth, and mark allocation are applied accordingly."
                  :`Curriculum: ${gradeLevel.curriculum}`}
              </p>
            </div>

            <Divider label="Question Count"/>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:22,marginBottom:4}}>
              <div>
                <Lbl>Objective Questions (MCQ)</Lbl>
                <Sel value={mcqCount} onChange={e=>setMcqCount(Number(e.target.value))}>
                  {MCQ_OPTS.map(n=><option key={n} value={n}>{n} Questions</option>)}
                </Sel>
                <p style={{fontFamily:F.body,fontSize:12,color:C.muted,marginTop:7}}>1 mark each · Total: <strong style={{color:C.ink}}>{mcqCount} marks</strong></p>
              </div>
              <div>
                <Lbl>Theory / Essay Questions</Lbl>
                <Sel value={essayCount} onChange={e=>setEssayCount(Number(e.target.value))}>
                  {ESS_OPTS.map(n=><option key={n} value={n}>{n} Questions</option>)}
                </Sel>
                <p style={{fontFamily:F.body,fontSize:12,color:C.muted,marginTop:7}}>Each includes sub-questions (a, b, c…) with individual mark allocations</p>
              </div>
            </div>

            <Divider label="Difficulty Level"/>

            <p style={{fontFamily:F.body,fontSize:13,color:C.slate,margin:"0 0 15px 0"}}>Select one level — applied uniformly across all questions in this paper.</p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:12}}>
              {DIFFICULTIES.map(d=>{
                const active=difficulty.value===d.value;
                return(
                  <div key={d.value} className="diff-c" onClick={()=>setDifficulty(d)} style={{
                    border:"2px solid",borderColor:active?d.dot:C.border,
                    background:active?`${d.dot}10`:C.white,
                    borderRadius:12,padding:"16px 15px 14px",position:"relative"
                  }}>
                    <div style={{width:11,height:11,borderRadius:"50%",background:d.dot,marginBottom:10,transition:"box-shadow 0.18s",boxShadow:active?`0 0 0 4px ${d.dot}2a`:"none"}}/>
                    <p style={{fontFamily:F.body,fontSize:14,fontWeight:700,color:active?C.ink:C.slate,margin:"0 0 5px 0",lineHeight:1.3}}>{d.label}</p>
                    <p style={{fontFamily:F.body,fontSize:11.5,color:C.muted,margin:0,lineHeight:1.5}}>{d.sub}</p>
                    {active&&<div style={{position:"absolute",top:10,right:12,fontSize:16,color:d.dot}}>✓</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        {/* Error */}
        {error&&(
          <div style={{background:C.redBg,border:`1.5px solid rgba(220,38,38,0.3)`,borderRadius:10,padding:"13px 18px",marginBottom:18,color:C.red,fontFamily:F.body,fontSize:14,display:"flex",gap:9,alignItems:"center"}}>
            ⚠️ {error}
          </div>
        )}

        {/* Generate button */}
        <button className="lift" onClick={generate} disabled={loading} style={{
          width:"100%",padding:"19px",borderRadius:13,border:"none",
          background:loading?C.navyMid:C.navy,color:C.white,
          fontSize:16,fontFamily:F.body,fontWeight:700,letterSpacing:"0.04em",
          cursor:loading?"not-allowed":"pointer",
          boxShadow:`0 4px 22px rgba(12,31,63,0.28)`,
          display:"flex",alignItems:"center",justifyContent:"center",gap:12,
          animation:"fadeUp 0.35s ease 0.12s both"
        }}>
          {loading?(<><Spinner/><span style={{animation:"pulse 1.6s ease infinite"}}>{progress||"Generating your exam paper…"}</span></>)
                  :(<>✦ &nbsp; Generate Examination Paper</>)}
        </button>

        {/* ══ QUIZ OUTPUT ══════════════════════════════════════════════════════ */}
        {quiz&&(
          <div style={{marginTop:32,animation:"fadeUp 0.45s ease"}}>
            <Card>
              {/* Output header */}
              <div style={{background:`linear-gradient(135deg,${C.navy} 0%,${C.navyMid} 100%)`,padding:"24px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:16,flexWrap:"wrap"}}>
                <div>
                  <p style={{fontFamily:F.body,fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:"0.1em",margin:"0 0 5px 0"}}>{quiz.curriculum}</p>
                  <h2 style={{fontFamily:F.display,fontSize:23,color:C.white,margin:"0 0 5px 0",fontWeight:700,lineHeight:1.2}}>{quiz.title}</h2>
                  <p style={{fontFamily:F.body,fontSize:13.5,color:C.mutedLight,margin:0}}>
                    {quiz.subject} &nbsp;·&nbsp; {quiz.gradeLevel} &nbsp;·&nbsp; {quiz.difficulty} &nbsp;·&nbsp;
                    <strong style={{color:C.white}}>{quiz.totalMarks} total marks</strong>
                  </p>
                </div>
                <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
                  <button className="lift" onClick={downloadMarkingScheme} style={{
                    background:"rgba(255,255,255,0.1)",border:"1.5px solid rgba(255,255,255,0.22)",
                    borderRadius:9,padding:"11px 18px",color:C.white,fontFamily:F.body,
                    fontWeight:600,fontSize:13.5,cursor:"pointer",display:"flex",alignItems:"center",gap:7
                  }}>🔑 &nbsp;Marking Scheme</button>
                  <button className="lift" onClick={downloadWord} style={{
                    background:C.gold,border:"none",borderRadius:9,padding:"11px 22px",
                    color:C.ink,fontFamily:F.body,fontWeight:700,fontSize:13.5,cursor:"pointer",
                    display:"flex",alignItems:"center",gap:7,
                    boxShadow:`0 4px 16px rgba(200,149,42,0.45)`
                  }}>⬇ &nbsp;Full Exam Paper (.doc)</button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{background:C.navyMid,display:"flex",borderTop:`1px solid ${C.navyLight}`,padding:"0 6px"}}>
                {[["questions","📋  Questions"],["answers","🔑  Answer Key & Marking Guide"]].map(([tab,label])=>(
                  <button key={tab} className="tab-b" onClick={()=>setActiveTab(tab)} style={{
                    padding:"13px 26px",border:"none",fontFamily:F.body,fontSize:13.5,fontWeight:600,
                    background:activeTab===tab?C.cream:"transparent",
                    color:activeTab===tab?C.navy:C.mutedLight,
                    borderRadius:activeTab===tab?"8px 8px 0 0":0,marginTop:4
                  }}>{label}</button>
                ))}
              </div>

              <div style={{background:C.cream,padding:"32px 32px"}}>

                {/* ─ QUESTIONS TAB ────────────────────────────────────────── */}
                {activeTab==="questions"&&(<>

                  {/* Section A */}
                  <div style={{marginBottom:38}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,paddingBottom:13,borderBottom:`2.5px solid ${C.navy}`}}>
                      <span style={{background:C.navy,color:C.white,borderRadius:7,padding:"5px 14px",fontFamily:F.body,fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Section A</span>
                      <h3 style={{fontFamily:F.display,fontSize:20,color:C.navy,margin:0,fontWeight:700}}>Objectives — Multiple Choice</h3>
                      <span style={{fontFamily:F.body,fontSize:12,color:C.muted,marginLeft:"auto"}}>{mcqCount} questions · {quiz.mcqMarksEach} mark each</span>
                    </div>

                    {/* Editable MCQ instruction */}
                    <div style={{background:C.amberBg,border:`1.5px solid ${C.goldBorder}`,borderRadius:10,padding:"13px 16px",marginBottom:22,display:"flex",alignItems:editMcqI?"flex-start":"center",gap:10}}>
                      <span style={{fontSize:16,flexShrink:0,marginTop:editMcqI?2:0}}>📌</span>
                      {editMcqI?(
                        <div style={{flex:1}}>
                          <Txt value={mcqInstr} onChange={e=>setMcqInstr(e.target.value)} rows={2} style={{fontSize:13,marginBottom:9}}/>
                          <BtnSuccess onClick={()=>setEditMcqI(false)}>✓ Save</BtnSuccess>
                        </div>
                      ):(
                        <>
                          <p style={{fontFamily:F.body,fontSize:13,color:"#7a5c10",margin:0,flex:1,lineHeight:1.6}}>{mcqInstr}</p>
                          <IconBtn title="Edit instruction" onClick={()=>setEditMcqI(true)} style={{fontSize:15}}>✏️</IconBtn>
                        </>
                      )}
                    </div>

                    {quiz.mcq.map((q,i)=>{
                      const rk=`mcq-${i}`;
                      const isR=regenerating.has(rk);
                      const isE=editingMcq?.index===i;
                      if(isE){
                        const d=editingMcq.data;
                        return(
                          <div key={i} style={{marginBottom:18,background:C.white,borderRadius:12,border:`2px solid ${C.gold}`,padding:"20px 22px"}}>
                            <p style={{fontFamily:F.body,fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:"0.09em",margin:"0 0 14px 0"}}>✏️ Editing Question {i+1}</p>
                            <div style={{marginBottom:14}}>
                              <Lbl>Question Text</Lbl>
                              <Txt value={d.question} onChange={e=>setEditingMcq(p=>({...p,data:{...p.data,question:e.target.value}}))} rows={3}/>
                            </div>
                            {["A","B","C","D"].map(l=>(
                              <div key={l} style={{marginBottom:10}}>
                                <Lbl>Option {l}</Lbl>
                                <div style={{display:"flex",gap:9,alignItems:"center"}}>
                                  <Inp value={d.options[l]} onChange={e=>setEditingMcq(p=>({...p,data:{...p.data,options:{...p.data.options,[l]:e.target.value}}}))} style={{flex:1}}/>
                                  <button onClick={()=>setEditingMcq(p=>({...p,data:{...p.data,answer:l}}))} style={{
                                    background:d.answer===l?C.success:C.white,color:d.answer===l?C.white:C.muted,
                                    border:`2px solid`,borderColor:d.answer===l?C.success:C.border,
                                    borderRadius:8,padding:"10px 14px",cursor:"pointer",fontFamily:F.body,fontSize:12,fontWeight:700,whiteSpace:"nowrap",transition:"all 0.15s"
                                  }}>{d.answer===l?"✓ Correct":"Set Correct"}</button>
                                </div>
                              </div>
                            ))}
                            <div style={{marginTop:10}}>
                              <Lbl>Explanation</Lbl>
                              <Inp value={d.explanation} onChange={e=>setEditingMcq(p=>({...p,data:{...p.data,explanation:e.target.value}}))}/>
                            </div>
                            <div style={{display:"flex",gap:10,marginTop:18}}>
                              <BtnSuccess onClick={saveMcqEdit}>✓ Save Changes</BtnSuccess>
                              <BtnGhost onClick={()=>setEditingMcq(null)}>Cancel</BtnGhost>
                            </div>
                          </div>
                        );
                      }
                      return(
                        <div key={i} className="q-row" style={{marginBottom:14,paddingBottom:14,borderBottom:i<quiz.mcq.length-1?`1px solid ${C.border}`:"none",display:"flex",gap:14,alignItems:"flex-start",opacity:isR?.45:1,transition:"opacity 0.2s"}}>
                          <div style={{flex:1}}>
                            <p style={{fontFamily:F.body,fontSize:14,color:C.ink,margin:"0 0 11px 0",lineHeight:1.6}}>
                              <strong style={{color:C.navy,marginRight:6}}>{i+1}.</strong>{q.question}
                            </p>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"5px 22px",marginLeft:20}}>
                              {["A","B","C","D"].map(l=>(
                                <p key={l} style={{fontFamily:F.body,fontSize:13.5,color:"#334",margin:0,padding:"3px 0"}}>
                                  <strong style={{color:C.navy,marginRight:4}}>{l}.</strong>{q.options[l]}
                                </p>
                              ))}
                            </div>
                          </div>
                          <div className="q-acts" style={{display:"flex",gap:2,flexShrink:0,paddingTop:2}}>
                            {isR?<Spinner size={18} color={C.navy}/>:(<>
                              <IconBtn title="Edit question" onClick={()=>setEditingMcq({index:i,data:JSON.parse(JSON.stringify(q))})}>✏️</IconBtn>
                              <IconBtn title="Regenerate question" onClick={()=>regenMcq(i)}>🔄</IconBtn>
                            </>)}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Section B */}
                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:18,paddingBottom:13,borderBottom:`2.5px solid ${C.navy}`}}>
                      <span style={{background:C.gold,color:C.ink,borderRadius:7,padding:"5px 14px",fontFamily:F.body,fontSize:11,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase"}}>Section B</span>
                      <h3 style={{fontFamily:F.display,fontSize:20,color:C.navy,margin:0,fontWeight:700}}>Theory / Essay Questions</h3>
                      <span style={{fontFamily:F.body,fontSize:12,color:C.muted,marginLeft:"auto"}}>{essayCount} questions</span>
                    </div>

                    {/* Editable essay instruction */}
                    <div style={{background:C.amberBg,border:`1.5px solid ${C.goldBorder}`,borderRadius:10,padding:"13px 16px",marginBottom:22,display:"flex",alignItems:editEssI?"flex-start":"center",gap:10}}>
                      <span style={{fontSize:16,flexShrink:0,marginTop:editEssI?2:0}}>📌</span>
                      {editEssI?(
                        <div style={{flex:1}}>
                          <Txt value={essayInstr} onChange={e=>setEssayInstr(e.target.value)} rows={2} style={{fontSize:13,marginBottom:9}}/>
                          <BtnSuccess onClick={()=>setEditEssI(false)}>✓ Save</BtnSuccess>
                        </div>
                      ):(
                        <>
                          <p style={{fontFamily:F.body,fontSize:13,color:"#7a5c10",margin:0,flex:1,lineHeight:1.6}}>{essayInstr}</p>
                          <IconBtn title="Edit instruction" onClick={()=>setEditEssI(true)} style={{fontSize:15}}>✏️</IconBtn>
                        </>
                      )}
                    </div>

                    {quiz.essay.map((q,i)=>{
                      const rk=`essay-${i}`;
                      const isR=regenerating.has(rk);
                      const isE=editingEssay?.index===i;
                      if(isE){
                        const d=editingEssay.data;
                        return(
                          <div key={i} style={{marginBottom:20,background:C.white,borderRadius:12,border:`2px solid ${C.gold}`,padding:"20px 22px"}}>
                            <p style={{fontFamily:F.body,fontSize:11,fontWeight:700,color:C.gold,textTransform:"uppercase",letterSpacing:"0.09em",margin:"0 0 16px 0"}}>✏️ Editing Question {q.questionNumber}</p>
                            {d.subQuestions.map((sub,si)=>(
                              <div key={si} style={{marginBottom:18,paddingBottom:18,borderBottom:si<d.subQuestions.length-1?`1px solid ${C.border}`:"none"}}>
                                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:9}}>
                                  <span style={{fontFamily:F.body,fontSize:13,fontWeight:700,color:C.navy,minWidth:28,flexShrink:0}}>({sub.label})</span>
                                  <Lbl>Sub-question text</Lbl>
                                  <div style={{display:"flex",alignItems:"center",gap:7,marginLeft:"auto"}}>
                                    <span style={{fontFamily:F.body,fontSize:11,fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",whiteSpace:"nowrap"}}>Marks:</span>
                                    <input type="number" value={sub.marks} min={1} max={30}
                                      onChange={e=>setEditingEssay(p=>{const sq=[...p.data.subQuestions];sq[si]={...sq[si],marks:Number(e.target.value)};return{...p,data:{...p.data,subQuestions:sq,totalMarks:sq.reduce((s,x)=>s+x.marks,0)}};})
                                      }
                                      style={{...base,width:72,padding:"9px 10px",fontSize:13}}/>
                                  </div>
                                </div>
                                <Txt value={sub.question} rows={3}
                                  onChange={e=>setEditingEssay(p=>{const sq=[...p.data.subQuestions];sq[si]={...sq[si],question:e.target.value};return{...p,data:{...p.data,subQuestions:sq}};})}/>
                              </div>
                            ))}
                            <div style={{display:"flex",gap:10,marginTop:4}}>
                              <BtnSuccess onClick={saveEssayEdit}>✓ Save Changes</BtnSuccess>
                              <BtnGhost onClick={()=>setEditingEssay(null)}>Cancel</BtnGhost>
                            </div>
                          </div>
                        );
                      }
                      return(
                        <div key={i} className="q-row" style={{marginBottom:20,paddingBottom:20,borderBottom:i<quiz.essay.length-1?`1px solid ${C.border}`:"none",display:"flex",gap:14,alignItems:"flex-start",opacity:isR?.45:1,transition:"opacity 0.2s"}}>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
                              <p style={{fontFamily:F.body,fontSize:14,fontWeight:700,color:C.navy,margin:0}}>Question {q.questionNumber}</p>
                              <span style={{background:C.navy,color:C.white,borderRadius:7,padding:"3px 14px",fontFamily:F.body,fontSize:12,fontWeight:700}}>{q.totalMarks} marks</span>
                            </div>
                            {q.subQuestions.map((sub,si)=>(
                              <div key={si} style={{display:"flex",gap:12,marginBottom:11,paddingLeft:16,borderLeft:`3px solid ${si===0?C.gold:C.border}`}}>
                                <strong style={{fontFamily:F.body,fontSize:14,color:C.navy,minWidth:24,flexShrink:0}}>({sub.label})</strong>
                                <div style={{flex:1}}>
                                  <p style={{fontFamily:F.body,fontSize:14,color:C.ink,margin:"0 0 5px 0",lineHeight:1.65}}>{sub.question}</p>
                                  <span style={{fontFamily:F.body,fontSize:12,color:C.muted}}>[ {sub.marks} mark{sub.marks>1?"s":""} ]</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="q-acts" style={{display:"flex",gap:2,flexShrink:0,paddingTop:2}}>
                            {isR?<Spinner size={18} color={C.navy}/>:(<>
                              <IconBtn title="Edit question" onClick={()=>setEditingEssay({index:i,data:JSON.parse(JSON.stringify(q))})}>✏️</IconBtn>
                              <IconBtn title="Regenerate question" onClick={()=>regenEssay(i)}>🔄</IconBtn>
                            </>)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>)}

                {/* ─ ANSWER KEY TAB ───────────────────────────────────────── */}
                {activeTab==="answers"&&(<>
                  <div style={{background:C.amberBg,border:`1.5px solid ${C.goldBorder}`,borderRadius:10,padding:"14px 18px",marginBottom:26,display:"flex",gap:10,alignItems:"flex-start"}}>
                    <span style={{fontSize:18,flexShrink:0}}>🔒</span>
                    <p style={{fontFamily:F.body,fontSize:13.5,color:"#7a5c10",margin:0,lineHeight:1.65}}>
                      <strong>Examiner's Copy.</strong> The answer key and marking guide are placed on a separate, clearly labelled confidential page in both downloads. Candidates will never see this section.
                    </p>
                  </div>

                  <div style={{marginBottom:32}}>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,paddingBottom:12,borderBottom:`2.5px solid ${C.navy}`}}>
                      <span style={{background:C.navy,color:C.white,borderRadius:7,padding:"5px 14px",fontFamily:F.body,fontSize:11,fontWeight:700,textTransform:"uppercase"}}>Section A</span>
                      <h3 style={{fontFamily:F.display,fontSize:20,color:C.navy,margin:0,fontWeight:700}}>Objective Answers</h3>
                    </div>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:8,marginBottom:24}}>
                      {quiz.mcq.map((q,i)=>(
                        <div key={i} style={{background:C.white,border:`1px solid ${C.border}`,borderRadius:9,padding:"8px 4px",textAlign:"center"}}>
                          <p style={{fontFamily:F.body,fontSize:10,color:C.muted,margin:"0 0 2px 0"}}>{i+1}</p>
                          <p style={{fontFamily:F.body,fontSize:18,fontWeight:700,color:C.success,margin:0}}>{q.answer}</p>
                        </div>
                      ))}
                    </div>
                    {quiz.mcq.map((q,i)=>(
                      <div key={i} style={{background:C.white,borderLeft:`4px solid ${C.success}`,padding:"11px 16px",borderRadius:"0 9px 9px 0",marginBottom:9}}>
                        <p style={{fontFamily:F.body,fontSize:13.5,color:C.ink,margin:"0 0 5px 0"}}><strong>Q{i+1}.</strong> {q.question}</p>
                        <p style={{fontFamily:F.body,fontSize:13.5,color:C.success,fontWeight:700,margin:"0 0 4px 0"}}>✓ {q.answer}. &nbsp;{q.options[q.answer]}</p>
                        <p style={{fontFamily:F.body,fontSize:12.5,color:C.muted,margin:0,fontStyle:"italic",lineHeight:1.6}}>{q.explanation}</p>
                      </div>
                    ))}
                  </div>

                  <div>
                    <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:16,paddingBottom:12,borderBottom:`2.5px solid ${C.navy}`}}>
                      <span style={{background:C.gold,color:C.ink,borderRadius:7,padding:"5px 14px",fontFamily:F.body,fontSize:11,fontWeight:700,textTransform:"uppercase"}}>Section B</span>
                      <h3 style={{fontFamily:F.display,fontSize:20,color:C.navy,margin:0,fontWeight:700}}>Theory Marking Guide</h3>
                    </div>
                    {quiz.essay.map(q=>(
                      <div key={q.questionNumber} style={{background:C.white,borderLeft:`4px solid ${C.gold}`,padding:"15px 18px",borderRadius:"0 10px 10px 0",marginBottom:13}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12}}>
                          <p style={{fontFamily:F.body,fontSize:14,fontWeight:700,color:C.navy,margin:0}}>Question {q.questionNumber}</p>
                          <span style={{background:C.gold,color:C.ink,borderRadius:7,padding:"3px 13px",fontFamily:F.body,fontSize:12,fontWeight:700}}>{q.totalMarks} marks</span>
                        </div>
                        {q.subQuestions.map((sub,si)=>(
                          <div key={si} style={{marginBottom:11,paddingLeft:16,borderLeft:`2px solid #f0e4c0`}}>
                            <p style={{fontFamily:F.body,fontSize:14,color:C.ink,margin:"0 0 6px 0",lineHeight:1.65}}>
                              <strong>({sub.label})</strong> {sub.question}&nbsp;
                              <span style={{color:C.gold,fontWeight:700}}>[ {sub.marks} mark{sub.marks>1?"s":""} ]</span>
                            </p>
                            <p style={{fontFamily:F.body,fontSize:13,color:"#555",margin:0,lineHeight:1.7}}>
                              <strong style={{color:C.navy}}>Key Points: </strong>{sub.markingGuide}
                            </p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </>)}

              </div>
            </Card>
          </div>
        )}

        {/* Footer */}
        <div style={{textAlign:"center",marginTop:46,paddingTop:22,borderTop:`1px solid ${C.border}`}}>
          <p style={{fontFamily:F.body,fontSize:12.5,color:C.mutedLight,margin:0}}>
            <strong style={{color:C.navy}}>EduCraft</strong> &nbsp;·&nbsp; Nigerian curriculum-aligned examination builder
            &nbsp;·&nbsp; <span style={{color:C.gold}}>Powered by Abbey</span>
          </p>
        </div>
      </div>
    </div>
  );
}
