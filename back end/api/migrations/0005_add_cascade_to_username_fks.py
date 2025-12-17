# migrations/XXXX_add_cascade_to_username_foreign_keys.py
# Run: python manage.py makemigrations --empty api
# Then replace the content with this:

from django.db import migrations

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_vehicle_name'),  # Replace with your last migration number
    ]

    operations = [
        # Get all foreign key constraints that reference api_user(username)
        migrations.RunSQL(
            sql="""
            -- Find all foreign key constraints on username
            DO $$
            DECLARE
                r RECORD;
            BEGIN
                -- Loop through all foreign keys referencing api_user(username)
                FOR r IN 
                    SELECT
                        tc.constraint_name,
                        tc.table_name,
                        kcu.column_name
                    FROM information_schema.table_constraints tc
                    JOIN information_schema.key_column_usage kcu 
                        ON tc.constraint_name = kcu.constraint_name
                    JOIN information_schema.constraint_column_usage ccu 
                        ON ccu.constraint_name = tc.constraint_name
                    WHERE tc.constraint_type = 'FOREIGN KEY'
                        AND ccu.table_name = 'api_user'
                        AND ccu.column_name = 'username'
                LOOP
                    -- Drop the old constraint
                    EXECUTE format('ALTER TABLE %I DROP CONSTRAINT IF EXISTS %I', 
                                   r.table_name, r.constraint_name);
                    
                    -- Add it back with CASCADE
                    EXECUTE format('ALTER TABLE %I ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES api_user(username) ON UPDATE CASCADE ON DELETE CASCADE',
                                   r.table_name, r.constraint_name, r.column_name);
                END LOOP;
            END $$;
            """,
            reverse_sql=migrations.RunSQL.noop
        ),
    ]