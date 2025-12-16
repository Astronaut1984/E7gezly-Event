from django.shortcuts import render
from api.models import Message, User, Follow
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.utils.timezone import now
from django.db.models import Q, Count, Case, When, IntegerField

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
                        'unread_count': 0,
                    }
                
                # Count unread messages from attendee
                if not message.is_read and message.sender_type == 'attendee':
                    conversations[attendee_username]['unread_count'] += 1
                
                # Add message to this conversation
                conversations[attendee_username]['messages'].append({
                    'id': message.id,
                    'content': message.content,
                    'message_date': message.message_date.isoformat() if message.message_date else None,
                    'sender_type': message.sender_type,
                    'is_read': message.is_read,
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
        
        # Calculate total unread count
        total_unread = sum(conv['unread_count'] for conv in conversations_list)
        
        return JsonResponse({
            'success': True,
            'conversations': conversations_list,
            'total_unread': total_unread,
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'error': f'An error occurred: {str(e)}'
        }, status=500)

@csrf_exempt
def markMessagesAsRead(request):
    """Mark messages as read when a conversation is opened"""
    if request.method != "POST":
        return JsonResponse({"error": "Only POST Requests allowed"})
    
    try:
        user_username = request.session.get('username')
        
        if not user_username:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
        try:
            user = User.objects.get(username=user_username)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=403)
        
        data = json.loads(request.body)
        other_user_username = data.get('other_user_username')
        
        if not other_user_username:
            return JsonResponse({'error': 'other_user_username is required'}, status=400)
        
        # Mark messages as read based on user type
        if user.status == 'Organizer':
            # Mark messages from attendee as read
            Message.objects.filter(
                owner=user,
                attendee__username=other_user_username,
                sender_type='attendee',
                is_read=False
            ).update(is_read=True)
        else:
            # Mark messages from organizer as read
            Message.objects.filter(
                attendee=user,
                owner__username=other_user_username,
                sender_type='owner',
                is_read=False
            ).update(is_read=True)
        
        return JsonResponse({'success': True}, status=200)
        
    except Exception as e:
        return JsonResponse({"error": f"Unexpected Error: {e}"}, status=500)
    
@csrf_exempt
def sendMessage(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST Requests allowed"})
    try:
        sender_username = request.session.get('username')
            
        if not sender_username:
            return JsonResponse({
                'error': 'Not authenticated'
            }, status=401)
        
        # Get the sender user
        try:
            sender = User.objects.get(username=sender_username)
        except User.DoesNotExist:
            return JsonResponse({
                'error': 'User does not exist'
            }, status=403)
        
        data = json.loads(request.body)
        content = data.get('content')
        
        if not content:
            return JsonResponse({
                'error': 'Content is required'
            }, status=400)
        
        message_date = now()
        
        # Determine if sender is organizer or attendee
        if sender.status == 'Organizer':
            # Organizer sending to attendee
            attendee_username = data.get('attendee_username')
            if not attendee_username:
                return JsonResponse({
                    'error': 'attendee_username is required'
                }, status=400)
            
            try:
                attendee = User.objects.get(username=attendee_username)
            except User.DoesNotExist:
                return JsonResponse({
                    'error': 'Attendee does not exist'
                }, status=404)
            
            message = Message(
                sender_type='owner',
                content=content,
                message_date=message_date,
                attendee=attendee,
                owner=sender,
                is_read=False  # New message starts as unread
            )
        else:
            # Attendee sending to organizer
            organizer_username = data.get('organizer_username')
            if not organizer_username:
                return JsonResponse({
                    'error': 'organizer_username is required'
                }, status=400)
            
            try:
                organizer = User.objects.get(username=organizer_username, status='Organizer')
            except User.DoesNotExist:
                return JsonResponse({
                    'error': 'Organizer does not exist'
                }, status=404)
            
            # Verify attendee is following the organizer
            try:
                follow = Follow.objects.get(attendee=sender, organizer=organizer)
            except Follow.DoesNotExist:
                return JsonResponse({
                    'error': 'You must be following this organizer to send messages'
                }, status=403)
            
            message = Message(
                sender_type='attendee',
                content=content,
                message_date=message_date,
                attendee=sender,
                owner=organizer,
                is_read=False  # New message starts as unread
            )
        
        message.save()
        
        return JsonResponse({
            "success": True,
            "message": {
                "content": message.content,
                "sender_type": message.sender_type,
                "message_date": message.message_date.isoformat(),
                "is_read": message.is_read,
            }
        }, status=201)
        
    except Exception as e:
        return JsonResponse({"error": f"Unexpected Error: {e}"}, status=500)
    
def getAttendeeMessages(request):
    try:
        # Get the attendee username from session
        attendee_username = request.session.get('username')
        
        if not attendee_username:
            return JsonResponse({
                'error': 'Not authenticated'
            }, status=401)
        
        # Verify the user exists and is an attendee
        try:
            attendee = User.objects.get(username=attendee_username)
        except User.DoesNotExist:
            return JsonResponse({
                'error': 'User does not exist'
            }, status=403)
        
        # Get all organizers that this attendee is following with 'Active' status
        active_follows = Follow.objects.filter(
            attendee=attendee, 
        ).select_related('organizer')
        
        followed_organizer_usernames = [follow.organizer.username for follow in active_follows]
        
        # Initialize conversations for all followed organizers
        conversations = {}
        for follow in active_follows:
            organizer = follow.organizer
            conversations[organizer.username] = {
                'organizer': {
                    'username': organizer.username,
                    'name': f"{organizer.first_name} {organizer.last_name}",
                },
                'messages': [],
                'last_message_date': None,
                'unread_count': 0,
            }
        
        # Fetch all messages where this attendee is involved 
        # and the owner is one of the followed organizers
        messages = Message.objects.filter(
            attendee=attendee,
            owner__username__in=followed_organizer_usernames
        ).select_related('owner').order_by('owner', 'message_date')
        
        # Add messages to conversations
        for message in messages:
            if message.owner:
                owner_username = message.owner.username
                
                # Count unread messages from organizer
                if not message.is_read and message.sender_type == 'owner':
                    conversations[owner_username]['unread_count'] += 1
                
                # Add message to this conversation
                conversations[owner_username]['messages'].append({
                    'id': message.id,
                    'content': message.content,
                    'message_date': message.message_date.isoformat() if message.message_date else None,
                    'sender_type': message.sender_type,
                    'is_read': message.is_read,
                })
                
                # Update last message date
                if message.message_date:
                    if (conversations[owner_username]['last_message_date'] is None or 
                        message.message_date.isoformat() > conversations[owner_username]['last_message_date']):
                        conversations[owner_username]['last_message_date'] = message.message_date.isoformat()
        
        # Convert to list and sort by last message date (most recent first)
        conversations_list = list(conversations.values())
        conversations_list.sort(
            key=lambda x: x['last_message_date'] if x['last_message_date'] else '', 
            reverse=True
        )
        
        # Calculate total unread count
        total_unread = sum(conv['unread_count'] for conv in conversations_list)
        
        return JsonResponse({
            'success': True,
            'conversations': conversations_list,
            'total_unread': total_unread,
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'error': f'An error occurred: {str(e)}'
        }, status=500)

@csrf_exempt
def deleteConversation(request):
    """Delete all messages in a conversation (attendee only)"""
    if request.method != "POST":
        return JsonResponse({"error": "Only POST Requests allowed"})
    
    try:
        attendee_username = request.session.get('username')
        
        if not attendee_username:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
        try:
            attendee = User.objects.get(username=attendee_username)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=403)
        
        # Only attendees can delete conversations
        if attendee.status == 'Organizer':
            return JsonResponse({'error': 'Only attendees can delete conversations'}, status=403)
        
        data = json.loads(request.body)
        organizer_username = data.get('organizer_username')
        
        if not organizer_username:
            return JsonResponse({'error': 'organizer_username is required'}, status=400)
        
        try:
            organizer = User.objects.get(username=organizer_username, status='Organizer')
        except User.DoesNotExist:
            return JsonResponse({'error': 'Organizer does not exist'}, status=404)
        
        # Delete all messages in this conversation
        deleted_count = Message.objects.filter(
            attendee=attendee,
            owner=organizer
        ).delete()[0]
        
        return JsonResponse({
            'success': True,
            'deleted_count': deleted_count
        }, status=200)
        
    except Exception as e:
        return JsonResponse({"error": f"Unexpected Error: {e}"}, status=500)