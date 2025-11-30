import { GoogleGenAI, Modality } from "@google/genai";

// Initialize Gemini Client
// Note: In a real production app, you might proxy this or handle keys more securely.
// For this demo, we assume process.env.API_KEY is available as per instructions.
const getClient = () => {
    if (!process.env.API_KEY) return null;
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateOralDrillAudio = async (numbers: number[], interval: number): Promise<string | null> => {
    const client = getClient();
    if (!client) {
        console.warn("Gemini API Key missing");
        return null;
    }

    try {
        // Construct a prompt to read the numbers
        const numberString = numbers.join(". ");
        const prompt = `Read the following numbers clearly for a mental math dictation practice. 
        Pause for approximately ${interval} seconds between each number. 
        The numbers are: ${numberString}. 
        End by saying "That is all".`;

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return `data:audio/wav;base64,${base64Audio}`;
        }
    } catch (error) {
        console.error("Gemini TTS Error:", error);
    }
    return null;
};

export const getPerformanceAdvice = async (accuracy: number, speed: string): Promise<string> => {
     const client = getClient();
     if (!client) return "Good job! Keep practicing.";

     try {
         const response = await client.models.generateContent({
             model: "gemini-2.5-flash",
             contents: `I just completed an abacus math drill. My accuracy was ${accuracy}% and my time was ${speed}. Give me a one-sentence encouraging tip like a strict but kind math teacher.`,
         });
         return response.text || "Keep practicing to improve speed and accuracy!";
     } catch (e) {
         return "Great effort! Practice makes perfect.";
     }
}
