from urllib import request
from django.shortcuts import render
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from api.models import Event, User, Venue, TicketType, Category, Performer, Vehicle, HasPerformer, HasBus, Discount, Ticket, Feedback, LostItem
import json
from django.db.models import ObjectDoesNotExist, Q
from django.conf import settings
from django.db.models import Min, Max
from django.views.decorators.http import require_POST
from django.utils import timezone
import os
from django.core import serializers
from django.db.models import Sum
from django.db import transaction

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
            HasBus.objects.filter(event=event).delete()  # For edit
            bus_data = json.loads(request.POST["buses"])
            for bus_info in bus_data:
                try:
                    vehicle = Vehicle.objects.get(transportation_id=bus_info['transportation_id'])
                    HasBus.objects.create(
                        event=event,
                        transportation=vehicle,
                        departure_loc=bus_info['departure_loc']
                    )
                except Vehicle.DoesNotExist:
                    print(f"Vehicle {bus_info['transportation_id']} not found")
                    continue

        if request.POST.get("discounts"):
            discounts_data = json.loads(request.POST["discounts"])
            for discount_data in discounts_data:
                try:
                    Discount.objects.create(
                        event=event,
                        discount_id=discount_data['discount_id'],
                        percentage=int(discount_data['percentage']),
                        max_value=int(discount_data['max_value']) if discount_data.get('max_value') else None,
                        quantity=int(discount_data['quantity']),
                        start_date=discount_data['start_date'],
                        end_date=discount_data['end_date']
                    )
                except Exception as e:
                    print(f"Failed to create discount {discount_data.get('discount_id')}: {e}")

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
        data = json.loads(request.body)
        start_date = data.get("start_date")
        end_date = data.get("end_date")
        event_id = data.get("event_id")  # For edit mode, exclude current event

        if not start_date:
            return JsonResponse({"error": "Missing start_date in request payload."}, status=400)

        actual_end_date = end_date if end_date else start_date

        # Find buses that are BUSY during the requested date range
        busy_filter = Q(
            event__start_date__lte=actual_end_date
        ) & (
            Q(event__end_date__gte=start_date) | 
            Q(event__end_date__isnull=True, event__start_date__gte=start_date)
        )
        
        # Exclude current event if editing
        if event_id:
            busy_filter &= ~Q(event_id=event_id)

        busy_bus_ids = HasBus.objects.filter(busy_filter).values_list(
            'transportation__transportation_id', flat=True
        ).distinct()

        # Get available buses (not in busy list)
        available_buses = Vehicle.objects.exclude(
            transportation_id__in=busy_bus_ids
        ).filter(
            capacity__isnull=False
        ).values('transportation_id', 'name', 'capacity').order_by('capacity', 'name')

        buses_list = list(available_buses)

        return JsonResponse({"availableBuses": buses_list})

    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve available buses: {e}"}, status=400)

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
    Get categories with banners of UPCOMING events only
    """
    try:
        today = timezone.now().date()

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT 
                    c.category_id,
                    c.category_name,
                    COUNT(e.event_id) AS event_count,
                    STRING_AGG(e.banner, ',' ORDER BY e.start_date ASC) AS banners
                FROM api_category c
                INNER JOIN api_event e 
                    ON c.category_id = e.category_id
                WHERE e.start_date >= %s
                GROUP BY c.category_id, c.category_name
                HAVING COUNT(e.event_id) > 0;
            """, [today])

            columns = [col[0] for col in cursor.description]
            results = [dict(zip(columns, row)) for row in cursor.fetchall()]

        categories = []
        for row in results:
            banner_paths = row["banners"].split(",") if row["banners"] else []

            banner_urls = [
                request.build_absolute_uri(settings.MEDIA_URL + path.strip())
                for path in banner_paths
                if path and path.strip()
            ]

            categories.append({
                "category_id": row["category_id"],
                "category_name": row["category_name"],
                "event_count": row["event_count"],   # upcoming events count
                "event_banners": banner_urls        # upcoming banners only
            })

        return JsonResponse({"categories": categories})

    except Exception as e:
        return JsonResponse(
            {"error": f"Failed to fetch categories: {str(e)}"},
            status=500
        )

    
    except Exception as e:
        return JsonResponse({"error": f"Failed to fetch categories: {str(e)}"}, status=500)
    
def getEventById(request, event_id):
    try:
        event = Event.objects.get(event_id=event_id)
        tickets = list(TicketType.objects.filter(event_id=event_id).values().order_by('price'))
        
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
                'transportation_id': has_bus.transportation.transportation_id,
                'number_assigned': has_bus.number_assigned,
            })

        # Get feedbacks with details
        feedbacks_data = []
        for fb in Feedback.objects.filter(event=event):
            feedbacks_data.append({
                'feedback_id': fb.feedback_id,
                'content': fb.feedback_content,
                'rating': fb.feedback_rating,
                'attendee': fb.attendee.username if fb.attendee else "Anonymous"
            })

        # Get lost items with details
        lost_items_data = []
        for item in LostItem.objects.filter(event=event):
            lost_items_data.append({
                'lost_id': item.lost_id,
                'description': item.description,
                'status': item.get_status_display()  # Returns 'Still lost' or 'Found'
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
            'feedbacks': feedbacks_data,
            'lost_items': lost_items_data,
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
        
        event = Event.objects.get(pk=event_id)
        
        current_user = request.session.get("username")
        if event.owner.username != current_user:
            return JsonResponse({"error": "Unauthorized"}, status=403)
        
        if request.POST.get("eventName"):
            event.name = request.POST["eventName"]
        
        if request.POST.get("description"):
            event.description = request.POST["description"]
        
        category_id = request.POST.get("category")
        if category_id:
            category_obj = Category.objects.get(pk=category_id)
            event.category = category_obj
        
        location_id = request.POST.get("location")
        if location_id:
            location_obj = Venue.objects.get(pk=location_id)
            event.location = location_obj
        
        if request.POST.get("start_date"):
            event.start_date = request.POST["start_date"]
        
        end_date = request.POST.get("end_date")
        if end_date:
            event.end_date = end_date if end_date else None
        
        if request.FILES.get("banner"):
            if event.banner and event.banner.name != "fallback.png":
                if os.path.isfile(event.banner.path):
                    os.remove(event.banner.path)
            event.banner = request.FILES["banner"]
        
        event.save()
        
        if request.POST.get("performers"):
            HasPerformer.objects.filter(event=event).delete()
            performer_pks = json.loads(request.POST["performers"])
            for pk in performer_pks:
                HasPerformer.objects.create(event=event, performer_id=pk)
        
        if request.POST.get("discounts"):
            Discount.objects.filter(event=event).delete()
            discounts_data = json.loads(request.POST["discounts"])
            for discount_data in discounts_data:
                try:
                    Discount.objects.create(
                        event=event,
                        discount_id=discount_data['discount_id'],
                        percentage=int(discount_data['percentage']),
                        max_value=int(discount_data['max_value']) if discount_data.get('max_value') else None,
                        quantity=int(discount_data['quantity']),
                        start_date=discount_data['start_date'],
                        end_date=discount_data['end_date']
                    )
                except Exception as e:
                    print(f"Failed to create discount {discount_data.get('discount_id')}: {e}")

        if request.POST.get("buses"):
            HasBus.objects.filter(event=event).delete()  # For edit
            bus_data = json.loads(request.POST["buses"])
            for bus_info in bus_data:
                try:
                    vehicle = Vehicle.objects.get(transportation_id=bus_info['transportation_id'])
                    HasBus.objects.create(
                        event=event,
                        transportation=vehicle,
                        departure_loc=bus_info['departure_loc']
                    )
                except Vehicle.DoesNotExist:
                    print(f"Vehicle {bus_info['transportation_id']} not found")
                    continue
        
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
    
@csrf_exempt
@require_POST
def buyTicket(request):
    try:
        # Get authenticated user
        attendee_username = request.session.get('username')
        if not attendee_username:
            return JsonResponse({'error': 'Not authenticated'}, status=401)
        
        try:
            attendee = User.objects.get(username=attendee_username)
        except User.DoesNotExist:
            return JsonResponse({'error': 'User does not exist'}, status=403)
        
        # Parse request data
        data = json.loads(request.body)
        ticket_type_id = data.get('ticket_type_id')
        quantity = data.get('quantity', 1)
        discount_code = data.get('discount_code', '').strip().upper()
        
        if not ticket_type_id:
            return JsonResponse({'error': 'ticket_type_id is required'}, status=400)
        
        # Validate quantity
        try:
            quantity = int(quantity)
            if quantity <= 0:
                return JsonResponse({'error': 'Quantity must be greater than 0'}, status=400)
        except (ValueError, TypeError):
            return JsonResponse({'error': 'Invalid quantity'}, status=400)
        
        # Get ticket type
        try:
            ticket_type = TicketType.objects.select_related('event').get(ticket_type_id=ticket_type_id)
        except TicketType.DoesNotExist:
            return JsonResponse({'error': 'Ticket type not found'}, status=404)
        
        # Check if tickets are available
        if ticket_type.quantity < quantity:
            return JsonResponse({
                'error': f'Only {ticket_type.quantity} tickets available'
            }, status=400)
        
        # Calculate price
        base_price = ticket_type.price * quantity
        final_price = base_price
        discount_applied = None
        
        # Apply discount if provided
        if discount_code:
            try:
                discount = Discount.objects.get(
                    event=ticket_type.event,
                    discount_id=discount_code
                )
                
                # Validate discount
                today = timezone.now().date()
                
                if discount.start_date > today:
                    return JsonResponse({
                        'invalid_code': f'Discount code not yet valid. Starts on {discount.start_date}'
                    }, status=400)
                
                if discount.end_date < today:
                    return JsonResponse({
                        'invalid_code': 'Discount code has expired'
                    }, status=400)
                
                if quantity > discount.quantity:
                    return JsonResponse({
                        'invalid_code': 'Discount code has been fully redeemed'
                    }, status=400)
                
                # Calculate discount
                discount_amount = (base_price * discount.percentage) / 100
                
                # Apply max value cap if exists
                if discount.max_value and discount_amount > discount.max_value:
                    discount_amount = discount.max_value
                
                final_price = base_price - discount_amount
                discount_applied = {
                    'code': discount_code,
                    'percentage': discount.percentage,
                    'amount': discount_amount
                }
                
                # Increment usage count
                discount.quantity -= 1
                discount.save()
                
            except Discount.DoesNotExist:
                return JsonResponse({
                    'invalid_code': 'Invalid discount code'
                }, status=400)
        
        # Check wallet balance
        if attendee.wallet < final_price:
            return JsonResponse({
                'error': f'Insufficient wallet balance. You need {final_price} EGP but have {attendee.wallet} EGP'
            }, status=400)
        
        # Check if user already has this ticket type
        existing_ticket = Ticket.objects.filter(
            attendee=attendee,
            ticket_type=ticket_type
        ).first()
        
        if existing_ticket:
            # Update existing ticket quantity
            existing_ticket.quantity += quantity
            existing_ticket.save()
        else:
            # Create new ticket
            Ticket.objects.create(
                attendee=attendee,
                ticket_type=ticket_type,
                quantity=quantity
            )
        
        # Deduct from wallet
        attendee.wallet -= final_price
        attendee.save()
        
        # Decrease ticket type quantity
        ticket_type.quantity -= quantity
        ticket_type.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Ticket purchased successfully',
            'purchase_details': {
                'ticket_type': ticket_type.name,
                'quantity': quantity,
                'base_price': base_price,
                'final_price': final_price,
                'discount_applied': discount_applied,
                'remaining_wallet_balance': attendee.wallet,
                'remaining_tickets': ticket_type.quantity
            }
        }, status=200)
        
    except Exception as e:
        return JsonResponse({
            'error': f'An unexpected error occurred: {str(e)}'
        }, status=500)

@csrf_exempt
@require_POST
def addFeedback(request):
    try:
        data = json.loads(request.body)
        content = data.get("feedback") 
        rating = data.get("rating")
        attendee_username = request.session.get('username')
        event_id = data.get("event_id")

        if not all([content, rating, attendee_username, event_id]):
            return JsonResponse({"error": "All fields are required."}, status=400)      
        
        user_obj = User.objects.get(username=attendee_username)
        event_obj = Event.objects.get(event_id=event_id)
        
        feedback = Feedback.objects.create(
            feedback_content=content,
            feedback_rating=rating,
            attendee=user_obj,
            event=event_obj  
        )
        
        return JsonResponse({"message": "Feedback created", "id": feedback.feedback_id})

    except User.DoesNotExist:
        return JsonResponse({"error": "User does not exist."}, status=404)
    except Event.DoesNotExist:
        return JsonResponse({"error": "Event does not exist."}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Failed to create Feedback: {e}"}, status=400)
    

@csrf_exempt
@require_POST
def addLostitem(request):
    try:
        data = json.loads(request.body)
        description = data.get("description") 
        event_id = data.get("event_id")

        if not all([description, event_id]):
            return JsonResponse({"error": "All fields are required."}, status=400)      
        event_obj = Event.objects.get(event_id=event_id)
        
        lostitem = LostItem.objects.create(
            description=description,
            status='L',
            event=event_obj  
        )
        item_data = {
            "lost_id": lostitem.lost_id,
            "description": lostitem.description,
            "status": lostitem.get_status_display()
        }
        
        return JsonResponse({"message": "Lost Item created", "lostitem": item_data})

    except User.DoesNotExist:
        return JsonResponse({"error": "User does not exist."}, status=404)
    except Event.DoesNotExist:
        return JsonResponse({"error": "Event does not exist."}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Failed to create Lost Item: {e}"}, status=400)
    
@csrf_exempt
@require_POST
def updateLostitem(request):
    try:
        data = json.loads(request.body)
        lost_id =data.get("lost_id")
        if not lost_id:
            return JsonResponse({"error": "lost_item ID is required"}, status=400)
        updated_count = LostItem.objects.filter(lost_id=lost_id).update(status='F') 
        if updated_count == 0:
            return JsonResponse({"error": "Item not found"}, status=404)
        return JsonResponse({
            "message": "Lost item status updated to Found", 
            "id": lost_id
        })
    except Exception as e:
        return JsonResponse({"error": f"Failed to update: {str(e)}"}, status=400)

@csrf_exempt
@require_POST
def getavailablelocation(request):
    try:
        data = json.loads(request.body)
        departure_location = data.get("departure_location")
        event_id = data.get("event_id")

        if not departure_location or not event_id:
            return JsonResponse({"error": "departure_location and event_id are required"}, status=400)
        bus_assignments = HasBus.objects.filter(
            event_id=event_id, 
            departure_loc=departure_location
        )

        total_capacity = bus_assignments.aggregate(
            total=Sum('transportation__capacity')
        )['total'] or 0

        total_tickets_sold = Ticket.objects.filter(
            ticket_type__event_id=event_id
        ).aggregate(total_qty=Sum('quantity'))['total_qty'] or 0

        available_seats = total_capacity - total_tickets_sold

        if total_capacity == 0:
            return JsonResponse({"error": "No buses assigned to this location for this event"}, status=404)

        return JsonResponse({
            "event_id": event_id,
            "location": departure_location,
            "total_bus_capacity": total_capacity,
            "tickets_sold": total_tickets_sold,
            "available_seats": max(0, available_seats)
        })

    except Exception as e:
        return JsonResponse({"error": f"Failed to retrieve data: {str(e)}"}, status=400)
    
@csrf_exempt
@require_POST
def bookBus(request):
    try:
        data = json.loads(request.body)
        bus_id = data.get("bus_id")  # This is the transportation_id
        event_id = data.get("event_id")
        quantity = data.get("quantity")

        # 1. Validation
        if not all([bus_id, event_id, quantity]):
            return JsonResponse({"error": "bus_id, event_id, and quantity are required"}, status=400)

        try:
            quantity = int(quantity)
        except ValueError:
            return JsonResponse({"error": "Quantity must be a number"}, status=400)

        # 2. Use a transaction to ensure data integrity
        with transaction.atomic():
            # Select for update locks the row until the transaction is finished
            assignment = HasBus.objects.select_for_update().get(
                transportation_id=bus_id, 
                event_id=event_id
            )

            # 3. Check Capacity (optional but recommended)
            total_capacity = assignment.transportation.capacity or 0
            currently_assigned = assignment.number_assigned or 0
            
            if currently_assigned + quantity > total_capacity:
                return JsonResponse({
                    "error": "Not enough seats available",
                    "available": total_capacity - currently_assigned
                }, status=400)

            # 4. Update the count
            assignment.number_assigned = currently_assigned + quantity
            assignment.save()

        return JsonResponse({
            "message": "Bus booking updated successfully",
            "total_assigned": assignment.number_assigned
        })

    except HasBus.DoesNotExist:
        return JsonResponse({"error": "This bus is not assigned to the specified event"}, status=404)
    except Exception as e:
        return JsonResponse({"error": f"Failed to update booking: {str(e)}"}, status=500)
