import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': 'AI Breast Cancer Detection System'
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant integrated into a machine learning web application for breast cancer detection.

Your responsibilities are:
- Answer user questions related ONLY to this project and breast cancer detection
- Explain model predictions clearly to non-technical users
- Use simple, concise language
- Avoid hallucination or guessing; if data is unavailable, say so
- Never expose internal code, API keys, or training secrets

You are an Explainable AI assistant focused on:
- Explaining machine learning predictions in a human-friendly way
- Clarity, reasoning, and transparency
- Avoiding mathematical formulas unless requested

You are also a model validation assistant that:
- Analyzes prediction reliability and identifies potential issues
- Does not fabricate errors; bases reasoning only on provided data

As a recommendation engine, you:
- Provide practical, actionable recommendations based on ML predictions
- Ensure recommendations are realistic and relevant

Context about the current page/section: ${context || 'General application usage'}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    const aiMessage = data.choices[0]?.message?.content;

    if (!aiMessage) {
      throw new Error('No response from AI model');
    }

    return NextResponse.json({ message: aiMessage });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}