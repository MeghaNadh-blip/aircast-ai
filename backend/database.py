"""
Database connection and MongoDB lifecycle manager with graceful fallbacks.
"""

import os
import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

logger = logging.getLogger("AQI-Database")

MONGODB_URI = os.getenv("MONGODB_URI", "")
DB_NAME = os.getenv("DB_NAME", "aqi_intelligence")


class MongoDBManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None

    @classmethod
    async def connect(cls):
        """Establishes MongoDB Atlas connection if URI is configured."""
        if not MONGODB_URI:
            logger.warning("MONGODB_URI not provided. Running in transient in-memory audit mode.")
            return

        try:
            cls.client = AsyncIOMotorClient(
                MONGODB_URI,
                serverSelectionTimeoutMS=5000,
                maxPoolSize=20,
                minPoolSize=5
            )
            cls.db = cls.client[DB_NAME]
            # Verify connection with ping
            await cls.client.admin.command('ping')
            logger.info(f"Connected to MongoDB Atlas: {DB_NAME}")

            # Setup indexes for prediction records
            await cls.db["prediction_history"].create_index([("timestamp", -1)])
            await cls.db["forecast_history"].create_index([("created_at", -1)])
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {e}. Operating without persistent storage.")
            cls.client = None
            cls.db = None

    @classmethod
    async def disconnect(cls):
        """Closes MongoDB connection pool."""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed.")


def get_database() -> Optional[AsyncIOMotorDatabase]:
    """Returns active database handle or None if running without database."""
    return MongoDBManager.db
