import pandas as pd
import numpy as np
import os
import joblib
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

def train_model():
    csv_path = 'dataset/VentureIQ_cleaned_csv.csv'
    if not os.path.exists(csv_path):
        print(f"Error: dataset not found at {csv_path}")
        return
    
    print("Loading dataset...")
    df = pd.read_csv(csv_path)
    
    # Target column
    target_col = 'success_label'
    if target_col not in df.columns:
        print(f"Error: Target column {target_col} not in dataset.")
        return
    
    # Map target: 'Successful' -> 1, 'Failed' -> 0
    df['target'] = df[target_col].map({'Successful': 1, 'Failed': 0}).fillna(0).astype(int)
    
    # Define features
    num_features = [
        'founded_year', 'total_funding_usd', 'team_size', 'monthly_revenue_usd',
        'active_users', 'customer_growth_rate', 'burn_rate', 'runway_months',
        'valuation_usd', 'number_of_competitors', 'founder_experience_years',
        'previous_startups'
    ]
    cat_features = ['industry', 'funding_stage']
    
    features = num_features + cat_features
    X = df[features]
    y = df['target']
    
    # Split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print("Creating preprocessing pipeline...")
    # Preprocessor for numerical features: impute median and scale
    num_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])
    
    # Preprocessor for categorical features: impute most frequent and one-hot encode
    cat_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='most_frequent')),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])
    
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_transformer, num_features),
            ('cat', cat_transformer, cat_features)
        ])
    
    # Complete pipeline with a Random Forest model
    model_pipeline = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, max_depth=12))
    ])
    
    print("Training Random Forest model...")
    model_pipeline.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model_pipeline.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model Training Complete! Test Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save the model
    os.makedirs('models', exist_ok=True)
    model_save_path = 'models/success_predictor.joblib'
    joblib.dump(model_pipeline, model_save_path)
    print(f"Successfully saved trained model pipeline to {model_save_path}")

if __name__ == '__main__':
    train_model()
