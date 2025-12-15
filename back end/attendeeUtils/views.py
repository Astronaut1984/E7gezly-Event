from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import User, Friend, Follow
from django.db.models import Q
import json

@csrf_exempt
def getUserFriends(request):
    username = json.loads(request.body).get("username")
    friends = Friend.objects.filter(
        Q(attendee1_id=username, status='A') | Q(attendee2_id=username, status='A')
    ).values_list('attendee1_id', 'attendee2_id')
    
    friend_list = []
    for f1, f2 in friends:
        friend_list.append(f2 if f1 == username else f1)
    
    return JsonResponse({"friends": friend_list})

@csrf_exempt
def getSentFriendRequests(request):
    username = request.session.get('username')
    requests = Friend.objects.filter(
        attendee1_id=username, 
        status='P'
    ).values_list('attendee2_id', flat=True)
    
    return JsonResponse({"requests": list(requests)})

@csrf_exempt
def getReceivedFriendRequests(request):
    username = request.session.get('username')
    requests = Friend.objects.filter(
        attendee2_id=username, 
        status='P'
    ).values_list('attendee1_id', flat=True)
    
    return JsonResponse({"requests": list(requests)})

@csrf_exempt
def getBlockedUsers(request):
    username = request.session.get('username')
    blocked = Friend.objects.filter(
        attendee1_id=username, 
        status='B'
    ).values_list('attendee2_id', flat=True)
    
    return JsonResponse({"Blocked": list(blocked)})

@csrf_exempt
def blockUnblockUser(request):
    attendee1 = request.session.get('username')
    attendee2 = json.loads(request.body).get("attendee")
    action = json.loads(request.body).get("action")
    
    if action:  # Block
        if not Friend.objects.filter(attendee1_id=attendee1, attendee2_id=attendee2).exists() and \
           not Friend.objects.filter(attendee1_id=attendee2, attendee2_id=attendee1).exists():
            Friend.objects.create(
                attendee1_id=attendee1,
                attendee2_id=attendee2,
                status='B'
            )
            return JsonResponse({"error": False, "Action": True})
    else:  # Unblock
        blocked_relationship = Friend.objects.filter(attendee1_id=attendee1, attendee2_id=attendee2, status='B')
        if blocked_relationship.exists():
            blocked_relationship.delete()
            return JsonResponse({"error": False, "Action": False})
    
    return JsonResponse({"error": True})

@csrf_exempt
def respondToFriendRequest(request):
    attendee1 = json.loads(request.body).get("attendee")
    attendee2 = request.session.get('username')
    response = json.loads(request.body).get("response")
    
    try:
        friend_request = Friend.objects.get(attendee1_id=attendee1, attendee2_id=attendee2)
        if response:
            friend_request.status = 'A'
            friend_request.save()
            return JsonResponse({"error": False, "response": True})
        else:
            friend_request.delete()
            return JsonResponse({"error": False, "response": False})
    except Friend.DoesNotExist:
        return JsonResponse({"error": True})

@csrf_exempt
def removeFriend(request):
    attendee1 = request.session.get('username')
    attendee2 = json.loads(request.body).get("attendee")
    
    try:
        friend_rel = Friend.objects.get(
            Q(attendee1_id=attendee1, attendee2_id=attendee2, status='A') |
            Q(attendee1_id=attendee2, attendee2_id=attendee1, status='A')
        )
        friend_rel.delete()
        return JsonResponse({"error": False})
    except Friend.DoesNotExist:
        return JsonResponse({"error": True})

@csrf_exempt
def cancelFriendRequest(request):
    attendee1 = request.session.get('username')
    attendee2 = json.loads(request.body).get("attendee")
    
    try:
        friend_request = Friend.objects.get(attendee1_id=attendee1, attendee2_id=attendee2, status='P')
        friend_request.delete()
        return JsonResponse({"error": False})
    except Friend.DoesNotExist:
        return JsonResponse({"error": True})

@csrf_exempt
def getFollowedOrganizers(request):
    username = request.session.get('username')
    followed = Follow.objects.filter(
        attendee_id=username, 
        status='A'
    ).values_list('organizer_id', flat=True)
    
    return JsonResponse({"followed": list(followed)})

@csrf_exempt
def getFollowers(request):
    username = json.loads(request.body).get("username")
    followers = Follow.objects.filter(
        organizer_id=username, 
        status='A'
    ).values_list('attendee_id', flat=True)
    
    return JsonResponse({"followed": list(followers)})

@csrf_exempt
def addFriend(request):
    attendee1 = request.session.get('username')
    attendee2 = json.loads(request.body).get("receiver")
    
    if not Friend.objects.filter(attendee1_id=attendee1, attendee2_id=attendee2).exists() and \
       not Friend.objects.filter(attendee1_id=attendee2, attendee2_id=attendee1).exists():
        Friend.objects.create(
            attendee1_id=attendee1,
            attendee2_id=attendee2,
            status='P'
        )
        return JsonResponse({"sent": True})
    
    return JsonResponse({"sent": False})

@csrf_exempt
def getUnblockedUsers(request):
    username = request.session.get('username')
    
    blocked_by_me = Friend.objects.filter(
        attendee1_id=username, 
        status='B'
    ).values_list('attendee2_id', flat=True)
    
    blocked_by_them = Friend.objects.filter(
        attendee2_id=username, 
        status='B'
    ).values_list('attendee1_id', flat=True)
    
    all_blocked = set(blocked_by_me) | set(blocked_by_them)
    
    # Filter by user_type='Attendee' only
    users = User.objects.filter(
        status='Attendee'  # Add this filter
    ).exclude(
        username=username
    ).exclude(
        username__in=all_blocked
    ).values_list('username', flat=True).order_by('username')
    
    return JsonResponse({"unblockedUsers": list(users)})

@csrf_exempt
def getFriendsCounts(request):
    username = request.session.get('username')
    
    # Count friends (accepted relationships)
    friends_count = Friend.objects.filter(
        Q(attendee1_id=username, status='A') | Q(attendee2_id=username, status='A')
    ).count()
    
    # Count sent requests
    sent_count = Friend.objects.filter(
        attendee1_id=username, 
        status='P'
    ).count()
    
    # Count received requests
    received_count = Friend.objects.filter(
        attendee2_id=username, 
        status='P'
    ).count()
    
    # Count blocked users
    blocked_count = Friend.objects.filter(
        attendee1_id=username, 
        status='B'
    ).count()
    
    return JsonResponse({
        "friends": friends_count,
        "sent": sent_count,
        "received": received_count,
        "blocked": blocked_count,
        "total_requests": sent_count + received_count
    })

@csrf_exempt
def getRelationshipStatus(request):
    """
    Returns the relationship status between current user and target user
    Possible returns: none, friends, sent_request, received_request, blocked_by_me, blocked_by_them, following
    """
    current_user = request.session.get('username')
    target_user = json.loads(request.body).get("username")
    
    if current_user == target_user:
        return JsonResponse({"status": "self"})
    
    # Check if blocked by me
    if Friend.objects.filter(attendee1_id=current_user, attendee2_id=target_user, status='B').exists():
        return JsonResponse({"status": "blocked_by_me"})
    
    # Check if blocked by them
    if Friend.objects.filter(attendee1_id=target_user, attendee2_id=current_user, status='B').exists():
        return JsonResponse({"status": "blocked_by_them"})
    
    # Check if friends
    if Friend.objects.filter(
        Q(attendee1_id=current_user, attendee2_id=target_user, status='A') |
        Q(attendee1_id=target_user, attendee2_id=current_user, status='A')
    ).exists():
        return JsonResponse({"status": "friends"})
    
    # Check if sent request
    if Friend.objects.filter(attendee1_id=current_user, attendee2_id=target_user, status='P').exists():
        return JsonResponse({"status": "sent_request"})
    
    # Check if received request
    if Friend.objects.filter(attendee1_id=target_user, attendee2_id=current_user, status='P').exists():
        return JsonResponse({"status": "received_request"})
    
    # Check if following (current user follows target organizer)
    if Follow.objects.filter(attendee_id=current_user, organizer_id=target_user, status='A').exists():
        return JsonResponse({"status": "following"})
    
    return JsonResponse({"status": "none"})

@csrf_exempt
def getUserFriendsWithPrivacy(request):
    """
    Returns user's friends list if privacy allows
    """
    current_user = request.session.get('username')
    target_user = json.loads(request.body).get("username")
    
    # Get target user's privacy setting
    user = User.objects.get(username=target_user)
    privacy = user.privacy_choice
    
    # If viewing own profile, check if explicitly showing as public view
    is_public_view = current_user == target_user
    
    if is_public_view:
        # For public view, treat as if we're not the owner
        # Privacy "A" (Anyone) - show friends
        # Privacy "F" (Friends) - don't show (they're not their own friend)
        # Privacy "P" (Private) - don't show
        can_view = privacy == 'A'
    elif privacy == 'A':
        can_view = True
    elif privacy == 'F':
        # Check if friends or following relationship exists
        can_view = (
            Friend.objects.filter(
                Q(attendee1_id=current_user, attendee2_id=target_user, status='A') |
                Q(attendee1_id=target_user, attendee2_id=current_user, status='A')
            ).exists() or
            Follow.objects.filter(
                Q(attendee_id=current_user, organizer_id=target_user, status='A') |
                Q(attendee_id=target_user, organizer_id=current_user, status='A')
            ).exists()
        )
    else:  # privacy == 'P'
        can_view = False
    
    if not can_view:
        return JsonResponse({"can_view": False, "friends": []})
    
    # Get friends
    friends = Friend.objects.filter(
        Q(attendee1_id=target_user, status='A') | Q(attendee2_id=target_user, status='A')
    ).values_list('attendee1_id', 'attendee2_id')
    
    friend_list = []
    for f1, f2 in friends:
        friend_list.append(f2 if f1 == target_user else f1)
    
    return JsonResponse({"can_view": True, "friends": friend_list})

@csrf_exempt
def getUserFollowersWithPrivacy(request):
    """
    Returns user's followers list if privacy allows
    """
    current_user = request.session.get('username')
    target_user = json.loads(request.body).get("username")
    
    # Get target user's privacy setting
    user = User.objects.get(username=target_user)
    privacy = user.privacy_choice
    
    # If viewing own profile as public view
    is_public_view = current_user == target_user
    
    if is_public_view:
        can_view = privacy == 'A'
    elif privacy == 'A':
        can_view = True
    elif privacy == 'F':
        # Check if friends or following relationship exists
        can_view = (
            Friend.objects.filter(
                Q(attendee1_id=current_user, attendee2_id=target_user, status='A') |
                Q(attendee1_id=target_user, attendee2_id=current_user, status='A')
            ).exists() or
            Follow.objects.filter(
                Q(attendee_id=current_user, organizer_id=target_user, status='A') |
                Q(attendee_id=target_user, organizer_id=current_user, status='A')
            ).exists()
        )
    else:  # privacy == 'P'
        can_view = False
    
    if not can_view:
        return JsonResponse({"can_view": False, "followers": []})
    
    # Get followers
    followers = Follow.objects.filter(
        organizer_id=target_user,
        status='A'
    ).values_list('attendee_id', flat=True)
    
    return JsonResponse({"can_view": True, "followers": list(followers)})

@csrf_exempt
def getUserView(request):
    username = json.loads(request.body).get("username")
    current_user = request.session.get('username')
    
    # Check if blocked
    if Friend.objects.filter(
        Q(attendee1_id=current_user, attendee2_id=username, status='B') |
        Q(attendee1_id=username, attendee2_id=current_user, status='B')
    ).exists():
        return JsonResponse({"error": True, "message": "User not found"}, status=404)
    
    try:
        user = User.objects.get(username=username)
        return JsonResponse({
            "error": False,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "city": user.city,
            "country": user.country,
            "status": user.status,
            "privacy_choice": user.privacy_choice
        })
    except User.DoesNotExist:
        return JsonResponse({"error": True, "message": "User not found"}, status=404)