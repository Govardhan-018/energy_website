from pydantic import BaseModel
from typing import List

class ForecastRequest(BaseModel):
    target_date: str  # YYYY-MM-DD
    horizon_hours: int = 24  # Default to 24 hours

class ForecastResponse(BaseModel):
    timestamps: List[str]
    loads: List[float]
    min_load: float
    max_load: float
    mean_load: float
