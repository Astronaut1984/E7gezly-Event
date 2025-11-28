from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
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


@csrf_exempt
def checkemail(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)     
            with connection.cursor() as cursor:
                cursor.execute(
                    """
                    Select COUNT(*) From api_user wher
                    """,
                    [data.get("username"), hashed, data.get("firstName"), data.get("lastName"), data.get("email"), data.get("accountType"), data.get("country"), data.get("city"), data.get("phoneNumber"), 0],
                )
            return JsonResponse({"message": "User created successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Only POST method allowed"}, status=405)