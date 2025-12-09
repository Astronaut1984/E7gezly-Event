from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import Event, User, Venue

@csrf_exempt
def addEvent(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    # These will 400 if missing, exactly like your model demands
    event = Event.objects.create(
        name=request.POST["name"],
        description=request.POST["description"],        # REQUIRED, will crash if missing/empty
        category=request.POST.get("category") or None,
        status=request.POST.get("status") or None,
        start_date=request.POST["start_date"],
        end_date=request.POST.get("end_date") or None,
        owner=User.objects.get(username=request.POST["owner"]),
        location=Venue.objects.get(pk=request.POST["location"]) or None,
        banner=request.FILES.get("banner") or "fallback.png"
    )

    if request.POST.get("performers"):
        event.performers.set(json.loads(request.POST["performers"]))
    if request.POST.get("buses"):
        event.buses.set(json.loads(request.POST["buses"]))

    return JsonResponse({"message": "Event created", "id": event.event_id})
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