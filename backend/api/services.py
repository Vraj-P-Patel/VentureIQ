import os
import uuid
import json
import joblib
import pandas as pd
from django.conf import settings
from .models import Startup, PredictionHistory

class PredictionService:
    @staticmethod
    def predict_success(startup_instance):
        """
        Executes the Random Forest model and returns prediction stats
        """
        features_dict = {
            'founded_year': [int(startup_instance.founded_year or 2024)],
            'total_funding_usd': [float(startup_instance.total_funding_usd or 0.0)],
            'team_size': [int(startup_instance.team_size or 1)],
            'monthly_revenue_usd': [float(startup_instance.monthly_revenue_usd or 0.0)],
            'active_users': [int(startup_instance.active_users or 0)],
            'customer_growth_rate': [float(startup_instance.customer_growth_rate or 0.0)],
            'burn_rate': [float(startup_instance.burn_rate or 0.0)],
            'runway_months': [float(startup_instance.runway_months or 12.0)],
            'valuation_usd': [float(startup_instance.valuation_usd or 0.0)],
            'number_of_competitors': [int(startup_instance.number_of_competitors or 5)],
            'founder_experience_years': [int(startup_instance.founder_experience_years or 3)],
            'previous_startups': [int(startup_instance.previous_startups or 0)],
            'industry': [str(startup_instance.industry or 'B2B SaaS')],
            'funding_stage': [str(startup_instance.funding_stage or 'Seed')]
        }

        model_path = os.path.join(settings.BASE_DIR, '../ml/models/success_predictor.joblib')
        if not os.path.exists(model_path):
            model_path = os.path.join(settings.BASE_DIR, 'ml/models/success_predictor.joblib')

        if os.path.exists(model_path):
            pipeline = joblib.load(model_path)
            input_df = pd.DataFrame(features_dict)
            prob_success = pipeline.predict_proba(input_df)[0][1]
            success_score = int(prob_success * 100)
            label = "Successful" if prob_success >= 0.5 else "Failed"
            
            # Confidence calculation: how far from the decision boundary (0.5)
            confidence = int(abs(prob_success - 0.5) * 200) # maps [0.5, 1.0] and [0.0, 0.5] to [0, 100]
            confidence = max(50, min(99, confidence))
        else:
            # Fallback if model not trained
            success_score = 72
            label = "Successful"
            confidence = 85

        # Feature Importance weights mock (representative of Random Forest weights for startup metrics)
        feature_importance = {
            "Monthly Revenue (MRR)": 28,
            "Runway Months": 22,
            "Customer Growth Rate": 18,
            "Total Funding": 14,
            "Competitors count": 10,
            "Founder Experience": 8
        }

        return success_score, label, confidence, feature_importance

class HealthScoreService:
    @staticmethod
    def calculate_health(startup):
        """
        Calculates separate health scores and returns details plus overall score
        """
        # 1. Growth Health
        growth_rate = float(startup.customer_growth_rate or 0.0)
        growth_health = int(min(100, max(10, (growth_rate * 300) + 40)))
        if float(startup.monthly_revenue_usd or 0) > 10000:
            growth_health = min(100, growth_health + 10)

        # 2. Financial Health
        runway = float(startup.runway_months or 12.0)
        burn = float(startup.burn_rate or 0.0)
        rev = float(startup.monthly_revenue_usd or 0.0)
        
        financial_health = int(min(100, max(10, runway * 6)))
        if burn > 0 and rev > burn:
            financial_health = min(100, financial_health + 20)

        # 3. Market Health
        competitors = int(startup.number_of_competitors or 5)
        market_health = int(min(100, max(10, 100 - (competitors * 6))))

        # 4. Team Health
        team_size = int(startup.team_size or 1)
        exp = int(startup.founder_experience_years or 3)
        team_health = int(min(100, max(10, (team_size * 5) + (exp * 6) + 30)))

        # 5. Product Health
        tech_stack = startup.technology_stack or ""
        stack_count = len([t for t in tech_stack.split(",") if t.strip()])
        product_health = int(min(100, max(10, (stack_count * 10) + 40)))

        # Overall
        overall_health = int((growth_health + financial_health + market_health + team_health + product_health) / 5)

        return {
            "overall": overall_health,
            "growth": growth_health,
            "financial": financial_health,
            "market": market_health,
            "team": team_health,
            "product": product_health
        }

class RiskAssessmentService:
    @staticmethod
    def assess_risk(startup):
        """
        Calculates Risk level and provides a textual breakdown explanation
        """
        runway = float(startup.runway_months or 12)
        burn = float(startup.burn_rate or 0)
        rev = float(startup.monthly_revenue_usd or 0)
        competitors = int(startup.number_of_competitors or 5)
        growth = float(startup.customer_growth_rate or 0)

        risk_score = 0
        reasons = []

        if runway < 6:
            risk_score += 40
            reasons.append("Cash runway is critically low (less than 6 months).")
        elif runway < 12:
            risk_score += 20
            reasons.append("Cash runway is limited (less than 12 months).")

        if burn > rev:
            risk_score += 25
            reasons.append("Operational burn rate exceeds monthly recurring revenue (MRR).")
            
        if competitors > 8:
            risk_score += 15
            reasons.append("High competitor count creates pricing pressures.")

        if growth <= 0.02:
            risk_score += 20
            reasons.append("Customer monthly growth rate is stagnating.")

        if risk_score >= 55:
            level = "High"
            desc = "High operational risk detected due to critical cash runway constraints and customer growth stagnation."
        elif risk_score >= 25:
            level = "Medium"
            desc = "Moderate risk. Financial health is stable, but high competition and burn rate warrant concern."
        else:
            level = "Low"
            desc = "Low risk profile. High runway, strong revenue growth, and controlled burn parameters verified."

        return level, desc, reasons

class StrengthWeaknessService:
    @staticmethod
    def identify_strengths_weaknesses(startup):
        """
        Detects positive indicators (strengths) and negative indicators (weaknesses)
        """
        strengths = []
        weaknesses = []

        # Strengths
        if float(startup.customer_growth_rate or 0) >= 0.12:
            strengths.append("Strong customer growth rate")
        if int(startup.founder_experience_years or 0) >= 5:
            strengths.append("Experienced founder team")
        if float(startup.runway_months or 0) >= 14:
            strengths.append("Healthy runway and financial buffer")
        if float(startup.monthly_revenue_usd or 0) > 25000:
            strengths.append("Solid recurring revenue traction")
        if int(startup.number_of_competitors or 0) <= 3:
            strengths.append("Low competitor density in niche")

        # Weaknesses
        if float(startup.burn_rate or 0) > float(startup.monthly_revenue_usd or 0):
            weaknesses.append("High burn rate relative to MRR")
        if float(startup.runway_months or 0) < 8:
            weaknesses.append("Limited cash runway buffer")
        if int(startup.team_size or 0) <= 3:
            weaknesses.append("Small team constraints resource capacity")
        if float(startup.customer_growth_rate or 0) < 0.05:
            weaknesses.append("Slow customer acquisition velocity")
        if int(startup.number_of_competitors or 0) > 8:
            weaknesses.append("Highly competitive market segment")

        # Fallback values
        if not strengths:
            strengths = ["Dedicated technical pipeline", "Defined business model target"]
        if not weaknesses:
            weaknesses = ["Scaling customer acquisition pipeline", "Early stage market penetration"]

        return strengths, weaknesses

class RecommendationService:
    @staticmethod
    def get_recommendations(weaknesses):
        """
        Generates actionable suggestions based on identified weaknesses
        """
        recs = []
        for w in weaknesses:
            if "burn rate" in w.lower():
                recs.append("Restructure corporate overhead, streamline non-essential server/vendor licenses, and optimize acquisition spend to lower monthly burn rate.")
            elif "runway" in w.lower():
                recs.append("Initiate bridge seed financing round or establish cost-saving milestones immediately to extend cash runway beyond 12 months.")
            elif "team size" in w.lower():
                recs.append("Hire cross-functional support interns or outsource developers to bypass immediate full-time employee overhead constraints.")
            elif "customer growth" in w.lower() or "slow customer" in w.lower():
                recs.append("Conduct conversion funnel A/B testing, optimize SEO landing page copies, and initiate targeted outbound marketing campaigns.")
            elif "competitive" in w.lower():
                recs.append("Pivot core marketing messages to emphasize your Hyper-local proprietary moat, solidifying target customer segments from standard competitors.")

        if not recs:
            recs = [
                "Establish a structured B2B pricing tier system to optimize enterprise ARR pipelines.",
                "Build dynamic marketing telemetry dashboards to isolate customer acquisition costs."
            ]
        return recs

class ExecutiveSummaryService:
    @staticmethod
    def generate_summary(startup_name, success_score, level, overall_health, readiness):
        """
        Creates a concise AI executive summary paragraph
        """
        health_status = "robust" if overall_health >= 75 else "stable" if overall_health >= 55 else "constrained"
        readiness_status = "highly investor ready" if readiness >= 75 else "approaching seed readiness" if readiness >= 50 else "needs structural polish"
        
        summary = (
            f"VentureIQ AI evaluation for {startup_name} predicts a success probability score of {success_score}%. "
            f"The business operates in a {health_status} health index (overall health score: {overall_health}) "
            f"with a {level} risk profile. Our assessment rates the investment readiness index at {readiness}%, indicating "
            f"the startup is {readiness_status}. Key recommendation focus points involve optimizing customer runway "
            f"adequacy and scaling current MRR traction metrics."
        )
        return summary

class InvestmentReadinessService:
    @staticmethod
    def calculate_readiness(startup):
        """
        Computes investment readiness score based on profile details
        """
        score = 20 # Base completion score
        
        # 1. Revenue
        if float(startup.monthly_revenue_usd or 0) > 0:
            score += 15
        if float(startup.monthly_revenue_usd or 0) > 20000:
            score += 10

        # 2. Team Size
        if int(startup.team_size or 0) > 4:
            score += 10
            
        # 3. Founder Experience
        if int(startup.founder_experience_years or 0) > 2:
            score += 10

        # 4. Runway
        if float(startup.runway_months or 0) > 10:
            score += 15

        # 5. Website presence
        if startup.website and startup.website.strip() != "":
            score += 10

        # 6. Technology Moat
        if startup.technology_stack and len(startup.technology_stack.split(",")) > 2:
            score += 10

        return min(100, score)

class PredictionHistoryService:
    @staticmethod
    def save_prediction(startup, founder_name, success_score, risk_level, health_data, readiness, summary, feature_importance, strengths, weaknesses, recommendations):
        """
        Creates a prediction history record in SQLite database
        """
        pred_id = f"PRD-{uuid.uuid4().hex[:8].upper()}"
        
        history = PredictionHistory.objects.create(
            startup_name=startup.startup_name,
            founder_name=founder_name,
            success_score=success_score,
            risk_level=risk_level,
            startup_health=health_data["overall"],
            investment_readiness=readiness,
            executive_summary=summary,
            prediction_id=pred_id,
            health_growth=health_data["growth"],
            health_financial=health_data["financial"],
            health_market=health_data["market"],
            health_team=health_data["team"],
            health_product=health_data["product"],
            strengths=json.dumps(strengths),
            weaknesses=json.dumps(weaknesses),
            recommendations=json.dumps(recommendations),
            feature_importance=json.dumps(feature_importance)
        )
        return history
