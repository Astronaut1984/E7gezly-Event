from api.models import Event, Venue, Performer, TicketType, Discount, Category, LostItem
from django.db.models import Q
from datetime import datetime, date

def get_event_context(query):
    """
    Query the database for relevant events based on user query
    Returns formatted context string
    """
    context_parts = []

    # Search events - explicitly use .all() to bypass any default filtering
    events = Event.objects.all().filter(
        Q(name__icontains=query) |
        Q(description__icontains=query) |
        Q(location__name__icontains=query) |
        Q(location__city__icontains=query) |
        Q(category__category_name__icontains=query) |
        Q(owner__first_name__icontains=query) |
        Q(owner__last_name__icontains=query) |
        Q(performers__name__icontains=query)
    ).distinct().select_related('location', 'category', 'owner').prefetch_related(
        'performers', 'tickettype_set', 'lostitem_set'
    ).order_by('-start_date')[:5]  # Limit to 5 most relevant

    if events.exists():
        context_parts.append("=== EVENTS ===")
        for event in events:
            event_info = format_event_details(event)
            context_parts.append(event_info)

    # Search performers
    performers = Performer.objects.filter(
        Q(name__icontains=query) |
        Q(bio__icontains=query)
    )[:3]

    if performers.exists():
        context_parts.append("\n=== PERFORMERS ===")
        for performer in performers:
            performer_events = Event.objects.filter(performers=performer)[:3]
            events_list = ", ".join([e.name for e in performer_events])
            context_parts.append(
                f"Performer: {performer.name}\n"
                f"Bio: {performer.bio}\n"
                f"Events: {events_list if events_list else 'None associated'}\n"
            )

    # Search venues
    venues = Venue.objects.filter(
        Q(name__icontains=query) |
        Q(city__icontains=query) |
        Q(country__icontains=query)
    )[:3]

    if venues.exists():
        context_parts.append("\n=== VENUES ===")
        for venue in venues:
            venue_events = Event.objects.filter(location=venue)[:3]
            events_list = ", ".join([e.name for e in venue_events])
            context_parts.append(
                f"Venue: {venue.name}\n"
                f"Location: {venue.city}, {venue.country}\n"
                f"Capacity: {venue.capacity}\n"
                f"Type: {venue.type}\n"
                f"Events: {events_list if events_list else 'None scheduled'}\n"
            )

    # Search lost items with their associated events (ALL regardless of status or event date)
    lost_items = LostItem.objects.filter(
        Q(description__icontains=query) |
        Q(event__name__icontains=query)
    ).select_related('event', 'event__location')[:5]

    if lost_items.exists():
        context_parts.append("\n=== LOST ITEMS ===")
        for item in lost_items:
            status_display = "Found" if item.status == 'F' else "Still Lost"
            context_parts.append(
                f"Item: {item.description}\n"
                f"Status: {status_display}\n"
                f"Event: {item.event.name}\n"
                f"Date: {item.event.start_date.strftime('%B %d, %Y')}\n"
                f"Location: {item.event.location.name if item.event.location else 'TBA'}\n"
            )

    # If no results found, provide general listing (all events and lost items regardless of date)
    if not context_parts:
        all_events = Event.objects.all().order_by('-start_date')[:5]
        all_lost_items = LostItem.objects.all().select_related('event', 'event__location')

        if all_events.exists():
            context_parts.append("=== ALL EVENTS ===")
            for event in all_events:
                event_info = format_event_details(event)
                context_parts.append(event_info)
        
        if all_lost_items.exists():
            context_parts.append("\n=== ALL LOST ITEMS ===")
            for item in all_lost_items:
                status_display = "Found" if item.status == 'F' else "Still Lost"
                context_parts.append(
                    f"Item: {item.description}\n"
                    f"Status: {status_display}\n"
                    f"Event: {item.event.name}\n"
                    f"Date: {item.event.start_date.strftime('%B %d, %Y')}\n"
                    f"Location: {item.event.location.name if item.event.location else 'TBA'}\n"
                )
        
        if not all_events.exists() and not all_lost_items.exists():
            context_parts.append("No events or lost items found.")

    return "\n\n".join(context_parts)


def format_event_details(event):
    """
    Format a single event's details into a readable string
    """
    # Get ticket types
    ticket_types = event.tickettype_set.all()
    tickets_info = []
    for tt in ticket_types:
        available = tt.quantity if tt.quantity else "Unlimited"
        tickets_info.append(f"  - {tt.name}: ${tt.price} ({available} available)")

    tickets_str = "\n".join(tickets_info) if tickets_info else "  No tickets available yet"

    # Get all discounts for this event (including past/expired ones)
    discounts = Discount.objects.filter(event=event)

    discount_str = ""
    if discounts.exists():
        discount_info = []
        for d in discounts:
            # Check if discount is currently active
            is_active = d.start_date <= date.today() <= d.end_date
            status = "Active" if is_active else "Expired"
            discount_info.append(f"  - Code: {d.discount_id} ({d.percentage}% off, max ${d.max_value}) [{status}]")
        discount_str = "\nDiscounts:\n" + "\n".join(discount_info)

    # Get performers
    performers = event.performers.all()
    performers_str = ", ".join([p.name for p in performers]) if performers.exists() else "TBA"

    # Get all lost items for this event (regardless of status)
    lost_items = event.lostitem_set.all()
    if lost_items.exists():
        lost_items_list = "\n".join([f"  - {item.description}" for item in lost_items])
        lost_str = f"\nLost Items:\n{lost_items_list}"
    else:
        lost_str = "\nLost Items: None reported"

    # Format location
    location_str = f"{event.location.name} ({event.location.city}, {event.location.country})" if event.location else "TBA"

    # Format dates
    date_str = event.start_date.strftime("%B %d, %Y")
    if event.end_date and event.end_date != event.start_date:
        date_str += f" - {event.end_date.strftime('%B %d, %Y')}"

    return f"""Event: {event.name}
Category: {event.category.category_name if event.category else 'General'}
Description: {event.description}
Date: {date_str}
Location: {location_str}
Performers: {performers_str}
Organizer: {event.owner.first_name} {event.owner.last_name}
Tickets:
{tickets_str}{discount_str}
{lost_str}
"""


def search_by_category(category_name):
    """
    Get all events by category (no date restrictions - includes past events)
    """
    events = Event.objects.filter(
        category__category_name__icontains=category_name
    ).order_by('-start_date')  # Remove limit to get ALL matching events

    return [format_event_details(e) for e in events]


def search_by_date_range(start_date, end_date=None):
    """
    Get events within a date range
    """
    if end_date:
        events = Event.objects.filter(
            start_date__gte=start_date,
            start_date__lte=end_date
        ).order_by('start_date')
    else:
        events = Event.objects.filter(
            start_date__gte=start_date
        ).order_by('start_date')[:10]

    return [format_event_details(e) for e in events]


def get_all_lost_items():
    """
    Get ALL lost items with their associated events
    - Includes items marked as Found ('F') and Still Lost ('L')
    - Includes items from past, present, and future events
    - No date or status filters applied
    """
    lost_items = LostItem.objects.all().select_related('event', 'event__location').order_by('-event__start_date')
    
    context_parts = ["=== ALL LOST ITEMS ==="]
    for item in lost_items:
        status_display = "Found" if item.status == 'F' else "Still Lost"
        context_parts.append(
            f"Item: {item.description}\n"
            f"Status: {status_display}\n"
            f"Event: {item.event.name}\n"
            f"Date: {item.event.start_date.strftime('%B %d, %Y')}\n"
            f"Location: {item.event.location.name if item.event.location else 'TBA'}\n"
        )
    
    return "\n\n".join(context_parts) if lost_items.exists() else "No lost items found."