from biodiversity.app import db, engine
import os

# db.drop_all()
db.create_all(engine)
