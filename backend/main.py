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
        # Convert date strings to datetime objects
        start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
        end_date = datetime.strptime(request.end_date, "%Y-%m-%d")
        
        # Validation
        if end_date < start_date:
            raise HTTPException(status_code=400, detail="End date must be after start date")
            
        if (end_date - start_date).days > 7:
             raise HTTPException(status_code=400, detail="Maximum forecast range is 7 days")

        # Check if model is loaded
        # if not model_service.is_loaded():
        #     raise HTTPException(status_code=503, detail="Models not loaded")
            
        # Run prediction
        forecast_df = model_service.predict(start_date, end_date)
        
        # Format response
        timestamps = forecast_df.index.strftime("%Y-%m-%d %H:%M").tolist()
        loads_lgb = forecast_df['loads_lightgbm'].tolist()
        loads_delhi = forecast_df['loads_delhi'].tolist()
        
        # Calculate aggregate stats
        all_loads = loads_lgb + loads_delhi
        
        return ForecastResponse(
            timestamps=timestamps,
            loads_lightgbm=loads_lgb,
            loads_delhi=loads_delhi,
            min_load=min(all_loads) if all_loads else 0,
            max_load=max(all_loads) if all_loads else 0,
            mean_load=sum(all_loads) / len(all_loads) if all_loads else 0
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health_check():
    return {"status": "healthy", "models_loaded": model_service.is_loaded()}
