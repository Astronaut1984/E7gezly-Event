from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import Event
import json

def addEvent(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    data = json.loads(request.body)

    event = Event.objects.create(
        name=data["name"],
        description=data.get("description"),
        category=data.get("category"),
        status=data.get("status"),
        start_date=data["start_date"],
        end_date=data["end_date"],
        owner_Username=data["owner"],
        Location_Id=data["location"],
        banner =data["banner"]
    )

    event.performers.set(data.get("performers", []))
    event.buses.set(data.get("buses", [])) 

    return JsonResponse({"message": "Event created", "id": event.id})

def getVenue(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM api_venue")
        result = cursor.fetchone()
    return JsonResponse({"venue": result})

def getCategory(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT distinct(category) FROM api_event")
        result = cursor.fetchone()
    return JsonResponse({"categories": result})

def getEvent(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM api_event")
        result = cursor.fetchone()
    return JsonResponse({"Events": result})