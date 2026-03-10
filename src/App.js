import QuizBuilder from './QuizBuilder';
import AuthWrapper from './AuthWrapper';

function App() {
  return (
    <AuthWrapper>
      {({ onGenerated }) => <QuizBuilder onGenerated={onGenerated} />}
    </AuthWrapper>
  );
}

export default App;
```

Press `Ctrl+S`.

---

**Step 5 — One small edit to `QuizBuilder.jsx`**

Press `Ctrl+F` in QuizBuilder.jsx and search for:
```
setQuiz(merged)
if(props.onGenerated) props.onGenerated();