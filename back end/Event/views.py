from urllib import request
from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import Event, User, Venue, TicketType, Category, Performer, Vehicle, HasPerformer, HasBus
import json
from django.db.models import ObjectDoesNotExist
from django.conf import settings
from django.db.models import Min, Max
from django.views.decorators.http import require_POST

@csrf_exempt
@require_POST
def addEvent(request):

    try:
        owner_obj = User.objects.get(username=request.session.get("username"))
        location_obj = Venue.objects.get(pk=request.POST["location"])
        
        category_id = request.POST.get("category")
        category_obj = Category.objects.get(pk=category_id) if category_id else None

        start_date = request.POST["start_date"]
        end_date = request.POST["end_date"]

        if start_date == "":
            return JsonResponse({"error": "Event has no start date"})
        elif not end_date:
            end_date = None

        
        event = Event.objects.create(
            name=request.POST["eventName"],
            description=request.POST["description"],
            category=category_obj,
            status='U',
            start_date=request.POST["start_date"],
            end_date=end_date,
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
        return JsonResponse({"error": f"An unexpected error occurred. {e}"}, status=500)

@csrf_exempt
def getVenues(request):
    result = list(Venue.objects.all().values())
    return JsonResponse({"venues": result})

@csrf_exempt
def getCategories(request):
    result = list(Category.objects.all().values())
    return JsonResponse({"categories": result})

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
    try:
        target_capacity = json.loads(request.body).get("capacity")
        if target_capacity is None:
            raise KeyError("capacity")
    except Exception:
        return JsonResponse({"error": "Invalid request payload or missing capacity."}, status=400)

    result = list(Vehicle.objects.filter(capacity=target_capacity).values())
    return JsonResponse({"buses": result})


@csrf_exempt
@require_POST
def getAvailableBusCapacities(request):
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
    try:
        if request.method == "POST":
            filters_data = json.loads(request.body) if request.body else {}
        else:
            filters_data = request.GET.dict()

        category_id = filters_data.get("category_id")
        venue_id = filters_data.get("venue_id")
        owner_username = filters_data.get("owner_username")

        query_filters = {}

        if category_id:
            if isinstance(category_id, str) and ',' in category_id:
                category_ids = [int(x.strip()) for x in category_id.split(',') if x.strip().isdigit()]
                if category_ids:
                    query_filters['category_id__in'] = category_ids
            else:
                query_filters['category_id'] = category_id

        if venue_id:
            if isinstance(venue_id, str) and ',' in venue_id:
                venue_ids = [int(x.strip()) for x in venue_id.split(',') if x.strip().isdigit()]
                if venue_ids:
                    query_filters['location_id__in'] = venue_ids
            else:
                query_filters['location_id'] = venue_id

        if owner_username:
            query_filters['owner__username'] = owner_username

        events = list(Event.objects.filter(**query_filters).values())

        for event in events:
            if event.get('banner'):
                banner_path = event['banner']
                event['banner'] = request.build_absolute_uri(settings.MEDIA_URL + banner_path)

            price_range = TicketType.objects.filter(
                event_id=event['event_id']
            ).aggregate(
                min_price=Min('price'),
                max_price=Max('price')
            )

            event['min_price'] = price_range['min_price']
            event['max_price'] = price_range['max_price']

        if owner_username:
            return JsonResponse({"organizer_events": events})
        else:
            return JsonResponse({"Events": events})

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON in request body"}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Failed to fetch events: {str(e)}"}, status=500)
    
@csrf_exempt
@require_POST
def addTicketType(request):
    try:
        data = json.loads(request.body)
        event_obj = Event.objects.get(pk=data["event"])
        print(event_obj)

        ticket = TicketType.objects.create(
            name=data["name"],
            description=data.get("description", ""),
            price=data["price"],
            quantity=data.get("quantity", 0),
            event=event_obj
        )
        return JsonResponse({"message": "Ticket Type created", "id": ticket.ticket_type_id})
    except (KeyError, ObjectDoesNotExist) as e:
        return JsonResponse({"error": f"Missing or invalid data: {e}"}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"An unexpected error occurred. {e}"}, status=500)

@csrf_exempt
@require_POST
def addVenue(request):
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

@csrf_exempt
@require_POST  
def deleteEvent(request):
    try:
        data = json.loads(request.body)
        event = data.get("event_id")
        if not event:
            return JsonResponse({"error": "event_id is required"}, status=400)
        deleted, _ = Event.objects.filter(event_id=event).delete()
        if deleted == 0:
            return JsonResponse({"error": "Event not found"}, status=404)
        return JsonResponse({"success": True, "deleted": event})
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"Failed to delete event: {e}"}, status=500)
    
@csrf_exempt
def getCategoriesWithBanners(request):
    """
    Get all categories that have at least one event, 
    along with the banner URLs of all events in each category.
    
    Returns:
    {
        "categories": [
            {
                "category_id": 1,
                "category_name": "Concerts",
                "event_count": 5,
                "event_banners": ["url1", "url2", "url3", ...]
            },
            ...
        ]
    }
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    c.category_id,
                    c.category_name,
                    COUNT(e.event_id) AS event_count,
                    STRING_AGG(e.banner, ',') AS banners
                FROM api_category c
                INNER JOIN api_event e ON c.category_id = e.category_id
                GROUP BY c.category_id, c.category_name
                HAVING COUNT(e.event_id) > 0;
            """)
            
            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        categories = []
        for row in results:
            banner_paths = row['banners'].split(',') if row['banners'] else []
            banner_urls = [
                request.build_absolute_uri(settings.MEDIA_URL + path.strip())
                for path in banner_paths if path and path.strip()
            ]
            
            categories.append({
                "category_id": row['category_id'],
                "category_name": row['category_name'],
                "event_count": row['event_count'],
                "event_banners": banner_urls
            })
        
        return JsonResponse({"categories": categories})
    
    except Exception as e:
        return JsonResponse({"error": f"Failed to fetch categories: {str(e)}"}, status=500)
    
def getEventById(request, event_id):
    try:
        event = Event.objects.get(event_id=event_id)
        tickets = list(TicketType.objects.filter(event_id=event_id).values())
        
        # Get performers with IDs
        performers_data = []
        for has_performer in HasPerformer.objects.filter(event=event):
            performers_data.append({
                'performer_id': has_performer.performer.performer_id,
                'name': has_performer.performer.name
            })
        
        # Get buses with details
        buses_data = []
        for has_bus in HasBus.objects.filter(event=event):
            buses_data.append({
                'capacity': has_bus.transportation.capacity,
                'departure_loc': has_bus.departure_loc,
                'transportation_id': has_bus.transportation.transportation_id
            })

        # Serialize the event data inline
        event_data = {
            'event_id': event.event_id,
            'name': event.name,
            'description': event.description,
            'category': event.category.category_id if event.category else None,
            'category_name': event.category.category_name if event.category else None,
            'start_date': event.start_date,
            'end_date': event.end_date,
            'owner_first_name': event.owner.first_name,
            'owner_last_name': event.owner.last_name,
            'owner_username': event.owner.username,
            'location_id': event.location.location_id if event.location else None,
            'location_name': event.location.name if event.location else None,
            'banner': request.build_absolute_uri(event.banner.url) if event.banner else None,
            'performers': performers_data,  # Now includes IDs
            'buses': buses_data,  # Now includes full data
            'tickets': tickets,
        }
        
        return JsonResponse({"event": event_data})
    except Event.DoesNotExist:
        return JsonResponse(
            {'error': 'Event not found'}, 
            status=404
        )
    
@csrf_exempt
@require_POST
def editEvent(request):
    try:
        event_id = request.POST.get("event_id")
        
        if not event_id:
            return JsonResponse({"error": "Event ID is required"}, status=400)
        
        # Get the event
        event = Event.objects.get(pk=event_id)
        
        # Check if current user is the owner
        current_user = request.session.get("username")
        if event.owner.username != current_user:
            return JsonResponse({"error": "Unauthorized"}, status=403)
        
        # Update basic event fields
        if request.POST.get("eventName"):
            event.name = request.POST["eventName"]
        
        if request.POST.get("description"):
            event.description = request.POST["description"]
        
        # Update category
        category_id = request.POST.get("category")
        if category_id:
            category_obj = Category.objects.get(pk=category_id)
            event.category = category_obj
        
        # Update location
        location_id = request.POST.get("location")
        if location_id:
            location_obj = Venue.objects.get(pk=location_id)
            event.location = location_obj
        
        # Update dates
        if request.POST.get("start_date"):
            event.start_date = request.POST["start_date"]
        
        end_date = request.POST.get("end_date")
        if end_date:
            event.end_date = end_date if end_date else None
        
        # Update banner if new one is provided
        if request.FILES.get("banner"):
            # Delete old banner if it's not the fallback
            if event.banner and event.banner.name != "fallback.png":
                if os.path.isfile(event.banner.path):
                    os.remove(event.banner.path)
            event.banner = request.FILES["banner"]
        
        event.save()
        
        # Update performers (remove old, add new)
        if request.POST.get("performers"):
            HasPerformer.objects.filter(event=event).delete()
            performer_pks = json.loads(request.POST["performers"])
            for pk in performer_pks:
                HasPerformer.objects.create(event=event, performer_id=pk)
        
        # Update buses (remove old, add new)
        if request.POST.get("buses"):
            HasBus.objects.filter(event=event).delete()
            bus_data = json.loads(request.POST["buses"])
            for bus_info in bus_data:
                # Find vehicle with matching capacity
                vehicle = Vehicle.objects.filter(capacity=bus_info['capacity']).first()
                if vehicle:
                    HasBus.objects.create(
                        event=event,
                        transportation=vehicle,
                        departure_loc=bus_info['departure_loc']
                    )
        
        return JsonResponse({"message": "Event updated successfully", "id": event.event_id})
    
    except Event.DoesNotExist:
        return JsonResponse({"error": "Event not found"}, status=404)
    except (KeyError, ObjectDoesNotExist) as e:
        return JsonResponse({"error": f"Missing or invalid data: {e}"}, status=400)
    except Exception as e:
        return JsonResponse({"error": f"An unexpected error occurred: {e}"}, status=500)
    
@csrf_exempt
@require_POST
def editTicketType(request):
    try:
        data = json.loads(request.body)
        ticket_type_id = data.get("ticket_type_id")
        
        ticket = TicketType.objects.get(pk=ticket_type_id)
        
        # Update fields
        if data.get("name"):
            ticket.name = data["name"]
        if data.get("description"):
            ticket.description = data["description"]
        if data.get("price"):
            ticket.price = int(data["price"])
        if data.get("quantity"):
            ticket.quantity = int(data["quantity"])
        
        ticket.save()
        return JsonResponse({"message": "Ticket Type updated", "id": ticket.ticket_type_id})
    except TicketType.DoesNotExist:
        return JsonResponse({"error": "Ticket type not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"An unexpected error occurred: {e}"}, status=500)

@csrf_exempt
@require_POST
def deleteTicketType(request):
    try:
        data = json.loads(request.body)
        ticket_type_id = data.get("ticket_type_id")
        
        ticket = TicketType.objects.get(pk=ticket_type_id)
        ticket.delete()
        return JsonResponse({"message": "Ticket Type deleted"})
    except TicketType.DoesNotExist:
        return JsonResponse({"error": "Ticket type not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"An unexpected error occurred: {e}"}, status=500)