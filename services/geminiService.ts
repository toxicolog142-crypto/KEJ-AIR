import { GoogleGenAI } from "@google/genai";
import { Flight, FlightStatus } from "../types";

export const fetchFlightSchedule = async (targetDate: Date): Promise<Flight[]> => {
  const dateString = targetDate.toISOString().split('T')[0];
  const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  const dateRu = targetDate.toLocaleDateString('ru-RU', dateOptions);

  // Prompt updated to use Google Search for grounding
  const prompt = `
    Check current weather in Kemerovo (KEJ) and flight arrivals for today/tomorrow (${dateRu}).
    
    Based on the search results (weather conditions like fog/snow or actual flight delays on Flightradar24/airkem.ru), generate a JSON array of arrival flights for Kemerovo Airport (KEJ).
    
    RULES:
    1. If search shows BAD WEATHER (fog, snowstorm) in Kemerovo, mark 30-50% of flights as "Задерживается" (Delayed) and set 'estimatedTime' 1-3 hours later than 'scheduledTime'.
    2. Use REAL flight numbers for KEJ:
       - SU 1450 (SVO), S7 2606 (DME), N4 307 (LED) - Morning.
       - S7 5313 (OVB), KV 101 (KJA) - Evening/Regional.
    3. Status MUST be one of: "Прибыл", "Ожидается", "Задерживается", "Отменен", "По расписанию", "В пути".
    4. 'estimatedTime' is mandatory. If on time, it equals 'scheduledTime'.
    5. STRICTLY OUTPUT ONLY RAW JSON ARRAY. No markdown, no explanations.
    
    JSON Structure per object:
    {
      "id": "unique_string",
      "flightNumber": "string (e.g. SU 1450)",
      "airline": "string",
      "origin": "string (City)",
      "scheduledTime": "HH:mm",
      "estimatedTime": "HH:mm",
      "status": "string",
      "aircraft": "string"
    }
  `;

  try {
    // Initialize AI client here to prevent "process is not defined" crash on app load
    // if the environment variables aren't set correctly in the global scope.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable real-time search
        // responseMimeType cannot be used with tools, so we parse text manually
      },
    });

    // Log grounding metadata for debugging or display (optional)
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      console.log("Grounding sources:", response.candidates[0].groundingMetadata.groundingChunks);
    }

    const text = response.text || "[]";
    
    // Cleanup markdown code blocks if present to get pure JSON
    const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();
    
    // Find the array part in case there is extra text
    const arrayMatch = jsonString.match(/\[.*\]/s);
    const cleanJson = arrayMatch ? arrayMatch[0] : "[]";

    const rawData = JSON.parse(cleanJson);
    
    const flights: Flight[] = rawData.map((f: any) => ({
      ...f,
      date: dateString,
      // Fallback logic if AI misses estimatedTime
      estimatedTime: f.estimatedTime || f.scheduledTime 
    }));

    return flights.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));

  } catch (error) {
    console.error("Error fetching schedule:", error);
    // Re-throw to let the UI handle the error state
    throw error;
  }
};