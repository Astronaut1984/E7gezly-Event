from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
from api.models import User, Performer, Venue
from django.db.models import Count
import json
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
@csrf_exempt
def getOrganizers(request):
    organizers = list(
        User.objects.filter(status="Organizer")
        .annotate(report_count=Count("reports_against"))
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

def getVenues(request):
    venues = list(
        Venue.objects.all().values("location_id", "name", "details", "capacity", "city", "country", "type")
    )
    return JsonResponse({"venues": venues})

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
        reports.objects.all().values()
    )
    return JsonResponse({"reports": reports})