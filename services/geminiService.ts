import { GoogleGenAI, Modality } from "@google/genai";
import type { GroundingChunk } from '../types';

export const getAccountSuggestions = async (username: string, niche: string): Promise<{ text: string; sources: GroundingChunk[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: `Act as an expert Instagram growth strategist. My Instagram username is "@${username}" and my niche is "${niche}". Analyze my account (hypothetically, based on common patterns for this niche) and provide a list of actionable suggestions for improvement. Cover these areas:
1.  **Bio Optimization:** Suggest a revised bio with a clear value proposition, call-to-action, and relevant keywords.
2.  **Content Strategy:** Suggest 3 specific content pillars or series ideas that would perform well in this niche.
3.  **Visual Branding:** Recommend improvements to my visual aesthetic (e.g., color palette, photo style, feed layout).
4.  **Engagement Tactics:** Suggest 2-3 ways I can increase engagement with my followers.
Format the output as clean, well-structured markdown.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text;
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return { text, sources };
};

export const getTrendSuggestions = async (niche: string): Promise<{ text: string; sources: GroundingChunk[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: `Analyze the latest Instagram trends for reels and posts, specifically for a content creator in the "${niche}" niche. Provide 3-5 concrete, actionable ideas. For each idea, specify if it's for a "Reel" or a "Post". Describe the concept, suggest relevant trending audio or music, and list currently trending hashtags. Format the output as clean markdown.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text;
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return { text, sources };
};

export const generateScript = async (prompt: string, niche: string): Promise<{ text: string; sources: GroundingChunk[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-pro",
    contents: `As an expert social media manager for the "${niche}" niche, write an engaging Instagram post script about "${prompt}". Keep it concise, use emojis relevant to the niche, and include relevant trending hashtags.`,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text;
  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return { text, sources };
};

export const generatePhoto = async (prompt: string, niche: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `Create a hyper-realistic photo for an Instagram post about "${prompt}". The style should be perfect for a creator in the "${niche}" niche.` }],
    },
    config: {
      responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64ImageBytes: string = part.inlineData.data;
      return `data:image/png;base64,${base64ImageBytes}`;
    }
  }
  throw new Error("No image was generated.");
};

export const generateVideo = async (prompt: string, aspectRatio: '16:9' | '9:16' , niche: string): Promise<string> => {
    // A new instance must be created before each call to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    let operation = await ai.models.generateVideos({
        model: 'veo-3.1-generate-preview',
        prompt: `${prompt}. The video's aesthetic should be tailored for a high-end content creator in the "${niche}" niche.`,
        config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio,
        }
    });

    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
    }

    const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
    if (!downloadLink) {
        throw new Error("Video generation failed or returned no URI.");
    }
    
    // The response.body contains the MP4 bytes. You must append an API key when fetching from the download link.
    const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
    if (!videoResponse.ok) {
        throw new Error("Failed to download the generated video.");
    }
    const videoBlob = await videoResponse.blob();
    return URL.createObjectURL(videoBlob);
};