from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import User
import json
import hashlib

# Create your views here.
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


def checkEmail(request):
    data = json.loads(request.body)  
    with connection.cursor() as cursor:
        cursor.execute(""" SELECT COUNT(*) FROM api_user WHERE email = %s""",[data.get("email")])
        result = cursor.fetchone()
        if result[0] == 1:
            return JsonResponse({"emailExists": True})
        else : return JsonResponse({"emailExists": False})
        
def getType(request):
    data = json.loads(request.body)
    with connection.cursor() as cursor:
        cursor.execute(""" SELECT status FROM api_user WHERE usernamr = %s""",[data.get("usernamr")])
        result = cursor.fetchone()
        return JsonResponse({"accountType": result[0]})

def login_view(request):
    if request.method == "POST":
        data = json.loads(request.body)    
        hashed = hashlib.sha256(data.get("password").encode()).hexdigest()
        try:
            user = User.objects.get(username=data.get("username"))
            if hashed == user.password:
                request.session['user_id'] = user.username
                request.session['user_city'] = user.city
                request.session['user_country'] = user.country
                request.session['user_first_name'] = user.first_name
                request.session['user_last_name'] = user.last_name
                return JsonResponse({"success": True, "message": "Logged in"})
            else:
                return JsonResponse({"success": False, "message": "Wrong password"})
        except User.DoesNotExist:
            return JsonResponse({"success": False, "message": "User not found"})
    return JsonResponse({"error": "Invalid request"}, status=400)

    
def checkUsername(request):
    username = json.loads(request.body).get("username")
    if User.objects.filter(username=username).exists():
        return JsonResponse({"usernameExists": True})
    return JsonResponse({"usernameExists": False})