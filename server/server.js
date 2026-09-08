require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.post("/analyze", async (req, res) => {
  try {
    const { material } = req.body;

    if (!material || !material.trim()) {
      return res.status(400).json({
        error: "Study material is required",
      });
    }

    const prompt = `
You are RecallX, an adaptive AI learning assistant.

Analyze the student's study material and return ONLY valid JSON.

Do not use markdown.
Do not use code blocks.

Return exactly this structure:

{
  "concepts": [
    "concept 1",
    "concept 2",
    "concept 3",
    "concept 4"
  ],
  "quiz": [
    {
      "question": "Question",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Option A"
    }
  ],
  "learningGaps": [
    "topic 1",
    "topic 2"
  ],
  "revisionPlan": {
    "today": "What the student should review today",
    "tomorrow": "What the student should practice tomorrow",
    "day3": "What the student should assess on day 3"
  },
  "insight": "A short personalized learning insight"
}

Rules:

- Generate exactly 5 quiz questions.
- Each question must have exactly 4 options.
- The answer must exactly match one of the options.
- Use simple language.
- Questions must be based only on the provided study material.
- Identify likely difficult or important concepts as learning gaps.
- Create a practical revision plan.

Study Material:

${material}
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
    });

    let result = response.text;

    result = result
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    // Validate JSON before sending to frontend
    const parsedResult = JSON.parse(result);

    res.json({
      result: JSON.stringify(parsedResult),
    });

  } catch (error) {
    console.error("AI ERROR:", error);

    res.status(500).json({
      error: "AI analysis failed",
      details: error.message,
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "RecallX Backend + AI is running!",
  });
});

app.listen(5000, () => {
  console.log("RecallX server running on port 5000");
});