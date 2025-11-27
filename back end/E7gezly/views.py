from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse

# Create your views here.
def home(request):
    return JsonResponse({"message": "home"});
def login(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM api_user")
        result = cursor.fetchone()
    return JsonResponse({"count": result[0]})