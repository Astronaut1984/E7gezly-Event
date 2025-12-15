from django.shortcuts import render
from api.models import Message, User
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils.timezone import localtime, now

# Create your views here.
def getOrgMessages(request):
    try:
        # Get the organizer username from session
        organizer_username = request.session.get('username')
        
        if not organizer_username:
            return JsonResponse({
                'error': 'Not authenticated'
            }, status=401)
        
        # Verify the user is an organizer
        try:
            organizer = User.objects.get(username=organizer_username, status='Organizer')
        except User.DoesNotExist:
            return JsonResponse({
                'error': 'User is not an organizer or does not exist'
            }, status=403)
        
        # Fetch all messages where this organizer is the owner
        messages = Message.objects.filter(owner=organizer).select_related('attendee').order_by('attendee', 'message_date')
        
        # Group messages by attendee
        conversations = {}
        for message in messages:
            if message.attendee:
                attendee_username = message.attendee.username
                
                # Initialize conversation for this attendee if not exists
                if attendee_username not in conversations:
                    conversations[attendee_username] = {
                        'attendee': {
                            'username': message.attendee.username,
                            'name': f"{message.attendee.first_name} {message.attendee.last_name}",
                        },
                        'messages': [],
                        'last_message_date': None,
                    }
                
                # Add message to this conversation
                conversations[attendee_username]['messages'].append({
                    'id': message.id,
                    'content': message.content,
                    'message_date': message.message_date.isoformat() if message.message_date else None,
                    'sender_type': message.sender_type,
                })
                
                # Update last message date
                if message.message_date:
                    if (conversations[attendee_username]['last_message_date'] is None or 
                        message.message_date.isoformat() > conversations[attendee_username]['last_message_date']):
                        conversations[attendee_username]['last_message_date'] = message.message_date.isoformat()
        
        # Convert to list and sort by last message date (most recent first)
        conversations_list = list(conversations.values())
        conversations_list.sort(
            key=lambda x: x['last_message_date'] if x['last_message_date'] else '', 
            reverse=True
        )
        
        return JsonResponse({
            'success': True,
            'conversations': conversations_list,
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'error': f'An error occurred: {str(e)}'
        }, status=500)
    
@csrf_exempt
def orgSendMessage(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST Requests allowed"})

    try:
        organizer_username = request.session.get('username')
            
        if not organizer_username:
            return JsonResponse({
                'error': 'Not authenticated'
            }, status=401)

        # Verify the user is an organizer
        try:
            organizer = User.objects.get(username=organizer_username, status='Organizer')
        except User.DoesNotExist:
            return JsonResponse({
                'error': 'User is not an organizer or does not exist'
            }, status=403)
        data = json.loads(request.body) 
        sender_type = 'owner'
        content = data['content']
        message_date = now()
        attendee = User.objects.get(username = data['attendee_username'])

        message = Message(sender_type = sender_type, content=content, message_date=message_date, attendee=attendee, owner=organizer)
        message.save()
        return JsonResponse({"success": "Value Added successfully"})
        
    except Exception as e:
        return JsonResponse({"error": f"Unexpected Error: {e}"}, status=500)
    pass