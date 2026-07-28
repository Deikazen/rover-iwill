import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

# Load environment variables
load_dotenv()

USER = os.getenv("user")
PASSWORD = os.getenv("password")
HOST = os.getenv("host")
PORT = os.getenv("port")
DBNAME = os.getenv("dbname")

DATABASE_URL = f"postgresql+psycopg2://{USER}:{PASSWORD}@{HOST}:{PORT}/{DBNAME}?sslmode=require"

engine = create_engine(DATABASE_URL)

def run_migration():
    print("Connecting to database to add telemetry columns...")
    
    # SQL queries to add new columns safely if they do not exist
    alter_statements = [
        "ALTER TABLE items ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'active';",
        "ALTER TABLE items ADD COLUMN IF NOT EXISTS launch_date VARCHAR;",
        "ALTER TABLE items ADD COLUMN IF NOT EXISTS landing_date VARCHAR;",
        "ALTER TABLE items ADD COLUMN IF NOT EXISTS landing_site VARCHAR;",
        "ALTER TABLE items ADD COLUMN IF NOT EXISTS weight VARCHAR;",
        "ALTER TABLE items ADD COLUMN IF NOT EXISTS dist_traveled VARCHAR;",
        "ALTER TABLE items ADD COLUMN IF NOT EXISTS power_source VARCHAR;"
    ]

    with engine.connect() as connection:
        # Start transaction
        trans = connection.begin()
        try:
            for statement in alter_statements:
                print(f"Executing: {statement}")
                connection.execute(text(statement))
            trans.commit()
            print("Migration successful! Telemetry columns added to 'items' table.")
        except Exception as e:
            trans.rollback()
            print(f"Migration failed: {e}")

if __name__ == "__main__":
    run_migration()
