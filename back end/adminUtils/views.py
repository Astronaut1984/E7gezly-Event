from rest_framework import generics
from api.models import User, Performer, Venue, Report, Category, Vehicle, Event
from django.shortcuts import render
from django.http import JsonResponse
from django.db.models import Count
import json
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Q
from django.http import JsonResponse
import hashlib

# Create your views here.
@csrf_exempt
def getOrganizers(request):
    organizers = list(
        User.objects.filter(status="Organizer")
        .annotate(
            report_count=Count(
                "reports_against",
                filter=~Q(reports_against__status="R")
            )
        )
        .order_by("-report_count")
        .values("username", "first_name", "last_name", "report_count")
    )
    return JsonResponse({"organizers": organizers})


@csrf_exempt
def deleteOrganizer(request):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE only"}, status=405)
    username = json.loads(request.body).get("username")
    if not username:
        return JsonResponse({"error": "Username required"}, status=400)

    deleted, _ = User.objects.filter(username=username, status="Organizer").delete()
    if deleted == 0:
        return JsonResponse({"error": "Organizer not found"}, status=404)

    return JsonResponse({"message": f"Organizer '{username}' deleted"})

# Create your views here.
@csrf_exempt
def getEvents(request):
    events = list(
        Event.objects.select_related("owner").all().values(
            "event_id", 
            "name", 
            "owner__first_name", 
            "owner__last_name"
        )
    )
    for event in events:
        event["owner_name"] = f"{event.pop('owner__first_name')} {event.pop('owner__last_name')}"

    return JsonResponse({"events": events})


@csrf_exempt
def deleteEvents(request):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE only"}, status=405)
    event_id = json.loads(request.body).get("event_id")
    if not event_id:
        return JsonResponse({"error": "Event ID required"}, status=400)

    deleted, _ = Event.objects.filter(event_id=event_id).delete()
    if deleted == 0:
        return JsonResponse({"error": "Event not found"}, status=404)

    return JsonResponse({"message": f"Event '{event_id}' deleted"})


@csrf_exempt
def getPerformers(request):
    performers = list(
        Performer.objects.all().values("performer_id", "name", "bio")
    )
    return JsonResponse({"performers": performers})

@csrf_exempt
def addPerformer(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)
    data = json.loads(request.body)
    name = data.get("name")
    bio = data.get("bio", "")
    if not name:
        return JsonResponse({"error": "Name required"}, status=400)
    performer = Performer.objects.create(name=name, bio=bio)
    return JsonResponse({"message": "Performer added", "performer_id": performer.performer_id})

@csrf_exempt
def deletePerformer(request):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE only"}, status=405)
    performer_id = json.loads(request.body).get("id")
    if not performer_id:
        return JsonResponse({"error": "Performer ID required"}, status=400)

    deleted, _ = Performer.objects.filter(performer_id=performer_id).delete()
    if deleted == 0:
        return JsonResponse({"error": "Performer not found"}, status=404)

    return JsonResponse({"message": f"Performer '{performer_id}' deleted"})

@csrf_exempt
def updatePerformer(request):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT only"}, status=405)
    data = json.loads(request.body)
    performer_id = data.get("performer_id")
    name = data.get("name")
    bio = data.get("bio")

    if not performer_id:
        return JsonResponse({"error": "Performer ID required"}, status=400)
    if not name:
        return JsonResponse({"error": "New performer name required"}, status=400)

    try:
        performer = Performer.objects.get(performer_id=performer_id)
        performer.name = name
        performer.bio = bio
        performer.save()
        return JsonResponse({
            "message": f"Performer '{performer_id}' updated to '{name}'",
            "performer_id": performer.performer_id,
            "name": performer.name,
            "bio": performer.bio
        })
    except Performer.DoesNotExist:
        return JsonResponse({"error": "Performer not found"}, status=404)

def getVenues(request):
    venues = list(
        Venue.objects.all().values("location_id", "name", "details", "capacity", "city", "country", "type")
    )
    return JsonResponse({"venues": venues})

@csrf_exempt
def addVenues(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)
    data = json.loads(request.body)
    name = data.get("name")
    country = data.get("country")
    city = data.get("city")
    details = data.get("details")
    type = data.get("type")
    capacity = data.get("capacity")

    if not name:
        return JsonResponse({"error": "Venue name required"}, status=400)
    
    try:
        capacity = int(capacity)
        if capacity <= 0:
            return JsonResponse({"error": "Capacity should be greater than 0"}, status=400)
    except (ValueError, TypeError):
        return JsonResponse({"error": "Capacity should be a valid number"}, status=400)
    
    if Venue.objects.filter(name=name).exists():
        return JsonResponse({"error": "Venue with this name already exists"}, status=400)

    venue = Venue.objects.create(
        name=name,
        country=country,
        city=city,
        details=details,
        type=type,
        capacity=capacity
    )
    return JsonResponse({
        "message": "Venue added",
        "location_id": venue.location_id,
        "name": venue.name,
        "country": venue.country,
        "city": venue.city,
        "details": venue.details,
        "type": venue.type,
        "capacity": venue.capacity
    })


@csrf_exempt
def updateVenues(request):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT only"}, status=405)
    data = json.loads(request.body)
    location_id = data.get("location_id")
    name = data.get("name")
    country = data.get("country")
    city = data.get("city")
    details = data.get("details")
    type = data.get("type")
    capacity = data.get("capacity")

    if not location_id:
        return JsonResponse({"error": "Venue ID required"}, status=400)
    try:
        capacity = int(capacity)
        if capacity <= 0:
            return JsonResponse({"error": "Capacity should be greater than 0"}, status=400)
    except (ValueError, TypeError):
        return JsonResponse({"error": "Capacity should be a valid number"}, status=400)
    if not name:
        return JsonResponse({"error": "New venue name required"}, status=400)

    try:
        venue = Venue.objects.get(location_id=location_id)
        venue.name = name
        venue.country = country
        venue.city = city
        venue.details = details
        venue.type = type
        venue.capacity = capacity
        venue.save()
        return JsonResponse({
            "message": f"Venue '{location_id}' updated",
            "location_id": venue.location_id,
            "name": venue.name,
            "country": venue.country,
            "city": venue.city,
            "details": venue.details,
            "type": venue.type,
            "capacity": venue.capacity
        })
    except Venue.DoesNotExist:
        return JsonResponse({"error": "Venue not found"}, status=404)
    
@csrf_exempt
def deleteVenue(request):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE only"}, status=405)
    location_id = json.loads(request.body).get("location_id")
    if not location_id:
        return JsonResponse({"error": "Venue ID required"}, status=400)

    deleted, _ = Venue.objects.filter(location_id=location_id).delete()
    if deleted == 0:
        return JsonResponse({"error": "Venue not found"}, status=404)

    return JsonResponse({"message": f"Venue '{location_id}' deleted"})

def getReports(request):
    reports = list(
        Report.objects.all().values("report_id", "report_content", "status", "attendee", "owner", "administrator")
    )
    return JsonResponse({"reports" : reports})

@csrf_exempt
def resolveReport(request):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT only"}, status=405)
    data = json.loads(request.body)
    report_id = data.get("report_id")
    admin_username = data.get("administrator")
    if not report_id:
        return JsonResponse({"error": "Report ID required"}, status=400)
    if not admin_username:
        return JsonResponse({"error": "Admin not found"}, status=400)
        
    
    report = Report.objects.filter(report_id=report_id).first()
    if report and report.administrator is not None:
        return JsonResponse({"error": f"Already Resolved by {report.administrator}"}, status=400)

    updated = Report.objects.filter(report_id=report_id).update(
        administrator=admin_username,
        status="R"
    )
    if updated == 0:
        return JsonResponse({"error": "Report not found"}, status=404)
    
    return JsonResponse({"message": f"Report '{report_id}' resolved"})

@csrf_exempt
def getCategories(request):
    categories = list(
        Category.objects.all().values("category_id", "category_name")
    )
    return JsonResponse({"categories": categories})

@csrf_exempt
def deleteCategories(request):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE only"}, status=405)
    category_id = json.loads(request.body).get("category_id")
    if not category_id:
        return JsonResponse({"error": "Category ID required"}, status=400)

    deleted, _ = Category.objects.filter(category_id=category_id).delete()
    if deleted == 0:
        return JsonResponse({"error": "Category not found"}, status=404)

    return JsonResponse({"message": f"Category '{category_id}' deleted"})

@csrf_exempt
def addCategories(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)
    data = json.loads(request.body)
    category_name = data.get("category_name")
    if not category_name:
        return JsonResponse({"error": "Category name required"}, status=400)
    
    # Check if category with the same name already exists
    if Category.objects.filter(category_name=category_name).exists():
        return JsonResponse({"error": "Category with this name already exists"}, status=400)

    category = Category.objects.create(category_name=category_name)
    return JsonResponse({"message": "Category added", "category_id": category.category_id, "category_name": category.category_name})


@csrf_exempt
def updateCategories(request):
    if request.method != "PUT": # Changed to PUT for updating
        return JsonResponse({"error": "PUT only"}, status=405)
    data = json.loads(request.body)
    category_id = data.get("category_id")
    category_name = data.get("category_name")

    if not category_id:
        return JsonResponse({"error": "Category ID required"}, status=400)
    if not category_name:
        return JsonResponse({"error": "New category name required"}, status=400)

    try:
        category = Category.objects.get(category_id=category_id)
        category.category_name = category_name
        category.save()
        return JsonResponse({"message": f"Category '{category_id}' updated to '{category_name}'"})
    except Category.DoesNotExist:
        return JsonResponse({"error": "Category not found"}, status=404)
    

@csrf_exempt
def getVehicle(request):
    Vehicles = list(
        Vehicle.objects.all().values("transportation_id", "name", "capacity")
    )
    return JsonResponse({"Vehicles": Vehicles})

@csrf_exempt
def deleteVehicle(request):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE only"}, status=405)
    transportation_id = json.loads(request.body).get("transportation_id")
    if not transportation_id:
        return JsonResponse({"error": "Vehicle ID required"}, status=400)

    deleted, _ = Vehicle.objects.filter(transportation_id=transportation_id).delete()
    if deleted == 0:
        return JsonResponse({"error": "Vehicle not found"}, status=404)

    return JsonResponse({"message": f"Vehicle '{transportation_id}' deleted"})

@csrf_exempt
def addVehicle(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)
    data = json.loads(request.body)
    name = data.get("name")
    capacity = data.get("capacity")
    if not name:
        return JsonResponse({"error": "Vehicle name required"}, status=400)
    try:
        capacity = int(capacity)
        if capacity <= 0:
            return JsonResponse({"error": "Capacity should be greater than 0"}, status=400)
    except (ValueError, TypeError):
        return JsonResponse({"error": "Capacity should be a valid number"}, status=400)
    # Check if vehicle with the same name already exists
    if Vehicle.objects.filter(name=name).exists():
        return JsonResponse({"error": "Vehicle with this name already exists"}, status=400)

    vehicle = Vehicle.objects.create(name=name, capacity=capacity)
    return JsonResponse({"message": "Vehicle added", "transportation_id": vehicle.transportation_id, "name": vehicle.name, "capacity": vehicle.capacity})


@csrf_exempt
def updateVehicle(request):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT only"}, status=405)
    data = json.loads(request.body)
    transportation_id = data.get("transportation_id")
    name = data.get("name")
    capacity = data.get("capacity")

    if not transportation_id:
        return JsonResponse({"error": "Vehicle ID required"}, status=400)
    if not name:
        return JsonResponse({"error": "New vehicle name required"}, status=400)
    try:
        capacity = int(capacity)
        if capacity <= 0:
            return JsonResponse({"error": "Capacity should be greater than 0"}, status=400)
    except (ValueError, TypeError):
        return JsonResponse({"error": "Capacity should be a valid number"}, status=400)
    try:
        vehicle = Vehicle.objects.get(transportation_id=transportation_id)
        vehicle.name = name
        vehicle.capacity = capacity # Update capacity
        vehicle.save()
        return JsonResponse({"message": f"Vehicle '{transportation_id}' updated to '{name}' with capacity '{capacity}'"})
    except Vehicle.DoesNotExist:
        return JsonResponse({"error": "Vehicle not found"}, status=404)
    
@csrf_exempt
def createAdmin(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            required_fields = ["username", "password", "firstName", "lastName", "email", "country", "city", "phoneNumber"]
            if not all(data.get(field) for field in required_fields):
                return JsonResponse({"error": "All fields are required"}, status=400)

            # WARNING: Using unsalted SHA256 for password hashing is INSECURE.
            # This is done as per user request, but it is strongly recommended
            # to migrate to a salted, adaptive hashing algorithm like bcrypt,
            # scrypt, or PBKDF2 (which Django's make_password uses by default).
            # This implementation is vulnerable to rainbow table attacks.
            hashed_password = hashlib.sha256(data.get("password").encode()).hexdigest()
            
            user = User.objects.create(
                username=data.get("username"),
                password=hashed_password,
                first_name=data.get("firstName"),
                last_name=data.get("lastName"),
                email=data.get("email"),
                status="Administrator",
                country=data.get("country"),
                city=data.get("city"),
                phone=data.get("phoneNumber"),
                wallet=0
            )
            return JsonResponse({"message": "Admin created successfully"})
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Only POST method allowed"}, status=405)

