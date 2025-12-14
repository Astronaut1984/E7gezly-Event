from django.shortcuts import render
from django.db import connection, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import User
import json

# Create your views here.
@csrf_exempt
def countUsers(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM api_user")
        result = cursor.fetchone()
    return JsonResponse({"count": result[0]})

@csrf_exempt
def countEvents(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM api_event")
        result = cursor.fetchone()
    return JsonResponse({"count": result[0]})

@csrf_exempt
def countEventsOfCategory(request):
    pass