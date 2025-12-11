from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import User, Friend
import json
import hashlib

# Create your views here.
@csrf_exempt
def login(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM api_user")
        result = cursor.fetchone()
    return JsonResponse({"count": result[0]})

@csrf_exempt
def signup(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)     
            hashed = hashlib.sha256(data.get("password").encode()).hexdigest()
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO api_user 
                    (username, password, first_name, last_name, email, status, country, city, phone, wallet)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    [data.get("username"), hashed, data.get("firstName"), data.get("lastName"), data.get("email"), data.get("accountType"), data.get("country"), data.get("city"), data.get("phoneNumber"), 0],
                )
            return JsonResponse({"message": "User created successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

@csrf_exempt
def checkEmail(request):
    data = json.loads(request.body)  
    with connection.cursor() as cursor:
        cursor.execute(""" SELECT COUNT(*) FROM api_user WHERE email = %s""",[data.get("email")])
        result = cursor.fetchone()
        if result[0] == 1:
            return JsonResponse({"emailExists": True})
        return JsonResponse({"emailExists": False})
        
@csrf_exempt
def me(request):
    username = request.session.get("username")
    if not username:
        return JsonResponse({
            "authenticated": False
        }) 
    
    user = User.objects.get(username = username)

    return JsonResponse(
        {
            "authenticated": True,
            "user": {
                "username": user.username,
                "first_name": user.first_name,
                "last_name": user.last_name,
                "city": user.city,
                "country": user.country,
                "status": user.status,
                "wallet": user.wallet
            }
        }
    )

@csrf_exempt
def logout(request):
    request.session.flush()
    return JsonResponse({
        "success": True,
        "message": "Logged Out"
    })

@csrf_exempt
def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)    
        hashed = hashlib.sha256(data.get("password").encode()).hexdigest()
        try:
            user = User.objects.get(username=data.get("username"))
            if hashed == user.password:
                request.session['username'] = user.username
                request.session.set_expiry(60 * 60 * 24 * 30)
                return JsonResponse({
                    "success": True,
                    "message": "Logged in",
                    "user": {
                        "username": user.username,
                        "first_name": user.first_name,
                        "last_name": user.last_name,
                        "city": user.city,
                        "country": user.country,
                        "status": user.status,
                        "wallet": user.wallet
                    }
                })
            else:
                return JsonResponse({"success": False, "message": "Wrong password"})
        except User.DoesNotExist:
            return JsonResponse({"success": False, "message": "User not found"})
    return JsonResponse({"error": "Invalid request"}, status=400)

@csrf_exempt    
def checkUsername(request):
    username = json.loads(request.body).get("username")
    if User.objects.filter(username=username).exists():
        return JsonResponse({"usernameExists": True})
    return JsonResponse({"usernameExists": False})

@csrf_exempt
def getUserFriends(request):
    username = json.loads(request.body).get("username")
    with connection.cursor() as cursor:
        cursor.execute("""(select attendee1 from api_friend where attendee2 = %s and status = 'A')
                       union
                       (select attendee2 from api_friend where attendee1 = %s and status = 'A');""",
                       [username, username])
        friends = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"friends": friends})

@csrf_exempt
def getSentFriendRequests(request):
    username = request.session.get('username')
    with connection.cursor() as cursor:
        cursor.execute("""select attendee2 from api_friend where attendee1 = %s and status = 'P';""", [username])
        requests = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"requests": requests})

@csrf_exempt
def getReceivedFriendRequests(request):
    username = request.session.get('username')
    with connection.cursor() as cursor:
        cursor.execute("""select attendee1 from api_friend where attendee2 = %s and status = 'P';""", [username])
        requests = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"requests": requests})

@csrf_exempt
def getBlockedUsers(request):
    username = request.session.get('username')
    with connection.cursor() as cursor:
        cursor.execute("""select attendee2 from api_friend where attendee1 = %s and status = 'B';""", [username])
        requests = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"Blocked": requests})

@csrf_exempt
def blockUnblockUser(request): #True=Block, False=Unblock
    attendee1 = request.session.get('username')
    attendee2 = json.loads(request.body).get("attendee")
    Action = json.loads(request.body).get("action")
    if Action:
        if not Friend.objects.filter(attendee1=attendee1, attendee2=attendee2).exists() and not Friend.objects.filter(attendee1=attendee2, attendee2=attendee1).exists() :
            Friend.objects.create(
                attendee1=attendee1,
                attendee2=attendee2,
                status='B'
            )
            return JsonResponse({"error": False, "Action": True})
    else:
        blocked_relationship = Friend.objects.filter(attendee1=attendee1, attendee2=attendee2, status='B')
        if blocked_relationship.exists:
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
            cursor.execute("""update friend set status = 'A' where attendee1 = %s and attendee2 = %s""", [attendee1, attendee2])
            return JsonResponse({"error": False, "response": True})
        else:
            cursor.execute("""delete from friend where attendee1=%s and attendee2=%s""", [attendee1, attendee2])
            return JsonResponse({"error": False, "response": False})
    return JsonResponse({"error": True})

@csrf_exempt
def getFollowedOrganizers(request):
    username = request.session.get('username')
    with connection.cursor() as cursor:
        cursor.execute("""(select organizer from api_follow where attendee = %s and status = 'A');""",
                       [username])
        followed = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"followed": followed})

@csrf_exempt
def getFollowers(request):
    username = json.loads(request.body).get("username")
    with connection.cursor() as cursor:
        cursor.execute("""(select attendee from api_follow where organizer = %s and status = 'A');""",
                       [username])
        followed = [f[0] for f in cursor.fetchall()]
    return JsonResponse({"followed": followed})

@csrf_exempt
def addFriend(request):
    attendee1 = request.session.get('username')
    attendee2 = json.loads(request.body).get("receiver")
    if not Friend.objects.filter(attendee1=attendee1, attendee2=attendee2).exists() and not Friend.objects.filter(attendee1=attendee2, attendee2=attendee1).exists():
        Friend.objects.create(
            attendee1=attendee1,
            attendee2=attendee2,
        )
        return JsonResponse({"sent": True})
    return JsonResponse({"sent": False})
        