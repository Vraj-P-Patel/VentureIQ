from django.db import models

class AppUser(models.Model):
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=50) # 'founder' or 'investor'
    company = models.CharField(max_length=255) # Startup or Fund name

    def __str__(self):
        return self.name

class Startup(models.Model):
    startup_name = models.CharField(max_length=255, unique=True)
    last_updated = models.DateTimeField(auto_now=True)
    industry = models.CharField(max_length=255, blank=True, null=True)
    country = models.CharField(max_length=255, blank=True, null=True)
    founded_year = models.IntegerField(blank=True, null=True)
    startup_age = models.IntegerField(blank=True, null=True)
    funding_stage = models.CharField(max_length=100, blank=True, null=True)
    total_funding_usd = models.FloatField(blank=True, null=True)
    team_size = models.IntegerField(blank=True, null=True)
    monthly_revenue_usd = models.FloatField(blank=True, null=True)
    annual_revenue_usd = models.FloatField(blank=True, null=True)
    active_users = models.IntegerField(blank=True, null=True)
    customer_growth_rate = models.FloatField(blank=True, null=True)
    burn_rate = models.FloatField(blank=True, null=True)
    runway_months = models.FloatField(blank=True, null=True)
    valuation_usd = models.FloatField(blank=True, null=True)
    business_model = models.CharField(max_length=100, blank=True, null=True)
    number_of_competitors = models.IntegerField(blank=True, null=True)
    market_size_usd = models.FloatField(blank=True, null=True)
    market_growth_rate = models.FloatField(blank=True, null=True)
    founder_experience_years = models.IntegerField(blank=True, null=True)
    previous_startups = models.IntegerField(blank=True, null=True)
    employee_growth_rate = models.FloatField(blank=True, null=True)
    customer_retention_rate = models.FloatField(blank=True, null=True)
    profitability = models.BooleanField(default=False)
    startup_stage = models.CharField(max_length=255, blank=True, null=True)
    acquisition_status = models.CharField(max_length=100, blank=True, null=True)
    ipo_status = models.CharField(max_length=100, blank=True, null=True)
    success_label = models.CharField(max_length=100, blank=True, null=True)
    startup_description = models.TextField(blank=True, null=True)
    website = models.CharField(max_length=255, blank=True, null=True)
    logo_url = models.CharField(max_length=255, blank=True, null=True)
    headquarters_city = models.CharField(max_length=255, blank=True, null=True)
    headquarters_state = models.CharField(max_length=255, blank=True, null=True)
    headquarters_country = models.CharField(max_length=255, blank=True, null=True)
    funding_round_date = models.CharField(max_length=100, blank=True, null=True)
    top_investor = models.CharField(max_length=255, blank=True, null=True)
    competitor_1 = models.CharField(max_length=255, blank=True, null=True)
    competitor_2 = models.CharField(max_length=255, blank=True, null=True)
    competitor_3 = models.CharField(max_length=255, blank=True, null=True)
    market_trend_score = models.IntegerField(blank=True, null=True)
    innovation_score = models.IntegerField(blank=True, null=True)
    investor_interest_score = models.IntegerField(blank=True, null=True)
    technology_stack = models.CharField(max_length=500, blank=True, null=True)
    target_audience = models.CharField(max_length=500, blank=True, null=True)
    unique_selling_proposition = models.CharField(max_length=500, blank=True, null=True)
    startup_stage_description = models.CharField(max_length=500, blank=True, null=True)
    employee_count_last_year = models.IntegerField(blank=True, null=True)
    monthly_active_users_last_year = models.IntegerField(blank=True, null=True)
    customer_acquisition_cost_usd = models.FloatField(blank=True, null=True)
    lifetime_value_usd = models.FloatField(blank=True, null=True)

    def __str__(self):
        return self.startup_name

class Message(models.Model):
    sender_id = models.CharField(max_length=100)
    receiver_id = models.CharField(max_length=100)
    text = models.TextField()
    time = models.CharField(max_length=50) # e.g. '10:30 AM' or 'Yesterday'

    def __str__(self):
        return f"{self.sender_id} -> {self.receiver_id}: {self.text[:20]}"

class Task(models.Model):
    user_id = models.CharField(max_length=100)
    text = models.CharField(max_length=500)
    due = models.CharField(max_length=50)
    priority = models.CharField(max_length=50) # 'High', 'Medium', 'Low'
    done = models.BooleanField(default=False)

    def __str__(self):
        return self.text

class Meeting(models.Model):
    user_id = models.CharField(max_length=100)
    title = models.CharField(max_length=255)
    date = models.CharField(max_length=255)
    badge = models.CharField(max_length=100)
    color = models.CharField(max_length=50)

    def __str__(self):
        return self.title

class PredictionHistory(models.Model):
    startup_name = models.CharField(max_length=255)
    founder_name = models.CharField(max_length=255)
    prediction_date = models.DateTimeField(auto_now_add=True)
    success_score = models.IntegerField() # e.g. 75
    risk_level = models.CharField(max_length=50) # 'Low', 'Medium', 'High'
    startup_health = models.IntegerField() # e.g. 82
    investment_readiness = models.IntegerField() # e.g. 88
    executive_summary = models.TextField()
    model_version = models.CharField(max_length=50, default="v1.0.0")
    prediction_id = models.CharField(max_length=100, unique=True)
    
    # Detailed health scores
    health_growth = models.IntegerField(default=50)
    health_financial = models.IntegerField(default=50)
    health_market = models.IntegerField(default=50)
    health_team = models.IntegerField(default=50)
    health_product = models.IntegerField(default=50)
    
    # JSON lists
    strengths = models.TextField(default="[]") 
    weaknesses = models.TextField(default="[]")
    recommendations = models.TextField(default="[]")
    feature_importance = models.TextField(default="{}")

    def __str__(self):
        return f"{self.startup_name} - {self.prediction_date} ({self.success_score}%)"

class Investor(models.Model):
    INVESTOR_TYPE_CHOICES = [
        ('Angel Investor', 'Angel Investor'),
        ('Venture Capital', 'Venture Capital'),
        ('Corporate VC', 'Corporate VC'),
        ('Family Office', 'Family Office'),
        ('Accelerator', 'Accelerator'),
        ('Incubator', 'Incubator'),
    ]

    # Basic Info
    name = models.CharField(max_length=255)
    investment_firm = models.CharField(max_length=255)
    investor_type = models.CharField(max_length=50, choices=INVESTOR_TYPE_CHOICES)
    firm_logo = models.URLField(blank=True, null=True)
    short_description = models.TextField()
    investment_thesis = models.TextField()

    # Preferences (Stored as JSON list arrays for SQLite compatibility)
    preferred_industries = models.JSONField(default=list)  # e.g., ["B2B SaaS", "FinTech"]
    preferred_startup_stages = models.JSONField(default=list)  # e.g., ["Early Traction"]
    preferred_funding_stages = models.JSONField(default=list)  # e.g., ["Seed", "Series A"]
    preferred_business_models = models.JSONField(default=list)  # e.g., ["B2B", "SaaS"]
    preferred_locations = models.JSONField(default=list)  # e.g., ["India", "United States"]

    # Investment Details
    min_investment_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    max_investment_amount = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    typical_check_size = models.DecimalField(max_digits=15, decimal_places=2, default=0.0)
    portfolio_size = models.IntegerField(default=0)

    # Portfolio
    portfolio_companies = models.TextField(blank=True, default="")  # Comma-separated list or JSON
    successful_exits = models.IntegerField(default=0)
    total_investments = models.IntegerField(default=0)

    # Contact Information
    website = models.URLField(blank=True, null=True)
    linkedin = models.URLField(blank=True, null=True)
    contact_email = models.EmailField()
    application_url = models.URLField(blank=True, null=True)

    # Status
    verified = models.BooleanField(default=False)
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} - {self.investment_firm}"


