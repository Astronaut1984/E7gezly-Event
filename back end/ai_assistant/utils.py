from api.models import Event, Venue, Performer, TicketType, Discount, Category
from django.db.models import Q, Count
from datetime import datetime, date

def get_event_context(query):
    """
    Query the database for relevant events based on user query
    Returns formatted context string
    """
    context_parts = []
    
    # Search events by name, description, or category
    events = Event.objects.filter(
        Q(name__icontains=query) |
        Q(description__icontains=query) |
        Q(category__category_name__icontains=query)
    ).select_related('location', 'category', 'owner').prefetch_related(
        'performers', 'tickettype_set'
    )[:5]  # Limit to 5 most relevant
    
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
                f"Upcoming Events: {events_list if events_list else 'None scheduled'}\n"
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
                f"Upcoming Events: {events_list if events_list else 'None scheduled'}\n"
            )
    
    # If no results found, provide general event listing
    if not context_parts:
        upcoming_events = Event.objects.filter(
            start_date__gte=date.today()
        ).order_by('start_date')[:5]
        
        if upcoming_events.exists():
            context_parts.append("=== UPCOMING EVENTS ===")
            for event in upcoming_events:
                event_info = format_event_details(event)
                context_parts.append(event_info)
        else:
            context_parts.append("No events found matching your query.")
    
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
    
    # Get discounts
    discounts = Discount.objects.filter(
        event=event,
        start_date__lte=date.today(),
        end_date__gte=date.today()
    )
    
    discount_str = ""
    if discounts.exists():
        discount_info = []
        for d in discounts:
            discount_info.append(f"  - Code: {d.discount_id} ({d.percentage}% off, max ${d.max_value})")
        discount_str = "\nActive Discounts:\n" + "\n".join(discount_info)
    
    # Get performers
    performers = event.performers.all()
    performers_str = ", ".join([p.name for p in performers]) if performers.exists() else "TBA"
    
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
"""


def search_by_category(category_name):
    """
    Get events by category
    """
    events = Event.objects.filter(
        category__category_name__icontains=category_name
    ).order_by('start_date')[:10]
    
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