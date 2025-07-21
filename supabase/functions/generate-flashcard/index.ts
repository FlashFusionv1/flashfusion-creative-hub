import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { deckTitle } = await req.json();

    console.log('Generating flashcard for deck:', deckTitle);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are an educational content creator that generates high-quality flashcards. 
            Create a single flashcard with a clear, concise question and a comprehensive answer.
            The content should be educational and appropriate for the given deck topic.
            Return your response as JSON with "question", "answer", and "difficulty" (1-5) fields.`
          },
          { 
            role: 'user', 
            content: `Create a flashcard for a deck titled "${deckTitle}". 
            Make sure the question is clear and the answer is informative but concise.
            The difficulty should be appropriate for the topic (1=very easy, 5=very hard).`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Parse the JSON response
    let flashcard;
    try {
      flashcard = JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      flashcard = {
        question: "What is the main topic of this deck?",
        answer: content,
        difficulty: 2
      };
    }

    // Ensure required fields exist
    if (!flashcard.question || !flashcard.answer) {
      throw new Error('Generated flashcard missing required fields');
    }

    // Ensure difficulty is a number between 1-5
    flashcard.difficulty = Math.max(1, Math.min(5, parseInt(flashcard.difficulty) || 2));

    console.log('Generated flashcard:', flashcard);

    return new Response(JSON.stringify(flashcard), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-flashcard function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      question: "Sample Question",
      answer: "Sample Answer - Please try again",
      difficulty: 1
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});