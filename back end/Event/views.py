from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import Event
import json
# Create your views here.
def addEvent(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            with connection.cursor() as cursor:
                cursor.execute("INSERT INTO api_event (name, description, category, status, start_date, end_date, owner_Username, Location_Id) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)", [data.get("name"), data.get("description"), data.get("category"), data.get("status"), data.get("start_date"), data.get("end_date"), data.get("owner"), data.get("location")])
                cursor.execute("SELECT LAST_INSERT_ID()")
                event_id = cursor.fetchone()[0]
                for performer_id in data.get("performers", []):
                    cursor.execute("INSERT INTO api_hasperformer (event_id, performer_id) VALUES (%s, %s)", [event_id, performer_id])
                for bus_id in data.get("buses", []):
                    cursor.execute("INSERT INTO api_hasbus (event_id, vehicle_id) VALUES (%s, %s)", [event_id, bus_id])
            return JsonResponse({"message": "Event created successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

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