from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import Event, User, Venue, TicketType, Category, Performer, Vehicle, HasPerformer, HasBus
import json
from django.db.models import ObjectDoesNotExist

@csrf_exempt
def addEvent(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        owner_obj = User.objects.get(username=request.POST["owner"])
        location_obj = Venue.objects.get(pk=request.POST["location"])
        
        category_id = request.POST.get("category")
        category_obj = Category.objects.get(pk=category_id) if category_id else None
        
        event = Event.objects.create(
            name=request.POST["name"],
            description=request.POST["description"],
            category=category_obj,
            status=request.POST.get("status"),
            start_date=request.POST["start_date"],
            end_date=request.POST.get("end_date"),
            owner=owner_obj,
            location=location_obj,
            banner=request.FILES.get("banner") or "fallback.png"
        )

        if request.POST.get("performers"):
            performer_pks = json.loads(request.POST["performers"])
            for pk in performer_pks:
                HasPerformer.objects.create(event=event, performer_id=pk)
            
        if request.POST.get("buses"):
            bus_pks = json.loads(request.POST["buses"])
            for pk in bus_pks:
                HasBus.objects.create(event=event, transportation_id=pk)

        return JsonResponse({"message": "Event created", "id": event.event_id})

    except (KeyError, ObjectDoesNotExist) as e:
        return JsonResponse({"error": f"Missing or invalid data: {e}"}, status=400)
    except Exception as e:
        return JsonResponse({"error": "An unexpected error occurred."}, status=500)

@csrf_exempt
def getVenues(request):
    result = list(Venue.objects.all().values())
    return JsonResponse({"venues": result})

@csrf_exempt
def getCategories(request):
    result = list(Category.objects.all().values())
    return JsonResponse({"categories": result})

@csrf_exempt
def getEvents(request):
    result = list(Event.objects.all().values())
    return JsonResponse({"Events": result})

@csrf_exempt
def getOrganizerEvents(request):
    try:
        target_username = json.loads(request.body).get("username")
        if not target_username:
            raise KeyError("username")
    except Exception:
        return JsonResponse({"error": "Invalid request payload or missing username."}, status=400)

    organizers = list(
        Event.objects.filter(owner__username=target_username).values()
    )
    return JsonResponse({"organizers": organizers})

@csrf_exempt
def addTicketType(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)
        
    try:
        event_obj = Event.objects.get(pk=request.POST["event"])

        ticket = TicketType.objects.create(
            name=request.POST["name"],
            price=request.POST["price"],
            quantity=request.POST["quantity"],
            event=event_obj
        )
        return JsonResponse({"message": "Ticket Type created", "id": ticket.ticket_type_id})
    except (KeyError, ObjectDoesNotExist) as e:
        return JsonResponse({"error": f"Missing or invalid data: {e}"}, status=400)
    except Exception as e:
        return JsonResponse({"error": "An unexpected error occurred."}, status=500)

@csrf_exempt
def addVenue(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)
    
    try:
        data = json.loads(request.body)
        venue_name = data.get("venueName")

        if not venue_name:
            return JsonResponse({"error": "Venue name is required."}, status=400)
    
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

    except Exception as e:
        return JsonResponse({"error": f"Failed to create venue: {e}"}, status=400)