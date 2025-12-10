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
    STATUS_CHOICES = [
        ('U', 'Attendee'),
        ('OP', 'Pending organizer'),
        ('OA', 'Active organizer'),
        ('A', 'Administrator')
    ]
    status = models.CharField(max_length=2, choices=STATUS_CHOICES, default='U')

    def __str__(self):
        return self.username

class Venue(models.Model):
    location_id = models.AutoField(primary_key=True)
    name = models.TextField()
    country = models.CharField(max_length=255, null=True, blank=True)
    city = models.CharField(max_length=255, null=True, blank=True)
    details = models.TextField(null=True, blank=True)
    type = models.CharField(max_length=255, null=True, blank=True)
    available = models.BooleanField(default=True)
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
    
class Category(models.Model):
    category_id = models.AutoField(primary_key=True)
    category_name = models.CharField(max_length=63)

class Event(models.Model):
    event_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=255)
    description = models.TextField()
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=False)
    status = models.CharField(max_length=255, null=True, blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, db_column='owner_Username', related_name='events')
    location = models.ForeignKey(Venue, on_delete=models.SET_NULL, null=True, blank=True, db_column='Location_Id')
    performers = models.ManyToManyField(Performer, through='HasPerformer')
    buses = models.ManyToManyField(Vehicle, through='HasBus')
    banner = models.ImageField(default="fallback.png")

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
    discount_id = models.CharField(max_length=25)
    quantity = models.IntegerField()
    maximum_value = models.IntegerField(null=True)
    percentage = models.IntegerField()
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()

class TicketType(models.Model):
    ticket_type_id = models.AutoField(primary_key=True)
    event = models.ForeignKey(Event, on_delete=models.RESTRICT, db_column='Event_Id')
    quantity = models.IntegerField(null=True, blank=True)
    price = models.IntegerField()
    name = models.TextField()
    description = models.TextField(null=True, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=['event', 'name'], name='unique_ticket_type_per_event')]

class Ticket(models.Model):
    ticket_id = models.AutoField(primary_key=True)
    ticket_type = models.ForeignKey(TicketType, on_delete=models.RESTRICT, default=None)
    attendee = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='Attendee_Username')
    quantity = models.IntegerField()
    class Meta:
        constraints = [models.UniqueConstraint(fields=['ticket_type', 'attendee'], name='unique_ticket_per_type_per_attendee')]

class LostItem(models.Model):
    event = models.ForeignKey(Event, on_delete=models.RESTRICT, db_column='Event_Id')
    lost_id = models.AutoField(primary_key=True)
    description = models.TextField()
    STATUS_CHOICES = [
        ('L', 'Still lost'),
        ('F', 'Found')
    ]
    status = models.CharField(max_length=1,choices=STATUS_CHOICES, default="L")
    class Meta:
        constraints = [models.UniqueConstraint(fields=['event', 'lost_id'], name='unique_lost_id_per_event')]

class Message(models.Model):
    sender_type = models.CharField(max_length=255)
    content = models.TextField()
    message_date = models.DateField(null=True, blank=True)
    attendee = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='Attendee_Username', related_name='received_messages', null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.RESTRICT, to_field='username', db_column='owner_Username', related_name='sent_messages', null=True, blank=True)

class Follow(models.Model):
    STATUS_CHOICES = [
        ('P', 'Pending'),
        ('A', 'Active'),
        ('B', 'Blocked'),
    ]
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')
    attendee = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='following')
    organizer = models.ForeignKey(User, on_delete=models.RESTRICT, related_name='followers')
    class Meta:
        constraints = models.UniqueConstraint(fields=["attendee, organizer"])

class Friend(models.Model):
    STATUS_CHOICES = [
        ('P', 'Pending'),
        ('A', 'Active'),
        ('B', 'Blocked'),
    ]
    status = models.CharField(max_length=1, choices=STATUS_CHOICES, default='P')
    attendee1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend_requests_sent')
    attendee2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name='friend_requests_received')
    class Meta:
        constraints = models.UniqueConstraint(fields=["attendee, organizer"])

class Feedback(models.Model):
    feedback_id = models.AutoField(primary_key=True)
    feedback_content = models.TextField()
    feedback_rating = models.CharField(max_length=255, null=True, blank=True)
    attendee = models.ForeignKey(User, on_delete=models.SET_NULL, db_column='Attendee_Username', null=True)
    event = models.ForeignKey(Event, on_delete=models.CASCADE, db_column='Event_Id')
    class Meta:
        constraints = [models.UniqueConstraint(fields=['feedback_id', 'attendee'], name='unique_feedback_id_per_attendee')]

class Wishlist(models.Model):
    pk = models.CompositePrimaryKey('attendee', 'event')
    attendee = models.ForeignKey(User, on_delete=models.CASCADE)
    event = models.ForeignKey(Event, on_delete=models.CASCADE)

class Report(models.Model):
    report_id = models.AutoField(primary_key=True)
    report_content = models.TextField()
    STATUS_CHOICES = [
        ('R', 'Reviewed'),
        ('P', 'Pending')
    ]
    status = models.CharField(max_length=1, choices=STATUS_CHOICES)
    administrator = models.ForeignKey(User, on_delete=models.SET_NULL, db_column='Adminstrator_Username', related_name='handled_reports', null=True, blank=True)
    attendee = models.ForeignKey(User, on_delete=models.CASCADE, db_column='Attendee_Username', related_name='submitted_reports')
    owner = models.ForeignKey(User, on_delete=models.CASCADE, db_column='Owner_Username', related_name='reports_against', null=True, blank=True)
    class Meta:
        constraints = [models.UniqueConstraint(fields=['report_id', 'attendee'], name='unique_report_id_per_attendee')]