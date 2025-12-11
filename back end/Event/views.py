from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import Event, User, Venue, TicketType
import json

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

def getVenues(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET only"}, status=405)
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM api_venue")
        result = cursor.fetchone()
    return JsonResponse({"venue": result})

def getCategories(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET only"}, status=405)
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM api_category")
        result = cursor.fetchone()
    return JsonResponse({"categories": result})

def getEvents(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET only"}, status=405)
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM api_event")
        result = cursor.fetchone()
    return JsonResponse({"Events": result})

def getOrganizerEvents(request):
    if request.method != "GET":
        return JsonResponse({"error": "GET only"}, status=405)
    return Event.objects.filter(owner=request.get("organizer"))

def addTicketType(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)
    ticket = TicketType.objects.create(
        name=request.POST("name"),
        price=request.POST("price"),
        quantity=request.POST("quantity"),
        event=request.POST("event")
    )
    return JsonResponse({"message": "Ticket Type created", "id": ticket.ticket_type_id})

@csrf_exempt
def addVenue(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)
    
    data = json.loads(request.body)
    venue_name = data.get("venueName")
    
    if Venue.objects.filter(name=venue_name).exists():
        return JsonResponse({"error": "a venue with this name already exists"}, status=400)
    
    venue = Venue.objects.create(
        name=venue_name,
        country=data.get("country"),
        city=data.get("city"),
        details=data.get("description"),
        type=data.get("venueType"),
        capacity=data.get("capacity")
    )
    
    return JsonResponse({"message": "Venue created", "id": venue.location_id})
