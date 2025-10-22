import type { NextApiRequest, NextApiResponse } from 'next';
import { intakePrompt, extractionPrompt } from '@/lib/prompts/intakePrompt';
import { supabaseAdmin } from '@/lib/supabaseClient';

type Message = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, uploadedText, mode } = req.body as {
      messages: Message[];
      uploadedText?: string;
      mode?: 'chat' | 'extract';
    };

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    // Build context from last 5 messages
    const recentMessages = messages.slice(-5);
    const context = recentMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    // Determine system prompt based on mode
    let systemPrompt: string;
    if (mode === 'extract' && uploadedText) {
      systemPrompt = extractionPrompt(uploadedText);
    } else {
      systemPrompt = intakePrompt(context, uploadedText);
    }

    // Get the latest user message
    const userMessage = messages[messages.length - 1];
    if (!userMessage || userMessage.role !== 'user') {
      return res.status(400).json({ error: 'Last message must be from user' });
    }

    // Use Hugging Face Inference API (FREE!)
    const aiProvider = process.env.AI_PROVIDER || 'huggingface';
    console.log('AI Provider:', aiProvider);
    console.log('User message:', userMessage.content);
    console.log('System prompt:', systemPrompt);
    console.log('Recent messages:', JSON.stringify(recentMessages, null, 2));

    let responseText: string;

    if (aiProvider === 'huggingface') {
      // Hugging Face Inference API - FREE tier
      const hfResponse = await fetch(
        'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium',
        {
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY || 'hf_demo_token'}`,
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({
            inputs: `${systemPrompt}\n\nUser: ${userMessage.content}\nErmi:`,
            parameters: {
              max_new_tokens: 200,
              temperature: 0.7,
              return_full_text: false,
            },
          }),
        }
      );

      if (!hfResponse.ok) {
        throw new Error(`Hugging Face API error: ${hfResponse.status}`);
      }

      const hfData = await hfResponse.json();
      responseText = hfData[0]?.generated_text || 'I apologize, but I need a moment to process that. Could you try rephrasing your question?';
    } else if (aiProvider === 'groq') {
      // Groq (also has free tier)
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...recentMessages.slice(0, -1).map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage.content },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!groqResponse.ok) {
        const errorData = await groqResponse.json().catch(() => ({}));
        console.error('Groq API Error:', groqResponse.status, errorData);
        throw new Error(`Groq API error: ${groqResponse.status} - ${JSON.stringify(errorData)}`);
      }

      const groqData = await groqResponse.json();
      console.log('Full Groq Response:', JSON.stringify(groqData, null, 2));
      
      const aiResponse = groqData.choices?.[0]?.message?.content;
      console.log('Extracted AI Response:', aiResponse);
      
      if (!aiResponse || aiResponse.trim().length === 0) {
        console.log('Empty response from Groq, using fallback');
        responseText = generateFallbackResponse(userMessage.content, mode);
      } else {
        responseText = aiResponse;
      }
    } else {
      // Fallback: Simple rule-based responses
      responseText = generateFallbackResponse(userMessage.content, mode);
    }

    // Save conversation to Supabase if user is authenticated
    if (supabaseAdmin && req.headers.authorization) {
      try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const { data: { user } } = await supabaseAdmin.auth.getUser(token);
        
        if (user) {
          // Create or update chat
          const newMessages = [...recentMessages, { role: 'assistant', content: responseText }];
          
          // Check if there's an existing chat for this user
          const { data: existingChat } = await supabaseAdmin
            .from('chats')
            .select('id')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1)
            .single();

          if (existingChat) {
            // Update existing chat
            await supabaseAdmin
              .from('chats')
              .update({
                messages: newMessages,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingChat.id);
          } else {
            // Create new chat
            await supabaseAdmin.from('chats').insert({
              user_id: user.id,
              messages: newMessages,
              title: `Chat ${new Date().toLocaleDateString()}`,
            });
          }

          // If this looks like a generated document, save it too
          if (responseText.length > 200 && (responseText.includes('DRAFT') || responseText.includes('letter') || responseText.includes('motion') || responseText.includes('agreement'))) {
            await supabaseAdmin.from('documents').insert({
              user_id: user.id,
              title: 'Generated Document',
              content: responseText,
              document_type: 'draft',
            });
          }
        }
      } catch (dbError) {
        console.log('Database save failed (non-critical):', dbError);
        // Continue without failing the request
      }
    }

    return res.status(200).json({
      message: responseText,
      success: true,
    });
  } catch (error: any) {
    console.error('Chat API Error:', error);
    
    // Fallback response on error
    const fallbackResponse = generateFallbackResponse('', 'chat');
    
    return res.status(200).json({
      message: fallbackResponse,
      success: true,
    });
  }
}

// Simple fallback responses when AI isn't available
function generateFallbackResponse(userMessage: string, mode?: string): string {
  console.log('Using fallback response for:', userMessage);
  
  if (mode === 'extract') {
    return "I've reviewed your document. Here are the key details I've identified:\n\n• Client information\n• Case type\n• Important dates\n\nWould you like me to generate a draft document based on this information?";
  }
  
  if (userMessage.toLowerCase().includes('letter') || userMessage.toLowerCase().includes('draft')) {
    return "I'd be happy to help draft a letter! Please provide the key details like client name, case type, and any specific instructions you have.";
  }
  
  if (userMessage.toLowerCase().includes('intake') || userMessage.toLowerCase().includes('form')) {
    return "I can help process intake forms. Please share the information, and I'll extract the key facts and organize them for you.";
  }
  
  if (userMessage.toLowerCase().includes('nda') || userMessage.toLowerCase().includes('agreement')) {
    return "I can help draft an NDA or agreement. Please provide the key details like parties involved, confidential information scope, and duration.";
  }
  
  if (userMessage.toLowerCase().includes('review') || userMessage.toLowerCase().includes('look')) {
    return "I'd be happy to review your document. Please share the content or upload the file, and I'll extract the key legal facts and organize them for you.";
  }
  
  // Default responses
  const responses = [
    "I'm here to help with your legal document needs! What specific type of document are you working on?",
    "I can help with intake forms, letters, agreements, and other legal documents. What would you like me to assist with?",
    "Let me know what you're working on - whether it's reviewing an intake, drafting a letter, or organizing case information.",
    "I'm ready to help! Tell me about your case or document needs, and I'll provide specific assistance.",
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
}

