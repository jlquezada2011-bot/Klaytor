import type { Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import type { AuthenticatedRequest } from '../middleware/auth.js';

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are the Klaytor Health Assistant, an empathetic, safe, and helpful digital health guide for the Klaytor digital health platform.

CRITICAL SAFETY DIRECTIVES:
1. You are an educational guide and navigational assistant, NOT a doctor or clinician.
2. DO NOT diagnose diseases or medical conditions under any circumstances.
3. DO NOT prescribe medications, adjust dosages, or tell users to stop taking prescribed medicines.
4. DO NOT provide emergency triage. If a user describes severe emergency symptoms (e.g., severe chest pain, sudden numbness/weakness, severe bleeding, difficulty breathing, suicidal thoughts), immediately tell them to contact their local emergency services (911/emergency room) without delay.
5. Emphasize that Klaytor Health Assistant is for educational awareness and platform assistance only.
6. When helpful, suggest specific, well-formulated questions the user can write down and ask their doctor during their next Klaytor appointment.
7. Keep responses concise, clear, reassuring, and formatting with clean bullet points.`;

export const aiController = {
  async chat(req: AuthenticatedRequest, res: Response) {
    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') {
      res.status(400).json({ error: 'Prompt is required.' });
      return;
    }

    const ai = getAiClient();

    // If Gemini API is available on the server, use gemini-3.7-flash
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.3,
          },
        });

        const reply = response.text || 'I am unable to generate a response at this moment. Please consult your healthcare provider.';
        res.json({
          reply,
          disclaimer: 'The Klaytor Health Assistant provides informational guidance only and is not a substitute for professional medical diagnosis or clinical advice.',
        });
        return;
      } catch (err: any) {
        console.error('Gemini API call failed, falling back to local clinical knowledge engine:', err.message);
      }
    }

    // Fallback intelligent healthcare knowledge base & navigator
    const lower = prompt.toLowerCase();
    let reply = '';

    if (
      lower.includes('chest pain') ||
      lower.includes('heart attack') ||
      lower.includes('cannot breathe') ||
      lower.includes('stroke') ||
      lower.includes('emergency')
    ) {
      reply = `⚠️ **EMERGENCY WARNING**\n\nIf you are experiencing severe chest pain, sudden shortness of breath, sudden facial drooping or weakness, or any life-threatening symptoms, **please immediately contact your local emergency services (911 or local emergency hotline) or go to the nearest emergency department.**\n\nKlaytor is a health management platform and cannot assist in emergency situations.`;
    } else if (lower.includes('blood pressure') || lower.includes('hypertension') || lower.includes('bp')) {
      reply = `**Understanding Blood Pressure**\n\n- **Systolic (Top number):** Measures pressure in your arteries when your heart beats.\n- **Diastolic (Bottom number):** Measures pressure in your arteries when your heart rests between beats.\n- **Normal range:** Typically under 120/80 mmHg for healthy adults.\n\n💡 **Questions to ask your doctor at your next visit:**\n1. "What is my target blood pressure goal based on my personal health history?"\n2. "How often should I log my home blood pressure measurements in Klaytor?"\n3. "Are there dietary or lifestyle changes that would benefit my numbers?"\n\n*Note: Klaytor health measurements are for personal tracking and not diagnostic.*`;
    } else if (lower.includes('appointment') || lower.includes('book') || lower.includes('schedule') || lower.includes('doctor')) {
      reply = `**How to Book an Appointment in Klaytor:**\n\n1. Navigate to the **Appointments** tab in your dashboard or click **Book Appointment**.\n2. Select your preferred healthcare provider (e.g. Dr. Marcus Vance for Cardiology, or Dr. Elena Reyes for Family Medicine).\n3. Choose your preferred clinic location, date, and available time slot.\n4. Enter a brief description of the reason for your visit.\n5. Click **Submit Request**. Your provider will review and confirm your visit, and you will receive a notification.`;
    } else if (lower.includes('record') || lower.includes('lab') || lower.includes('medication') || lower.includes('vaccine')) {
      reply = `**Navigating Your Health Records:**\n\nIn Klaytor, your health record contains:\n- **Allergies:** Known drug and food sensitivities.\n- **Current Medications:** Dosages and instructions entered by your doctor.\n- **Lab Results:** Diagnostic tests with reference ranges and provider interpretations.\n- **Vaccinations:** Complete immunization log and due dates.\n- **Consultation Notes:** Summary of your clinic visits and care plans.\n\nYou can access these anytime under the **Health Records** tab.`;
    } else {
      reply = `**Klaytor Health Guidance**\n\nThank you for reaching out. Here is some general health information:\n\n- **General Health Terminology:** I can explain common medical terms, lab tests (like CBC, Lipid Panel, HbA1c), and vital sign metrics.\n- **Appointment Preparation:** I can help you compile a list of questions to discuss with your doctor.\n- **Platform Navigation:** I can assist you with booking appointments, recording vitals, or viewing lab reports in Klaytor.\n\n*Important Disclaimer: Klaytor Health Assistant does not provide medical diagnoses or prescribe treatment. Please consult your healthcare provider for personalized medical evaluation.*`;
    }

    res.json({
      reply,
      disclaimer: 'The Klaytor Health Assistant provides informational guidance only and is not a substitute for professional medical diagnosis or clinical advice.',
    });
  },
};
