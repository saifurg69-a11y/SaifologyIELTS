import { GoogleGenAI, Type } from "@google/genai";
import { MODELS, SYSTEM_INSTRUCTIONS } from "../constants";

// Helper to get client (assumes process.env.API_KEY is available)
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateReadingTest = async (level: string) => {
  const ai = getAiClient();
  const prompt = `Generate a short IELTS Reading passage (approx 300 words) for ${level} level. 
  Include 3 questions: 1 Multiple Choice, 1 Fill in the blank, 1 True/False.
  Return strictly JSON format with this schema:
  {
    "passage": "string",
    "questions": [
       { "id": 1, "type": "MCQ", "text": "string", "options": ["string"], "correctAnswer": "string" },
       { "id": 2, "type": "FILL_BLANK", "text": "string", "correctAnswer": "string" },
       { "id": 3, "type": "TRUE_FALSE", "text": "string", "correctAnswer": "string" }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: MODELS.TEXT,
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        systemInstruction: SYSTEM_INSTRUCTIONS.IELTS_GENERAL
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateListeningTest = async (level: string) => {
  const ai = getAiClient();
  const prompt = `Generate a simulated IELTS Listening Test script (Part 1 or Part 2) for ${level} level.
  The script should be a conversation or monologue approx 300 words.
  Include 4 questions based on the script.
  Return strictly JSON format with this schema:
  {
    "script": "string (The dialogue/monologue text)",
    "questions": [
       { "id": 1, "type": "MCQ", "text": "string", "options": ["string"], "correctAnswer": "string" },
       { "id": 2, "type": "FILL_BLANK", "text": "string", "correctAnswer": "string" }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: MODELS.TEXT,
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        systemInstruction: SYSTEM_INSTRUCTIONS.IELTS_GENERAL
    }
  });
  return JSON.parse(response.text || "{}");
};

export const generateVocabQuiz = async (level: string) => {
  const ai = getAiClient();
  const prompt = `Generate 5 IELTS Grammar or Vocabulary Multiple Choice Questions for ${level} level.
  Return strictly JSON format with this schema:
  {
    "questions": [
       { "id": 1, "type": "MCQ", "text": "string", "options": ["string"], "correctAnswer": "string", "explanation": "string" }
    ]
  }`;

  const response = await ai.models.generateContent({
    model: MODELS.TEXT,
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        systemInstruction: SYSTEM_INSTRUCTIONS.IELTS_GENERAL
    }
  });
  return JSON.parse(response.text || "{}");
};

export const evaluateWriting = async (taskType: string, question: string, essay: string) => {
    const ai = getAiClient();
    const prompt = `Evaluate this IELTS ${taskType} essay.
    Question: ${question}
    Student Essay: ${essay}
    
    Provide output in JSON:
    {
        "bandScore": number,
        "feedback": "string (markdown allowed)",
        "correctedVersion": "string"
    }`;

    const response = await ai.models.generateContent({
        model: MODELS.TEXT,
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });
    return JSON.parse(response.text || "{}");
};

export const editImage = async (base64Image: string, prompt: string) => {
    const ai = getAiClient();
    // Using gemini-2.5-flash-image for editing
    const response = await ai.models.generateContent({
        model: MODELS.IMAGE_EDIT,
        contents: {
            parts: [
                { inlineData: { mimeType: 'image/png', data: base64Image } },
                { text: prompt }
            ]
        }
    });
    
    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
            return `data:image/png;base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image generated");
};

export const generateVideo = async (prompt: string, imageBase64?: string, aspectRatio: '16:9' | '9:16' = '16:9') => {
    const ai = getAiClient();
    
    // Check for paid key (Veo requirement)
    if (window.aistudio && !await window.aistudio.hasSelectedApiKey()) {
        await window.aistudio.openSelectKey();
        // Re-instantiate after selection might be needed in a real app, 
        // but here we proceed assuming the env var injects or the browser handles it.
    }

    let operation;
    const config = {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: aspectRatio
    };

    if (imageBase64) {
        operation = await ai.models.generateVideos({
            model: MODELS.VIDEO,
            image: { imageBytes: imageBase64, mimeType: 'image/png' },
            prompt: prompt,
            config: config
        });
    } else {
        operation = await ai.models.generateVideos({
            model: MODELS.VIDEO,
            prompt: prompt,
            config: config
        });
    }

    // Polling
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const videoUri = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!videoUri) throw new Error("Video generation failed");
    
    // Fetch actual video bytes
    const vidResponse = await fetch(`${videoUri}&key=${process.env.API_KEY}`);
    const blob = await vidResponse.blob();
    return URL.createObjectURL(blob);
};