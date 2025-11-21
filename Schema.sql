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
    event_id        INTEGER,
    owner_username  TEXT,
    PRIMARY KEY (event_id),
    FOREIGN KEY(owner_username) REFERENCES User(username)
);
