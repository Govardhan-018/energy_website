import os
import joblib
import numpy as np
import pandas as pd
import lightgbm as lgb
from datetime import timedelta

class ModelService:
    def __init__(self):
        self.lgb_model = None
        self.metadata = None
        self.base_data = None
        self.model_dir = "backend/models"
        self.data_path = "backend/data/monthdata1.csv"

    def load_models(self):
        print("Loading models...")
        try:
            self.lgb_model = lgb.Booster(model_file=os.path.join(self.model_dir, 'lgb_model.txt'))
            self.metadata = joblib.load(os.path.join(self.model_dir, 'metadata.joblib'))
            
            # Load basic history for lag features
            if os.path.exists(self.data_path):
                self.base_data = pd.read_csv(self.data_path, header=None, names=['datetime', 'load'])
                self.base_data['datetime'] = pd.to_datetime(self.base_data['datetime'], format='%d/%m/%Y %H:%M')
                self.base_data = self.base_data.set_index('datetime')
            else:
                # Dummy data fallback for demo if file still missing
                dates = pd.date_range(start='2025-01-17', periods=5000, freq='5min')
                # Synthetic sine wave + noise
                t = np.linspace(0, 100, 5000)
                load = 4000 + 1000 * np.sin(t) + 500 * np.random.normal(0, 0.5, 5000)
                self.base_data = pd.DataFrame({'load': load}, index=dates)
                
            print("Models loaded successfully.")
        except Exception as e:
            print(f"Failed to load models: {e}")
            self.lgb_model = None

    def is_loaded(self):
        return self.lgb_model is not None

    def _create_features(self, df):
        # Replicate training logic
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

    def predict_future_date(self, target_date, horizon_hours=24):
        timestamps = []
        current = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = current + timedelta(hours=horizon_hours)
        
        while current < end:
            timestamps.append(current)
            current += timedelta(minutes=5)
            
        # Simplified prediction:
        # In a real scenario, we recursively predict.
        # But to be robust and fast for this demo without full history context:
        # We will generate features for the requested timestamps and predict using them.
        # This ignores the 'lag' values from previous *predicted* steps (autoregressive loop),
        # but prevents explosion and error if history is missing.
        # We'll fill lags with available history mean/random to make the model output *something*.
        
        preds = []
        
        # Mock history mean
        mean_load = self.base_data['load'].mean() if self.base_data is not None else 4000
        
        for ts in timestamps:
            row = pd.DataFrame({'load': [0]}, index=[ts])
            row = self._create_features(row)
            
            # Fill lags with mean (simplified)
            lags = [1, 2, 3, 6, 12, 24, 288]
            for lag in lags:
                row[f'lag_{lag}'] = mean_load + np.random.normal(0, 100) # Variance
                
            features = self.metadata['feature_cols']
            # Ensure all columns exist
            for col in features:
                if col not in row.columns:
                    row[col] = 0
            
            X = row[features].values
            lgb_pred = self.lgb_model.predict(X)[0]
            preds.append(max(0, lgb_pred))
            
        return pd.DataFrame({'predicted_load': preds}, index=timestamps)

