import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    // Initialize Gemini 2.5 Flash (Standard in 2026)
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are a receipt parsing expert. Analyze the provided image of a receipt and extract the items, tax, service charge, and discounts.
      Return the data in the following JSON format ONLY:
      {
        "items": [
          { "name": "Item Name", "price": number, "quantity": number }
        ],
        "tax": number (as percentage, e.g. 10 for 10%),
        "serviceCharge": number (as percentage, e.g. 5 for 5%),
        "discounts": [
          { "name": "Discount Name", "value": number, "type": "fixed" | "percentage" }
        ]
      }
      
      Rules:
      1. If tax or service charge is shown as a value, convert it to a percentage of the subtotal if possible.
      2. If quantities are missing, assume 1.
      3. Be very accurate with numbers.
      4. If a field is not found, return 0 or an empty array.
      5. Return ONLY the JSON object, no other text.
    `;

    // Convert base64 to parts for Gemini
    const imageParts = [
      {
        inlineData: {
          data: image.split(",")[1],
          mimeType: "image/jpeg",
        },
      },
    ];

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    const text = response.text();
    
    // Clean up response text in case AI adds markdown code blocks
    const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonResult = JSON.parse(cleanedText);

    return NextResponse.json(jsonResult);
  } catch (error: any) {
    console.error("OCR Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
