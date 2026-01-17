import os
import joblib
import numpy as np
import pandas as pd
import lightgbm as lgb
from prophet import Prophet
from datetime import datetime, timedelta

class ModelService:
    def __init__(self):
        self.lgb_model = None
        self.delhi_model = None
        self.metadata = None
        self.base_data = None
        self.model_dir = "backend/models"
        self.data_path = "backend/data/monthdata1.csv"

    def load_models(self):
        print("Loading models...")
        # Load LightGBM
        try:
            lgb_path = os.path.join(self.model_dir, 'lgb_model.txt')
            if os.path.exists(lgb_path):
                self.lgb_model = lgb.Booster(model_file=lgb_path)
                self.metadata = joblib.load(os.path.join(self.model_dir, 'metadata.joblib'))
                print("LightGBM model loaded.")
            else:
                print("LightGBM model file not found.")
        except Exception as e:
            print(f"Failed to load LightGBM model: {e}")

        # Load Delhi Prophet Model
        try:
            delhi_path = os.path.join(self.model_dir, 'delhi_model.joblib')
            if os.path.exists(delhi_path):
                self.delhi_model = joblib.load(delhi_path)
                print("Delhi Prophet model loaded.")
            else:
                print("Delhi model file not found.")
        except Exception as e:
            print(f"Failed to load Delhi model: {e}")

        # Load basic history for LightGBM lag features
        if os.path.exists(self.data_path):
            try:
                self.base_data = pd.read_csv(self.data_path, header=None, names=['datetime', 'load'])
                self.base_data['datetime'] = pd.to_datetime(self.base_data['datetime'], format='%d/%m/%Y %H:%M')
                self.base_data = self.base_data.set_index('datetime')
            except Exception as e:
                print(f"Error loading base data: {e}")
        
        if self.base_data is None:
            # Dummy data fallback
            dates = pd.date_range(start='2025-01-17', periods=5000, freq='5min')
            t = np.linspace(0, 100, 5000)
            load = 4000 + 1000 * np.sin(t) + 500 * np.random.normal(0, 0.5, 5000)
            self.base_data = pd.DataFrame({'load': load}, index=dates)

        print("Models loaded mechanism completed.")

    def is_loaded(self, model_type="lightgbm"):
        if model_type == "delhi":
            return self.delhi_model is not None
        return self.lgb_model is not None

    def _create_features(self, df):
        # Replicate training logic for LightGBM
        df = df.copy()
        df['hour'] = df.index.hour
        df['minute'] = df.index.minute
        df['dayofweek'] = df.index.dayofweek
        df['dayofmonth'] = df.index.day
        df['month'] = df.index.month
        df['is_weekend'] = (df.index.dayofweek >= 5).astype(int)
        df['time_slot'] = df['hour'] * 12 + df['minute'] // 5
        df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
        df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)
        df['day_sin'] = np.sin(2 * np.pi * df['dayofweek'] / 7)
        df['day_cos'] = np.cos(2 * np.pi * df['dayofweek'] / 7)
        return df

    def predict(self, start_date, end_date):
        # Calculate horizon hours based on date range
        diff = end_date - start_date
        # Add 1 day to include end date fully (up to 23:55)
        total_hours = (diff.days + 1) * 24 
        
        # Generate timestamps
        timestamps = []
        current = start_date.replace(hour=0, minute=0, second=0, microsecond=0)
        # End is the end of the end_date
        end_timestamp = end_date.replace(hour=23, minute=59, second=59)
        
        while current <= end_timestamp:
            timestamps.append(current)
            current += timedelta(minutes=5)

        # Get Prophet Predictions
        prophet_loads = []
        if self.delhi_model:
            future_df = pd.DataFrame({'ds': timestamps})
            forecast = self.delhi_model.predict(future_df)
            prophet_loads = forecast['yhat'].clip(lower=0).tolist()
        else:
            prophet_loads = [0] * len(timestamps)

        # Get LightGBM Predictions
        lgbm_loads = []
        if self.lgb_model:
            mean_load = self.base_data['load'].mean() if self.base_data is not None else 4000
            
            # Vectorized feature creation is harder with loop-based lag filling, 
            # so we stick to loop but optimize where possible. 
            # Ideally this should be vectorized.
            
            # Since we are mocking lags for future anyway:
            # Create a dataframe for all timestamps first
            df_feats = pd.DataFrame({'load': [0] * len(timestamps)}, index=timestamps)
            df_feats = self._create_features(df_feats)
            
            # Fill lags uniformly for demo
            lags = [1, 2, 3, 6, 12, 24, 288]
            for lag in lags:
                df_feats[f'lag_{lag}'] = mean_load + np.random.normal(0, 100, len(timestamps))
                
            features = self.metadata['feature_cols']
            for col in features:
                if col not in df_feats.columns:
                    df_feats[col] = 0
            
            X = df_feats[features].values
            lgbm_loads = self.lgb_model.predict(X).clip(min=0).tolist()
        else:
            lgbm_loads = [0] * len(timestamps)

        return pd.DataFrame({
            'loads_lightgbm': lgbm_loads,
            'loads_delhi': prophet_loads
        }, index=timestamps)

