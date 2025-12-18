import os
from google import genai
from decouple import config

client = genai.Client(api_key=config('GEMINI_API_KEY'))

def get_ai_response(user_message, context):
    """
    Send a message to Gemini with event context
    """
    system_prompt = """You are E7gezly Assistant, a helpful chatbot for an event management platform called E7gezly.
Your role is to help users:
- Find events by name, date, category, or location (including past events)
- Get event details (performers, venue, tickets, dates)
- Check ticket availability and prices
- Find discount codes and promotions
- Search for performers and their upcoming events
- Search for lost items reported at events
- Answer general questions about events

Important rules:
1. Be friendly and conversational
2. Always base your answers on the provided context data
3. If you don't have information, say so politely
4. NEVER claim you can book tickets, modify events, or change database - only provide information
5. If a user wants to book/modify something, explain the steps they need to take on the website
6. Keep responses concise but helpful

Context data about events, performers, venues, and lost items:
{context}

User question: {question}

Provide a helpful, accurate response based only on the context provided."""
    
    try:
        prompt = system_prompt.format(
            context=context,
            question=user_message
        )
        
        response = client.models.generate_content(
            model='gemini-2.0-flash-exp',
            contents=prompt
        )
        
        return response.text
    
    except Exception as e:
        return f"I'm having trouble connecting right now. Please try again in a moment. Error: {str(e)}"
