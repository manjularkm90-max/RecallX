import { useState } from "react";
import "./App.css";

function App() {
  const [material, setMaterial] = useState("");
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState([]);

  const analyzeMaterial = async () => {
    if (!material.trim()) {
      alert("Please enter your study material.");
      return;
    }

    setLoading(true);
    setAiResult(null);
    setCurrentQuestion(0);
    setScore(0);
    setQuizFinished(false);
    setWrongAnswers([]);

    try {
      const response = await fetch("https://recallx-backend-3u5u.onrender.com/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          material: material,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "AI analysis failed");
      }

      let resultText = data.result;

      resultText = resultText
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      const parsedResult = JSON.parse(resultText);

      setAiResult(parsedResult);
    } catch (error) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (selectedAnswer) => {
    const question = aiResult.quiz[currentQuestion];

    if (selectedAnswer === question.answer) {
      setScore((previousScore) => previousScore + 1);
    } else {
      setWrongAnswers((previous) => [
        ...previous,
        {
          question: question.question,
          selected: selectedAnswer,
          correct: question.answer,
        },
      ]);
    }

    if (currentQuestion + 1 < aiResult.quiz.length) {
      setCurrentQuestion((previous) => previous + 1);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setQuizFinished(false);
    setWrongAnswers([]);
  };

  const getPerformanceMessage = () => {
    const total = aiResult.quiz.length;
    const percentage = (score / total) * 100;

    if (percentage >= 80) {
      return "Excellent understanding! Keep practicing to maintain your knowledge.";
    }

    if (percentage >= 60) {
      return "Good progress! Review your weak areas once more.";
    }

    return "You need more practice. Focus on the learning gaps below.";
  };

  return (
    <div className="app">

      {/* NAVBAR */}
      <nav className="navbar">
        <div>
          <h1>RecallX 🧠</h1>
          <p>AI That Learns How You Learn</p>
        </div>

        <div className="nav-badge">
          Adaptive Learning
        </div>
      </nav>

      <main className="container">

        {/* HERO */}
        <section className="hero">
          <div className="hero-icon">🧠</div>

          <h2>
            Learn Smarter. Remember Better.
          </h2>

          <p>
            RecallX analyzes your study material, creates
            personalized quizzes, detects your learning gaps,
            and recommends what you should revise.
          </p>
        </section>

        {/* STUDY MATERIAL */}
        <section className="card material-card">

          <div className="section-title">
            <span>📚</span>

            <div>
              <h2>Study Material</h2>
              <p>
                Enter your notes or learning content
              </p>
            </div>
          </div>

          <textarea
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
            placeholder="Paste your study material here..."
          />

          <button
            className="primary-button"
            onClick={analyzeMaterial}
            disabled={loading}
          >
            {loading
              ? "🤖 Analyzing..."
              : "Analyze with AI ✨"}
          </button>

        </section>

        {/* AI RESULTS */}
        {aiResult && (
          <>

            {/* CONCEPTS */}
            <section className="card">

              <div className="section-title">
                <span>📖</span>

                <div>
                  <h2>Important Concepts</h2>
                  <p>
                    Key concepts extracted by RecallX
                  </p>
                </div>
              </div>

              <div className="concept-grid">

                {aiResult.concepts.map(
                  (concept, index) => (
                    <div
                      className="concept"
                      key={index}
                    >
                      <span>
                        {index + 1}
                      </span>

                      <p>{concept}</p>
                    </div>
                  )
                )}

              </div>

            </section>

            {/* QUIZ */}
            <section className="card quiz-card">

              <div className="section-title">
                <span>📝</span>

                <div>
                  <h2>Personalized Quiz</h2>

                  <p>
                    Answer based on what you learned
                  </p>
                </div>
              </div>

              {!quizFinished ? (

                <div className="quiz">

                  <div className="quiz-progress">
                    Question {currentQuestion + 1} of{" "}
                    {aiResult.quiz.length}
                  </div>

                  <h3>
                    {aiResult.quiz[currentQuestion].question}
                  </h3>

                  <div className="options">

                    {aiResult.quiz[
                      currentQuestion
                    ].options.map(
                      (option, index) => (

                        <button
                          key={index}
                          className="option-button"
                          onClick={() =>
                            handleAnswer(option)
                          }
                        >

                          <span>
                            {String.fromCharCode(
                              65 + index
                            )}
                          </span>

                          {option}

                        </button>

                      )
                    )}

                  </div>

                </div>

              ) : (

                <div className="quiz-result">

                  <div className="score-circle">
                    {score}/{aiResult.quiz.length}
                  </div>

                  <h2>
                    Quiz Completed 🎉
                  </h2>

                  <p>
                    {getPerformanceMessage()}
                  </p>

                  <p>
                    Your Score:{" "}
                    <strong>
                      {score}/{aiResult.quiz.length}
                    </strong>
                  </p>

                  <button
                    className="secondary-button"
                    onClick={restartQuiz}
                  >
                    🔄 Try Again
                  </button>

                </div>

              )}

            </section>

            {/* ACTUAL LEARNING GAPS */}
            {quizFinished && (
              <section className="card">

                <div className="section-title">
                  <span>🎯</span>

                  <div>
                    <h2>
                      Your Learning Gaps
                    </h2>

                    <p>
                      Based on your actual quiz mistakes
                    </p>
                  </div>
                </div>

                {wrongAnswers.length === 0 ? (

                  <div className="success-box">
                    🎉 Excellent! You answered every
                    question correctly.
                  </div>

                ) : (

                  <div>

                    <div className="gap-summary">
                      You made{" "}
                      <strong>
                        {wrongAnswers.length}
                      </strong>{" "}
                      mistake
                      {wrongAnswers.length > 1
                        ? "s"
                        : ""}.
                    </div>

                    <div className="wrong-list">

                      {wrongAnswers.map(
                        (item, index) => (

                          <div
                            className="wrong-item"
                            key={index}
                          >

                            <h3>
                              ❌ Question {index + 1}
                            </h3>

                            <p>
                              {item.question}
                            </p>

                            <p className="wrong-answer">
                              Your answer:{" "}
                              {item.selected}
                            </p>

                            <p className="correct-answer">
                              Correct answer:{" "}
                              {item.correct}
                            </p>

                          </div>

                        )
                      )}

                    </div>

                    <div className="focus-box">

                      <h3>
                        🧠 Focus on These Areas
                      </h3>

                      {aiResult.learningGaps.map(
                        (gap, index) => (
                          <div
                            className="focus-topic"
                            key={index}
                          >
                            🔴 {gap}
                          </div>
                        )
                      )}

                    </div>

                  </div>

                )}

              </section>
            )}

            {/* REVISION PLAN */}
            <section className="card">

              <div className="section-title">
                <span>🔄</span>

                <div>
                  <h2>
                    Smart Revision Plan
                  </h2>

                  <p>
                    Personalized learning schedule
                  </p>
                </div>
              </div>

              <div className="revision-grid">

                <div className="revision-item">

                  <div className="revision-day">
                    TODAY
                  </div>

                  <h3>
                    📖 Review
                  </h3>

                  <p>
                    {aiResult.revisionPlan.today}
                  </p>

                </div>

                <div className="revision-item">

                  <div className="revision-day">
                    TOMORROW
                  </div>

                  <h3>
                    📝 Practice
                  </h3>

                  <p>
                    {aiResult.revisionPlan.tomorrow}
                  </p>

                </div>

                <div className="revision-item">

                  <div className="revision-day">
                    DAY 3
                  </div>

                  <h3>
                    🎯 Assessment
                  </h3>

                  <p>
                    {aiResult.revisionPlan.day3}
                  </p>

                </div>

              </div>

            </section>

            {/* AI INSIGHT */}
            <section className="insight-card">

              <div className="insight-icon">
                💡
              </div>

              <div>

                <h2>
                  RecallX Insight
                </h2>

                <p>
                  {aiResult.insight}
                </p>

              </div>

            </section>

          </>
        )}

        {/* HOW IT WORKS */}
        <section className="how-section">

          <h2>
            How RecallX Works
          </h2>

          <div className="steps">

            <div className="step">

              <div className="step-number">
                STEP 1
              </div>

              <div className="step-icon">
                📚
              </div>

              <h3>
                Learn
              </h3>

              <p>
                Enter your study material.
              </p>

            </div>

            <div className="step">

              <div className="step-number">
                STEP 2
              </div>

              <div className="step-icon">
                📝
              </div>

              <h3>
                Practice
              </h3>

              <p>
                AI generates personalized questions.
              </p>

            </div>

            <div className="step">

              <div className="step-number">
                STEP 3
              </div>

              <div className="step-icon">
                🎯
              </div>

              <h3>
                Identify
              </h3>

              <p>
                RecallX detects your learning gaps.
              </p>

            </div>

            <div className="step">

              <div className="step-number">
                STEP 4
              </div>

              <div className="step-icon">
                🔄
              </div>

              <h3>
                Improve
              </h3>

              <p>
                Get a personalized revision plan.
              </p>

            </div>

          </div>

        </section>

      </main>

      <footer>

        <h3>
          RecallX 🧠
        </h3>

        <p>
          Learn it. Practice it. Remember it.
        </p>

      </footer>

    </div>
  );
}

export default App;
