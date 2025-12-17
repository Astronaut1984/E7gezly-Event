from django.shortcuts import render
from django.db import connection, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import User
import json

@csrf_exempt
def countUsers(request):
        with connection.cursor() as cursor:
            cursor.execute("SELECT count_user()")
            result = cursor.fetchone()  
        return JsonResponse({
            'success': True,
            'count': result[0] if result else 0
        })

@csrf_exempt
def countOrganizers(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM api_user where status='Organizer'")
        result = cursor.fetchone()
    return JsonResponse({"count": result[0]})

@csrf_exempt
def countAttendees(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM api_user where status='Attendee'")
        result = cursor.fetchone()
    return JsonResponse({"count": result[0]})

@csrf_exempt
def countCategories(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM api_category")
        result = cursor.fetchone()
    return JsonResponse({"count": result[0]})


@csrf_exempt
def countEvents(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM api_event")
        result = cursor.fetchone()
    return JsonResponse({"count": result[0]})

@csrf_exempt
def countEventsOfCategory(request):
    if request.method == 'GET' and 'category_name' in request.GET:
        category_name = request.GET.get('category_name')
    elif request.method == 'POST' and 'category_name' in request.POST:
        category_name = request.POST.get('category_name')
    else:
        return JsonResponse({"error": "Missing 'category_name' parameter."}, status=400)

    category_id = None
    event_count = 0

    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT category_id FROM api_category WHERE category_name = %s",
            [category_name]
        )
        category_result = cursor.fetchone()

        if category_result:
            category_id = category_result[0]
            cursor.execute(
                "SELECT COUNT(*) FROM api_event WHERE category_id = %s",
                [category_id]
            )
            count_result = cursor.fetchone()
            event_count = count_result[0]
        else:
            return JsonResponse({"error": f"Category '{category_name}' not found."}, status=404)
    return JsonResponse({
        "category_name": category_name,
        "category_id": category_id,
        "count": event_count
    })

@csrf_exempt
def mostFollowedOrganizers(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT organizer_id, COUNT(*) AS follower_count FROM api_Follow where organizer=username GROUP BY organizer_id ORDER BY follower_count DESC LIMIT 10")
        results = cursor.fetchall()
    top_organizers = []
    for organizer_id, count in results:
        top_organizers.append({
            "organizer_id": organizer_id,
            "follower_count": count
        })
    return JsonResponse({"top_10_organizers": top_organizers})