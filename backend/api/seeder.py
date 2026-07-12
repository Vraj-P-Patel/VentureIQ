import csv
import os
from .models import Startup, AppUser

def seed_database():
    if Startup.objects.exists():
        print("Database already contains startups. Skipping seeding.")
        return

    csv_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "ml", "dataset", "VentureIQ_cleaned_csv.csv"))
    if not os.path.exists(csv_path):
        print(f"CSV file not found at {csv_path}")
        return

    print("Seeding startups from CSV...")
    startups_to_create = []

    with open(csv_path, encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            def to_float(val):
                try: return float(val) if val else None
                except: return None
            def to_int(val):
                try: return int(float(val)) if val else None
                except: return None
            def to_bool(val):
                return val.lower() == 'true' if val else False

            startup = Startup(
                startup_name=row.get('startup_name', '').strip(),
                industry=row.get('industry', ''),
                country=row.get('country', ''),
                founded_year=to_int(row.get('founded_year', '')),
                startup_age=to_int(row.get('startup_age', '')),
                funding_stage=row.get('funding_stage', ''),
                total_funding_usd=to_float(row.get('total_funding_usd', '')),
                team_size=to_int(row.get('team_size', '')),
                monthly_revenue_usd=to_float(row.get('monthly_revenue_usd', '')),
                annual_revenue_usd=to_float(row.get('annual_revenue_usd', '')),
                active_users=to_int(row.get('active_users', '')),
                customer_growth_rate=to_float(row.get('customer_growth_rate', '')),
                burn_rate=to_float(row.get('burn_rate', '')),
                runway_months=to_float(row.get('runway_months', '')),
                valuation_usd=to_float(row.get('valuation_usd', '')),
                business_model=row.get('business_model', ''),
                number_of_competitors=to_int(row.get('number_of_competitors', '')),
                market_size_usd=to_float(row.get('market_size_usd', '')),
                market_growth_rate=to_float(row.get('market_growth_rate', '')),
                founder_experience_years=to_int(row.get('founder_experience_years', '')),
                previous_startups=to_int(row.get('previous_startups', '')),
                employee_growth_rate=to_float(row.get('employee_growth_rate', '')),
                customer_retention_rate=to_float(row.get('customer_retention_rate', '')),
                profitability=to_bool(row.get('profitability', '')),
                startup_stage=row.get('startup_stage', ''),
                acquisition_status=row.get('acquisition_status', ''),
                ipo_status=row.get('ipo_status', ''),
                success_label=row.get('success_label', ''),
                startup_description=row.get('startup_description', ''),
                website=row.get('website', ''),
                logo_url=row.get('logo_url', ''),
                headquarters_city=row.get('headquarters_city', ''),
                headquarters_state=row.get('headquarters_state', ''),
                headquarters_country=row.get('headquarters_country', ''),
                funding_round_date=row.get('funding_round_date', ''),
                top_investor=row.get('top_investor', ''),
                competitor_1=row.get('competitor_1', ''),
                competitor_2=row.get('competitor_2', ''),
                competitor_3=row.get('competitor_3', ''),
                market_trend_score=to_int(row.get('market_trend_score', '')),
                innovation_score=to_int(row.get('innovation_score', '')),
                investor_interest_score=to_int(row.get('investor_interest_score', '')),
                technology_stack=row.get('technology_stack', ''),
                target_audience=row.get('target_audience', ''),
                unique_selling_proposition=row.get('unique_selling_proposition', ''),
                startup_stage_description=row.get('startup_stage_description', ''),
                employee_count_last_year=to_int(row.get('employee_count_last_year', '')),
                monthly_active_users_last_year=to_int(row.get('monthly_active_users_last_year', '')),
                customer_acquisition_cost_usd=to_float(row.get('customer_acquisition_cost_usd', '')),
                lifetime_value_usd=to_float(row.get('lifetime_value_usd', ''))
            )
            startups_to_create.append(startup)

    if startups_to_create:
        Startup.objects.bulk_create(startups_to_create, ignore_conflicts=True)
        print(f"Successfully seeded {Startup.objects.count()} startups into SQLite.")

    # Seed default users
    if not AppUser.objects.exists():
        AppUser.objects.create(email="kruti@crestcom.com", password="password123!", name="Kruti Ranpariya", role="founder", company="Crestcom")
        AppUser.objects.create(email="arjun@sequoia.com", password="password123!", name="Arjun Sharma", role="investor", company="Crestcom Capital")
        print("Default users seeded.")
