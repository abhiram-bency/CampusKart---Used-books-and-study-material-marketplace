from celery import Celery
import os
from dotenv import load_dotenv
import time

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery("campuskart", broker=REDIS_URL, backend=REDIS_URL)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

@celery_app.task(name="send_order_notification")
def send_order_notification(order_id: int):
    """Simulate sending order notification email"""
    time.sleep(2)  # Simulate email sending delay
    print(f"Order notification sent for order ID: {order_id}")
    return {"status": "success", "order_id": order_id}

@celery_app.task(name="process_order")
def process_order(order_id: int):
    """Simulate order processing"""
    time.sleep(3)  # Simulate processing delay
    print(f"Order processed: {order_id}")
    return {"status": "processed", "order_id": order_id}
