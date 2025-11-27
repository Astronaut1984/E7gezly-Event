CREATE TABLE User (
    First_Name    TEXT Not Null,
    Last_Name     TEXT Not Null,
    Wallet        REAL Not Null Default 0.0,
    Username      TEXT Unique,
    password      TEXT,
    Email         TEXT,
    Country       TEXT,
    City          TEXT,
    Phone         TEXT,
    Status        TEXT,
    PRIMARY KEY(Username)
);

CREATE TABLE Venue (
    name            TEXT NOT NULL,
    Country        TEXT,
    City        TEXT,
    Details        TEXT,
    Type          TEXT,
    start_date      DATE,
    end_date        DATE,
    Location_Id        INTEGER,
    Capacity        INTEGER,
    PRIMARY KEY (Location_Id)
);

CREATE TABLE Vehicle  (
    arrival_loc    TEXT NOT NULL,
    Departure_loc    TEXT NOT NULL,
    Transportation_Id        INTEGER,
    Capacity        INTEGER,
    PRIMARY KEY (Transportation_Id)
);

CREATE TABLE Event (
    name            TEXT NOT NULL,
    description     TEXT NOT NULL,
    category        TEXT,
    status          TEXT,
    start_date      DATE,
    end_date        DATE,
    Event_Id        INTEGER,
    owner_Username  TEXT,
    Location_Id        INTEGER,
    PRIMARY KEY (Event_Id),
    FOREIGN KEY(owner_Username) REFERENCES User(Username),
    FOREIGN KEY(Location_Id) REFERENCES Venue(Location_Id)
);

CREATE TABLE Has_Bus (
    Number_Assigned     INTEGER,
    Transportation_Id        INTEGER,
    Event_Id        INTEGER,
    PRIMARY KEY (Transportation_Id,Event_Id),
    FOREIGN KEY (Event_Id) REFERENCES Event(Event_Id),
    FOREIGN KEY (Transportation_Id) REFERENCES Event(Transportation_Id)

);

CREATE TABLE Performer (
    performer_id INTEGER,
    Name TEXT NOT NULL,
    Bio TEXT NOT NULL,
    PRIMARY KEY (performer_id)
)

CREATE TABLE HAS_Performer (
    performer_id INTEGER,
    Event_Id        INTEGER,
    PRIMARY KEY (performer_id, Event_Id),
    FOREIGN KEY (performer_id) REFERENCES Performer(performer_id),
    FOREIGN KEY (Event_Id) REFERENCES Event(Event_Id),
)
CREATE TABLE Discount (
    Event_Id       INTEGER        NOT NULL,
    discount_id    INTEGER        NOT NULL,
    quantity       INTEGER,
    maximum_value  INTEGER,
    percentage     INTEGER,
    start_time     TIMESTAMP      NOT NULL,
    end_time       TIMESTAMP,
    PRIMARY KEY (Event_Id, discount_id),
    FOREIGN KEY (Event_Id) REFERENCES Event(Event_Id)
);

CREATE TABLE Ticket_Type (
    Event_Id INTEGER,
    Ticket_Type_Id INTEGER,
    Quantity INTEGER,
    Price INTEGER NOT NULL,
    Name TEXT NOT NULL,
    PRIMARY KEY (Event_Id, Ticket_Type_Id),
    FOREIGN KEY (Event_Id) REFERENCES Event(Event_Id)
)

CREATE TABLE Tickets (
    Event_Id INTEGER,
    Ticket_Type_Id INTEGER,
    Attendee_Username TEXT,
    Quantity INTEGER NOT NULL,
    PRIMARY KEY (Event_Id, Ticket_Type_Id, Attendee_Username),
    FOREIGN KEY (Event_Id) REFERENCES Event(Event_Id),
    FOREIGN KEY(Attendee_Username) REFERENCES User(Username)
)

CREATE TABLE Lost_Item(
    Event_Id INTEGER,
    Lost_Id INTEGER,
    Description TEXT NOT NULL,
    Status TEXT NOT NULL Default "Still Lost",
    PRIMARY KEY (Event_Id, Lost_Id),
    FOREIGN KEY (Event_Id) REFERENCES Event(Event_Id)
)

CREATE TABLE messages (
    Sender_type     TEXT NOT NULL,
    Content         TEXT NOT NULL,
    message_date    DATE,
    Attendee_Username TEXT,
    owner_Username  TEXT,
    FOREIGN KEY(Attendee_Username) REFERENCES User(Username),
    FOREIGN KEY(owner_Username) REFERENCES User(Username)
);

CREATE TABLE Follow (
    Follow_status    TEXT,
    Attendee_Username TEXT,
    Owner_Username  TEXT,
    FOREIGN KEY(Attendee_Username) REFERENCES User(Username),
    FOREIGN KEY(Owner_Username) REFERENCES User(Username)
);

CREATE TABLE Friend (
    Friend_status       TEXT,
    Attendee_Username   TEXT,
    Owner_Username      TEXT,
    FOREIGN KEY(Attendee_Username) REFERENCES User(Username),
    FOREIGN KEY(Owner_Username) REFERENCES User(Username)
);

CREATE TABLE Feedback (
    Feedback_Id         INTEGER,
    Feedback_Content    TEXT NOT NULL,
    Feedback_Rating     TEXT,
    Attendee_Username   TEXT,
    Event_Id            INTEGER,  
    PRIMARY KEY (Feedback_Id,Attendee_Username),
    FOREIGN KEY (Event_Id) REFERENCES Event(Event_Id),
    FOREIGN KEY(Attendee_Username) REFERENCES User(Username)
);

CREATE TABLE Wishlist (
    Attendee_Username   TEXT,
    Event_Id            INTEGER,  
    PRIMARY KEY (Event_Id,Attendee_Username),
    FOREIGN KEY (Event_Id) REFERENCES Event(Event_Id),
    FOREIGN KEY(Attendee_Username) REFERENCES User(Username)
);

CREATE TABLE Report (
    Repoort_Id         INTEGER,
    Report_Content    TEXT NOT NULL,
    Status                  TEXT,
    Adminstrator_Username   TEXT,
    Attendee_Username   TEXT,
    Owner_Username      TEXT,  
    PRIMARY KEY (Report_Id,Attendee_Username),
    FOREIGN KEY(Owner_Username) REFERENCES User(Username),
    FOREIGN KEY(Adminstrator_Username) REFERENCES User(Username),
    FOREIGN KEY(Attendee_Username) REFERENCES User(Username)
);
