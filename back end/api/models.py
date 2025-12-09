from django.db import models

class User(models.Model):
    first_name = models.TextField()
    last_name = models.TextField()
    wallet = models.FloatField(default=0.0)
    username = models.CharField(max_length=255, unique=True, primary_key=True)
    password = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    country = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    phone = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return self.username

class Venue(models.Model):
    location_id = models.AutoField(primary_key=True)
    name = models.TextField()
    country = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    details = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=255, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    capacity = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name

class Vehicle(models.Model):
    transportation_id = models.AutoField(primary_key=True)
    arrival_loc = models.TextField()
    departure_loc = models.TextField()
    capacity = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return f"{self.departure_loc} to {self.arrival_loc}"

class Performer(models.Model):
    performer_id = models.AutoField(primary_key=True)
    name = models.TextField()
    bio = models.TextField()

    def __str__(self):
        return self.name

class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    name = models.TextField()
    description = models.TextField()
    category = models.CharField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True)
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='owner_Username', related_name='events')
    location = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True, db_column='Location_Id')
    performers = models.ManyToManyField(Performer, through='HasPerformer')
    buses = models.ManyToManyField(Vehicle, through='HasBus')
    banner = models.ImageField(default="fallback.png", blank=True)

    def __str__(self):
        return self.name

class HasBus(models.Model):
    pk = models.CompositePrimaryKey('transportation', 'event')
    number_assigned = models.IntegerField(null=True, blank=True)
    transportation = models.ForeignKey(Vehicle, on_delete=models.RESTRICT, db_column='Transportation_Id')
    event = models.ForeignKey(Event, on_delete=models.RESTRICT, db_column='Event_Id')

class HasPerformer(models.Model):
    pk = models.CompositePrimaryKey('performer', 'event')
    performer = models.ForeignKey(Performer, on_delete=models.RESTRICT, db_column='performer_id')
    event = models.ForeignKey(Event, on_delete=models.RESTRICT, db_column='Event_Id')

class Discount(models.Model):
    pk = models.CompositePrimaryKey('event', 'discount_id')
    event = models.ForeignKey(Event, on_delete=models.RESTRICT, db_column='Event_Id')
    discount_id = models.IntegerField()
    quantity = models.IntegerField(null=True, blank=True)
    maximum_value = models.IntegerField(null=True, blank=True)
    percentage = models.IntegerField(null=True, blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)

class TicketType(models.Model):
    pk = models.CompositePrimaryKey('event', 'ticket_type_id')
    event = models.ForeignKey(Event, on_delete=models.RESTRICT, db_column='Event_Id')
    ticket_type_id = models.IntegerField()
    quantity = models.IntegerField(null=True, blank=True)
    price = models.IntegerField()
    name = models.TextField()

class Ticket(models.Model):
    pk = models.CompositePrimaryKey('event', 'ticket_type_id', 'attendee')
    event = models.ForeignKey(Event, on_delete=models.RESTRICT, db_column='Event_Id')
    ticket_type_id = models.IntegerField(db_column='Ticket_Type_Id')
    attendee = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='Attendee_Username')
    quantity = models.IntegerField()

class LostItem(models.Model):
    pk = models.CompositePrimaryKey('event', 'lost_id')
    event = models.ForeignKey(Event, on_delete=models.RESTRICT, db_column='Event_Id')
    lost_id = models.IntegerField()
    description = models.TextField()
    status = models.CharField(max_length=255, default="Still Lost")

class Message(models.Model):
    sender_type = models.CharField(max_length=255)
    content = models.TextField()
    message_date = models.DateField(null=True, blank=True)
    attendee = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='Attendee_Username', related_name='received_messages', null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='owner_Username', related_name='sent_messages', null=True, blank=True)

class Follow(models.Model):
    follow_status = models.CharField(max_length=255, null=True, blank=True)
    attendee = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='Attendee_Username', related_name='following')
    owner = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='Owner_Username', related_name='followers')

class Friend(models.Model):
    friend_status = models.CharField(max_length=255, null=True, blank=True)
    attendee = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='Attendee_Username', related_name='friend_requests_sent')
    owner = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='Owner_Username', related_name='friend_requests_received')

class Feedback(models.Model):
    pk = models.CompositePrimaryKey('feedback_id', 'attendee')
    feedback_id = models.IntegerField()
    feedback_content = models.TextField()
    feedback_rating = models.CharField(max_length=255, null=True, blank=True)
    attendee = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='Attendee_Username')
    event = models.ForeignKey(Event, on_delete=models.RESTRICT, db_column='Event_Id')

class Wishlist(models.Model):
    pk = models.CompositePrimaryKey('attendee', 'event')
    attendee = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='Attendee_Username')
    event = models.ForeignKey(Event, on_delete=models.RESTRICT, db_column='Event_Id')

class Report(models.Model):
    pk = models.CompositePrimaryKey('report_id', 'attendee')
    report_id = models.IntegerField()
    report_content = models.TextField()
    status = models.CharField(max_length=255, null=True, blank=True)
    administrator = models.ForeignKey(User, on_delete=models.SET_NULL, to_field='username', db_column='Adminstrator_Username', related_name='handled_reports', null=True, blank=True)
    attendee = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='Attendee_Username', related_name='submitted_reports')
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, to_field='username', db_column='Owner_Username', related_name='reports_against', null=True, blank=True)