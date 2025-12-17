from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .services import get_ai_response
from .utils import get_event_context

@api_view(['POST'])
def ai_chat(request):
    """
    Handle AI chat requests
    
    Expected JSON:
    {
        "message": "What events are happening this weekend?"
    }
    """
    try:
        user_message = request.data.get('message', '').strip()
        
        if not user_message:
            return Response(
                {'error': 'Message cannot be empty'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get relevant context from database
        context = get_event_context(user_message)
        
        # Get AI response
        ai_response = get_ai_response(user_message, context)
        
        return Response({
            'message': ai_response,
            'status': 'success'
        })
    
    except Exception as e:
        return Response(
            {'error': f'An error occurred: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def health_check(request):
    """
    Simple health check endpoint
    """
    return Response({
        'status': 'AI Assistant is running',
        'version': '1.0'
    })