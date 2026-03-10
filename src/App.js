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