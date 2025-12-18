from django.shortcuts import render
from django.db import connection, transaction
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import User
from decimal import Decimal
import json

@csrf_exempt
def countUsers(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL count_user(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })


@csrf_exempt
def countOrganizers(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL count_organizer(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })

@csrf_exempt
def countAttendees(request):
    with connection.cursor() as cursor:
        cursor.execute("SELECT COUNT(*) FROM api_user where status='Attendee'")
        result = cursor.fetchone()
    return JsonResponse({"count": result[0]})

@csrf_exempt
def countCategories(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL count_category(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })


@csrf_exempt
def countEvents(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL count_event(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })

@csrf_exempt
def countBuses(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL count_bus(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })

@csrf_exempt
def maxCapBuses(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL max_capacity_bus(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })

@csrf_exempt
def minCapBuses(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL min_capacity_bus(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })

@csrf_exempt
def avgCapBuses(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL avg_capacity_bus(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })

@csrf_exempt
def maxCapVenues(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL max_venue_cap(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })

@csrf_exempt
def minCapVenues(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL min_venue_cap(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })

@csrf_exempt
def avgCapVenues(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL avg_venue_cap(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })


@csrf_exempt
def countVenues(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL count_venue(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })

@csrf_exempt
def countPerformers(request):
    with connection.cursor() as cursor:
        cursor.execute("CALL count_performer(NULL)")
        result = cursor.fetchone()  
    return JsonResponse({
        'success': True,
        'count': result[0] if result else 0
    })

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
        cursor.execute("SELECT T2.organizer_id, COUNT(T2.attendee_id) AS follower_count FROM api_user AS T1 JOIN api_follow AS T2 ON T1.username = T2.organizer_id WHERE T1.status = 'Organizer' GROUP BY T2.organizer_id ORDER BY follower_count DESC LIMIT 10")
        results = cursor.fetchall()
    top_organizers = []
    for organizer_id, count in results:
        top_organizers.append({
            "organizer_id": organizer_id,
            "follower_count": count
        })
    return JsonResponse({"top_10_organizers": top_organizers})

@csrf_exempt
def venueUsageReport(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("BEGIN")
            cursor.execute("CALL get_venue_usage_report('result_cursor')")
            cursor.execute("FETCH ALL FROM result_cursor")
            
            columns = [col[0] for col in cursor.description]
            results = []
            
            for row in cursor.fetchall():
                result_dict = {}
                for i, col in enumerate(columns):
                    value = row[i]
                    # Convert Decimal to float for JSON
                    if isinstance(value, Decimal):
                        value = float(value)
                    result_dict[col] = value
                results.append(result_dict)
            
            cursor.execute("COMMIT")
        
        return JsonResponse({
            'status': 'success',
            'data': results,
            'count': len(results)
        })
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)


@csrf_exempt
def organizerLeaderboard(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("BEGIN")
            cursor.execute("CALL get_organizer_leaderboard('result_cursor')")
            cursor.execute("FETCH ALL FROM result_cursor")
            
            columns = [col[0] for col in cursor.description]
            results = []
            
            for row in cursor.fetchall():
                result_dict = {}
                for i, col in enumerate(columns):
                    value = row[i]
                    # Convert Decimal to float for JSON serialization
                    if isinstance(value, Decimal):
                        value = float(value)
                    result_dict[col] = value
                results.append(result_dict)
            
            cursor.execute("COMMIT")
        
        return JsonResponse({
            'status': 'success',
            'data': results,
            'count': len(results)
        })
    
    except Exception as e:
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)
    
@csrf_exempt
def getCategoryData(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("BEGIN")
            cursor.execute("CALL get_category_performance_report('result_cursor')")
            cursor.execute("FETCH ALL FROM result_cursor")

            columns = [col[0] for col in cursor.description]
            results = []
            
            for row in cursor.fetchall():
                result_dict = {}
                for i, col in enumerate(columns):
                    value = row[i]
                    # Convert Decimal to float for JSON serialization
                    if isinstance(value, Decimal):
                        value = float(value)
                    result_dict[col] = value
                results.append(result_dict)
            
            cursor.execute("COMMIT")

        return JsonResponse({
        'status': 'success',
        'data': results,
        'count': len(results)
        })
    except Exception as e:
        return JsonResponse({'error': f'unexpected error: {e}'})
