from flask import Flask
from config import Config
from .db import init_app_db

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize Database
    init_app_db(app)

    from .routes import auth, main, admin, worker, driver
    app.register_blueprint(auth.bp)
    app.register_blueprint(main.bp)
    app.register_blueprint(admin.bp)
    app.register_blueprint(worker.bp)
    app.register_blueprint(driver.bp)
    # app.register_blueprint(api.bp) # API blueprint not created yet, maybe part of driver/main

    return app
