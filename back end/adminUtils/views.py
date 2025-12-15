from django.shortcuts import render
from django.http import JsonResponse
from django.db import connection
from api.models import User, Performer, Venue, Report
from django.db.models import Count
import json
from django.views.decorators.csrf import csrf_exempt
from django.db.models import Count, Q
from django.http import JsonResponse

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
def addCategory(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST only"}, status=405)
    data = json.loads(request.body)
    name = data.get("name")
    if not name:
        return JsonResponse({"error": "Name required"}, status=400)
    category = Category.objects.create(category_name=name)
    return JsonResponse({"message": "Category added", "category_id": category.category_id})

@csrf_exempt
def deleteCategory(request):
    if request.method != "DELETE":
        return JsonResponse({"error": "DELETE only"}, status=405)
    category_id = json.loads(request.body).get("id")
    if not category_id:
        return JsonResponse({"error": "Category ID required"}, status=400)

    deleted, _ = Category.objects.filter(category_id=category_id).delete()
    if deleted == 0:
        return JsonResponse({"error": "Category not found"}, status=404)

    return JsonResponse({"message": f"Category '{category_id}' deleted"})

@csrf_exempt
def updateCategory(request):
    if request.method != "PUT":
        return JsonResponse({"error": "PUT only"}, status=405)
    data = json.loads(request.body)
    category_id = data.get("id")
    name = data.get("name")
    if not category_id or not name:
        return JsonResponse({"error": "Category ID and name required"}, status=400)

    updated = Category.objects.filter(category_id=category_id).update(category_name=name)
    if updated == 0:
        return JsonResponse({"error": "Category not found"}, status=404)

    return JsonResponse({"message": f"Category '{category_id}' updated"})
