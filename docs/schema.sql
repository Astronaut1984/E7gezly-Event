CREATE TABLE User (
    "First Name"    TEXT Not Null,
    "Last Name"     TEXT Not Null,
    "Wallet"        REAL Not Null Default 0.0,
    "Username"      TEXT Unique,
    "password"      TEXT,
    "Email"         TEXT,
    "Country"       TEXT,
    "City"          TEXT,
    "Phone"         TEXT,
    "Status"        TEXT,
    PRIMARY KEY('Username')
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
    PRIMARY KEY (event_id),
    FOREIGN KEY(owner_Username) REFERENCES User(Username)
);

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
