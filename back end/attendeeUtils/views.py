from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import User, Friend
import json

# Create your views here.
@csrf_exempt
def getUserFriends(request):
    username = json.loads(request.body).get("username")
    with connection.cursor() as cursor:
        cursor.execute("""(select attendee1_id from api_friend where attendee2_id = %s and status = 'A')
                       union
                       (select attendee2_id from api_friend where attendee1_id = %s and status = 'A');""",
                       [username, username])
        friends = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"friends": friends})

@csrf_exempt
def getSentFriendRequests(request):
    username = request.session.get('username')
    with connection.cursor() as cursor:
        cursor.execute("""select attendee2_id from api_friend where attendee1_id = %s and status = 'P';""", [username])
        requests = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"requests": requests})

@csrf_exempt
def getReceivedFriendRequests(request):
    username = request.session.get('username')
    with connection.cursor() as cursor:
        cursor.execute("""select attendee1_id from api_friend where attendee2_id = %s and status = 'P';""", [username])
        requests = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"requests": requests})

@csrf_exempt
def getBlockedUsers(request):
    username = request.session.get('username')
    with connection.cursor() as cursor:
        cursor.execute("""select attendee2_id from api_friend where attendee1_id = %s and status = 'B';""", [username])
        requests = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"Blocked": requests})

@csrf_exempt
def blockUnblockUser(request): #True=Block, False=Unblock
    attendee1 = request.session.get('username')
    attendee2 = json.loads(request.body).get("attendee")
    Action = json.loads(request.body).get("action")
    if Action:#Block
        if not Friend.objects.filter(attendee1_id=attendee1, attendee2_id=attendee2).exists() and not Friend.objects.filter(attendee1_id=attendee2, attendee2_id=attendee1).exists() :
            Friend.objects.create(
                attendee1_id=attendee1,
                attendee2_id=attendee2,
                status='B'
            )
            return JsonResponse({"error": False, "Action": True})
    else:#Unblock
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
    with connection.cursor() as cursor:
        if response:
            cursor.execute("""update api_friend set status = 'A' where attendee1_id = %s and attendee2_id = %s""", [attendee1, attendee2])
            return JsonResponse({"error": False, "response": True})
        else:
            cursor.execute("""delete from api_friend where attendee1_id = %s and attendee2_id = %s""", [attendee1, attendee2])
            return JsonResponse({"error": False, "response": False})
    return JsonResponse({"error": True})

@csrf_exempt
def getFollowedOrganizers(request):
    username = request.session.get('username')
    with connection.cursor() as cursor:
        cursor.execute("""(select organizer_id from api_follow where attendee_id = %s and status = 'A');""",
                       [username])
        followed = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"followed": followed})

@csrf_exempt
def getFollowers(request):
    username = json.loads(request.body).get("username")
    with connection.cursor() as cursor:
        cursor.execute("""(select attendee_id from api_follow where organizer_id = %s and status = 'A');""",
                       [username])
        followed = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"followed": followed})

@csrf_exempt
def addFriend(request):
    attendee1 = request.session.get('username')
    attendee2 = json.loads(request.body).get("receiver")
    if not Friend.objects.filter(attendee1_id=attendee1, attendee2_id=attendee2).exists() and not Friend.objects.filter(attendee1_id=attendee2, attendee2_id=attendee1).exists():
        Friend.objects.create(
            attendee1_id=attendee1,
            attendee2_id=attendee2,
        )
        return JsonResponse({"sent": True})
    return JsonResponse({"sent": False})