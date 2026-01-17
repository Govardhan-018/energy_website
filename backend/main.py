from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from backend.model import ModelService
from backend.schemas import ForecastRequest, ForecastResponse
import pandas as pd
from datetime import datetime

app = FastAPI(title="Energy Forecasting API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model service
model_service = ModelService()

@app.on_event("startup")
async def startup_event():
    try:
        model_service.load_models()
    except Exception as e:
        print(f"Error loading models: {e}")

@app.post("/predict", response_model=ForecastResponse)
async def predict_load(request: ForecastRequest):
    try:
        # Convert date string to datetime
        target_date = datetime.strptime(request.target_date, "%Y-%m-%d")
        
        # Check if model is loaded
        if not model_service.is_loaded():
            raise HTTPException(status_code=503, detail="Models not loaded")
            
        # Run prediction
        forecast_df = model_service.predict_future_date(target_date, request.horizon_hours)
        
        # Format response
        timestamps = forecast_df.index.strftime("%Y-%m-%d %H:%M").tolist()
        loads = forecast_df['predicted_load'].tolist()
        
        return ForecastResponse(
            timestamps=timestamps,
            loads=loads,
            min_load=min(loads),
            max_load=max(loads),
            mean_load=sum(loads) / len(loads)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy", "models_loaded": model_service.is_loaded()}
