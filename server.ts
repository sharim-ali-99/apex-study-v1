import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '20mb' }));

// AI Companion Endpoint
app.post('/api/ai-companion', async (req, res) => {
  try {
    const { prompt, image, context } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY detected in environment. Using built-in local schedule processor.',
        actions: []
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = `You are "Atlas", an action-first student execution assistant.
CRITICAL MANDATE:
- When the student says ANYTHING they have to do, need to do, or have coming up (e.g. "I have to study math tomorrow", "Physics test on Friday", "I have class at 10am", "Finish biology report", "Gym at 5pm", "Read chapter 3"):
  JUST DO IT IMMEDIATELY!
- NEVER tell the user to format commands.
- NEVER ask the user if they want you to add it.
- NEVER give passive advice without generating the action.
- YOU MUST ALWAYS generate the "ADD_TASK" and/or "ADD_SLOT" action in the JSON response whenever any task, test, homework, project, class, or obligation is mentioned.

You MUST respond strictly in valid JSON with this schema:
{
  "message": "Direct, short confirmation. Example: 'Done. Added Physics Lab due Friday to your checkmarks.'",
  "actions": [
    {
      "type": "ADD_TASK" | "UPDATE_TASK" | "DELETE_TASK" | "ADD_SLOT" | "DELETE_SLOT" | "CLEAR_COMPLETED" | "ADD_PROBLEM_REVIEW",
      "summary": "Short confirmation string",
      "data": { ... }
    }
  ]
}

Action Data Specifications:
- ADD_TASK data:
  {
    "title": string,
    "description"?: string,
    "category": "Homework" | "Project" | "Exam Prep" | "Personal Goal" | "Club / Activity",
    "priority": "High" | "Medium" | "Low",
    "status": "todo" | "in_progress",
    "dueDate": string (YYYY-MM-DD format, calculate relative to current date. Default to tomorrow if not specified),
    "dueTime"?: string ("23:59" or specified time),
    "subject"?: string,
    "subtasks"?: [ { "title": string, "completed": false } ],
    "tags"?: string[]
  }
- ADD_SLOT data (for timetable):
- ADD_SLOT data:
  {
    "dayOfWeek": "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday",
    "date"?: string ("YYYY-MM-DD" if attached to a specific date),
    "startTime": string ("HH:MM" 24h format),
    "endTime": string ("HH:MM" 24h format),
    "subject": string,
    "type": "Lecture" | "Lab" | "Tutorial" | "Study Block" | "Exam" | "Sports" | "Workshop" | "Other",
    "location"?: string,
    "instructor"?: string,
    "color": string (e.g. "blue", "crimson", "emerald", "amber", "indigo", "violet", "slate"),
    "notes"?: string,
    "isOccasional"?: boolean
  }
- ADD_PROBLEM_REVIEW data:
  {
    "title": string,
    "subject"?: string,
    "category": "Academic Difficulty" | "Concept Blocker" | "Schedule Clash" | "Time Management" | "Exam Prep",
    "severity": "High Priority" | "Moderate" | "Minor Issue",
    "status": "Active" | "Under Review",
    "description": string,
    "actionPlan": string,
    "reflectionNotes": string
  }
- UPDATE_TASK data: { "id": string, "status"?: "completed" | "todo" }
- DELETE_TASK data: { "id": string }
- DELETE_SLOT data: { "id": string }

CRITICAL RULES:
- When a user adds a test, exam, class, or event with a specific date or day, add it directly as an ADD_SLOT with the "date" field and type "Exam" or "Lecture". Do NOT spawn extra duplicate "prepare for test" homework tasks in the daily task list unless the user explicitly asks for a preparation task!
- Always respect the user's instructions directly without asking rhetorical questions or confirming commands. Just execute the actions.

Current System Context provided by student:
${JSON.stringify(context || {}, null, 2)}
`;

    const contents: any[] = [];

    let userPromptText = prompt || 'Analyze this document/image and organize my student dashboard.';
    if (context?.currentDate) {
      userPromptText += `\n[Reference Date: ${context.currentDate}, Day: ${context.currentDay}]`;
    }

    if (image && image.dataUrl) {
      const match = image.dataUrl.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        const mimeType = match[1];
        const base64Data = match[2];
        contents.push({
          inlineData: {
            mimeType,
            data: base64Data
          }
        });
      }
    }

    contents.push({ text: userPromptText });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        temperature: 0.2
      }
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Clean possible markdown code fences
      const cleaned = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.status(200).json(parsedData);
  } catch (error: any) {
    console.error('Gemini API companion error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to process AI companion request',
      fallback: true
    });
  }
});

// Mount Vite or serve static files
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`ApexStudy server running on http://0.0.0.0:${port}`);
  });
}

startServer();
