from urllib import request
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

# Django/Python Backend (views.py)


@csrf_exempt
def getPerformers(request):
    result = list(Performer.objects.all().values())
    return JsonResponse({"performers": result})

@csrf_exempt
def getCapacityofBuses(request):
    # return the distinct capacities of all buses only
    result = list(Vehicle.objects.values('capacity').distinct())
    return JsonResponse({"Capacities": result})

@csrf_exempt
def getBusesWithCapacity(request):
    # return buses if has capacity equal to the requested capacity
    try:
        target_capacity = json.loads(request.body).get("capacity")
        if target_capacity is None:
            raise KeyError("capacity")
    except Exception:
        return JsonResponse({"error": "Invalid request payload or missing capacity."}, status=400)

    result = list(Vehicle.objects.filter(capacity=target_capacity).values())
    return JsonResponse({"buses": result})


@csrf_exempt
def getAvailableBusCapacities(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)

    try:
        print("Raw Request Body:", request.body) # <--- ADD THIS LINE
        data = json.loads(request.body)
        print("Parsed Data:", data) # <--- ADD THIS LINE
        start_date = data.get("start_date")
        end_date = data.get("end_date") # end_date is optional in Event model, but required for query

        if not start_date:
            return JsonResponse({"error": "Missing start_date in request payload."}, status=400)

        actual_end_date = end_date if end_date else start_date

        busy_bus_ids = HasBus.objects.filter(
            event__start_date__lte=actual_end_date,
            event__end_date__gte=start_date
        ).values_list('transportation__transportation_id', flat=True).distinct()

        available_capacities = Vehicle.objects.exclude(
            transportation_id__in=busy_bus_ids
        ).filter(
            capacity__isnull=False
        ).values_list('capacity', flat=True).distinct().order_by('capacity')

        capacities = [str(c) for c in available_capacities]

        return JsonResponse({"availableCapacities": capacities})

    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve available bus capacities: {e}"}, status=400)

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