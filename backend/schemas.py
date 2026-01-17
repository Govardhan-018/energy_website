from pydantic import BaseModel
from typing import List

class ForecastRequest(BaseModel):
    start_date: str  # YYYY-MM-DD
    end_date: str    # YYYY-MM-DD

class ForecastResponse(BaseModel):
    timestamps: List[str]
    loads_lightgbm: List[float]
    loads_delhi: List[float]
    min_load: float
    max_load: float
    mean_load: float
