from django.shortcuts import render
from django.http import JsonResponse
from api.models import User, Performer
from django.db.models import Count
import json
from django.views.decorators.csrf import csrf_exempt

# Create your views here.
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

def getPerformers(request):
    performers = list(
        Performer.objects.all().values("performer_id", "name", "bio")
    )
    return JsonResponse({"performers": performers})