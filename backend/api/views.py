import json
import os
import joblib
import pandas as pd
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.forms.models import model_to_dict
from django.db.models import Q
from .models import AppUser, Startup, Message, Task, Meeting, PredictionHistory
from .services import (
    PredictionService,
    HealthScoreService,
    RiskAssessmentService,
    StrengthWeaknessService,
    RecommendationService,
    ExecutiveSummaryService,
    InvestmentReadinessService,
    PredictionHistoryService
)

@csrf_exempt
def auth_register(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        role = data.get('role')
        company = data.get('company')
    except Exception as e:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    if not email or not password or not name or not role or not company:
        return JsonResponse({'error': 'Missing required fields'}, status=400)

    if AppUser.objects.filter(email__iexact=email).exists():
        return JsonResponse({'error': 'Email address already registered'}, status=400)

    user = AppUser.objects.create(
        email=email,
        password=password,
        name=name,
        role=role,
        company=company
    )

    # Seed startup details if not in DB for founder
    if role == 'founder':
        existing = Startup.objects.filter(startup_name__iexact=company).first()
        if not existing:
            Startup.objects.create(
                startup_name=company,
                industry="B2B SaaS",
                country="India",
                founded_year=2024,
                funding_stage="Seed",
                total_funding_usd=0.0,
                team_size=1,
                monthly_revenue_usd=0.0,
                runway_months=12.0,
                valuation_usd=0.0,
                success_label="Active"
            )

    return JsonResponse({
        'message': 'Registration successful',
        'user': model_to_dict(user, exclude=['password'])
    }, status=201)

@csrf_exempt
def auth_login(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')
        role = data.get('role')
    except Exception as e:
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    if not email or not password or not role:
        return JsonResponse({'error': 'Missing required fields'}, status=400)

    user = AppUser.objects.filter(email__iexact=email, password=password, role=role).first()
    if not user:
        return JsonResponse({'error': 'Invalid email, password, or role choice.'}, status=401)

    return JsonResponse({
        'message': 'Login successful',
        'user': model_to_dict(user, exclude=['password'])
    })

def startups_list(request):
    search = request.GET.get('search')
    sector = request.GET.get('sector')
    stage = request.GET.get('stage')
    limit = int(request.GET.get('limit', 20))

    query = Q()
    if search:
        query &= Q(startup_name__icontains=search)
    if sector:
        query &= Q(industry__icontains=sector)
    if stage:
        query &= Q(funding_stage__iexact=stage)

    startups = Startup.objects.filter(query)[:limit]
    res_list = [model_to_dict(s) for s in startups]
    return JsonResponse(res_list, safe=False)

@csrf_exempt
def startup_detail(request, name):
    startup = Startup.objects.filter(startup_name__iexact=name).first()
    
    if request.method == 'GET':
        if not startup:
            return JsonResponse({'error': 'Startup not found'}, status=404)
        return JsonResponse(model_to_dict(startup))
        
    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
        except Exception as e:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)
            
        if not startup:
            # Create if doesn't exist
            startup = Startup(startup_name=name)
            
        # Update attributes dynamically
        for key, val in data.items():
            if hasattr(startup, key) and key != 'id':
                setattr(startup, key, val)
        startup.save()
        return JsonResponse({
            'message': 'Startup metrics updated successfully',
            'startup': model_to_dict(startup)
        })

@csrf_exempt
def tasks_list(request, user_id=None):
    if request.method == 'GET':
        tasks = Task.objects.filter(user_id=user_id)
        return JsonResponse([model_to_dict(t) for t in tasks], safe=False)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            u_id = data.get('userId')
            text = data.get('text')
            due = data.get('due', 'Jul 15')
            priority = data.get('priority', 'Medium')
        except Exception as e:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)
            
        if not u_id or not text:
            return JsonResponse({'error': 'Missing userId or text'}, status=400)
            
        task = Task.objects.create(
            user_id=u_id,
            text=text,
            due=due,
            priority=priority,
            done=False
        )
        return JsonResponse(model_to_dict(task), status=201)

@csrf_exempt
def task_toggle(request, task_id):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
        
    task = Task.objects.filter(id=task_id).first()
    if not task:
        return JsonResponse({'error': 'Task not found'}, status=404)
        
    task.done = not task.done
    task.save()
    return JsonResponse(model_to_dict(task))

@csrf_exempt
def messages_list(request, user_id=None):
    if request.method == 'GET':
        messages = Message.objects.filter(Q(sender_id=user_id) | Q(receiver_id=user_id))
        return JsonResponse([model_to_dict(m) for m in messages], safe=False)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            sender_id = data.get('senderId')
            receiver_id = data.get('receiverId')
            text = data.get('text')
            time = data.get('time')
        except Exception as e:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)
            
        if not sender_id or not receiver_id or not text:
            return JsonResponse({'error': 'Missing required message parameters'}, status=400)
            
        msg = Message.objects.create(
            sender_id=sender_id,
            receiver_id=receiver_id,
            text=text,
            time=time or "Just now"
        )
        return JsonResponse(model_to_dict(msg), status=201)

@csrf_exempt
def meetings_list(request, user_id=None):
    if request.method == 'GET':
        meets = Meeting.objects.filter(user_id=user_id)
        return JsonResponse([model_to_dict(m) for m in meets], safe=False)
        
    elif request.method == 'POST':
        try:
            data = json.loads(request.body)
            u_id = data.get('userId')
            title = data.get('title')
            date = data.get('date')
            badge = data.get('badge', 'Meeting')
            color = data.get('color', '#6366F1')
        except Exception as e:
            return JsonResponse({'error': 'Invalid JSON body'}, status=400)
            
        if not u_id or not title or not date:
            return JsonResponse({'error': 'Missing required fields'}, status=400)
            
        meet = Meeting.objects.create(
            user_id=u_id,
            title=title,
            date=date,
            badge=badge,
            color=color
        )
        return JsonResponse(model_to_dict(meet), status=201)

@csrf_exempt
def predict_startup_success(request, name):
    startup = Startup.objects.filter(startup_name__iexact=name).first()
    if not startup:
        startup = Startup.objects.create(startup_name=name)

    required_fields = [
        ('industry', 'Industry', 'industry'),
        ('startup_stage', 'Startup Stage', 'startup_stage'),
        ('funding_stage', 'Funding Stage', 'funding_stage'),
        ('founded_year', 'Founded Year', 'founded_year'),
        ('headquarters_city', 'Headquarters City', 'headquarters_city'),
        ('team_size', 'Team Size', 'team_size'),
        ('business_model', 'Business Model', 'business_model'),
        ('target_audience', 'Target Audience', 'target_audience'),
        ('technology_stack', 'Technology Stack', 'technology_stack'),
        ('number_of_competitors', 'Number of Competitors', 'number_of_competitors'),
        ('market_size_usd', 'Market Size', 'market_size_usd'),
        ('market_growth_rate', 'Market Growth Rate', 'market_growth_rate'),
        ('founder_experience_years', 'Founder Experience', 'founder_experience_years'),
        ('previous_startups', 'Previous Startups', 'previous_startups'),
        ('total_funding_usd', 'Total Funding', 'total_funding_usd'),
        ('monthly_revenue_usd', 'Monthly Revenue', 'monthly_revenue_usd'),
        ('burn_rate', 'Burn Rate', 'burn_rate'),
        ('runway_months', 'Runway', 'runway_months'),
        ('active_users', 'Active Users', 'active_users'),
        ('customer_growth_rate', 'Customer Growth Rate', 'customer_growth_rate'),
    ]

    # Validate checklist
    checklist = []
    is_valid = True
    for field_key, field_label, attr_name in required_fields:
        val = getattr(startup, attr_name, None)
        is_field_filled = True
        if val is None or str(val).strip() == "":
            is_field_filled = False
        
        checklist.append({
            'key': field_key,
            'label': field_label,
            'status': 'valid' if is_field_filled else 'missing'
        })
        if not is_field_filled:
            is_valid = False

    if request.method == 'GET':
        # Get latest prediction
        latest = PredictionHistory.objects.filter(startup_name__iexact=name).order_by('-prediction_date').first()
        
        has_history = latest is not None
        latest_dict = None
        is_outdated = False
        
        if latest:
            latest_dict = model_to_dict(latest)
            latest_dict['prediction_date'] = latest.prediction_date.strftime('%b %d, %Y')
            latest_dict['strengths'] = json.loads(latest.strengths)
            latest_dict['weaknesses'] = json.loads(latest.weaknesses)
            latest_dict['recommendations'] = json.loads(latest.recommendations)
            latest_dict['feature_importance'] = json.loads(latest.feature_importance)
            
            # Change detection: if profile modified after prediction
            is_outdated = startup.last_updated > latest.prediction_date

        return JsonResponse({
            'has_history': has_history,
            'latest_prediction': latest_dict,
            'checklist': checklist,
            'is_valid': is_valid,
            'is_outdated': is_outdated
        })

    elif request.method == 'POST':
        # Dynamic manual triggers
        # STRICT VALIDATION: If some required fields are missing, do not allow analysis.
        if not is_valid:
            return JsonResponse({
                'error': 'Cannot run analysis. Profile is incomplete.',
                'checklist': checklist,
                'is_valid': is_valid
            }, status=400)
            
        try:
            # Get founder name from registered AppUser
            founder_name = "Founder"
            founder_user = AppUser.objects.filter(company__iexact=name, role="founder").first()
            if founder_user:
                founder_name = founder_user.name
                
            # 1. Run ML success probability
            success_score, label, confidence, feature_importance = PredictionService.predict_success(startup)
            
            # 2. Run Health Score Service
            health_data = HealthScoreService.calculate_health(startup)
            
            # 3. Run Risk Assessment
            risk_level, risk_desc, risk_reasons = RiskAssessmentService.assess_risk(startup)
            
            # 4. Strength/Weakness Analysis
            strengths, weaknesses = StrengthWeaknessService.identify_strengths_weaknesses(startup)
            
            # 5. Recommendation engine
            recs = RecommendationService.get_recommendations(weaknesses)
            
            # 6. Investment readiness index
            readiness = InvestmentReadinessService.calculate_readiness(startup)
            
            # 7. AI Executive Summary
            summary = ExecutiveSummaryService.generate_summary(
                startup.startup_name, success_score, risk_level, health_data["overall"], readiness
            )
            
            # 8. Create historical Prediction History record
            history = PredictionHistoryService.save_prediction(
                startup=startup,
                founder_name=founder_name,
                success_score=success_score,
                risk_level=risk_level,
                health_data=health_data,
                readiness=readiness,
                summary=summary,
                feature_importance=feature_importance,
                strengths=strengths,
                weaknesses=weaknesses,
                recommendations=recs
            )
            
            # Update startup overall score parameters
            startup.investor_interest_score = success_score
            startup.success_label = label
            startup.save()
            
            # Format output dictionary for frontend consumption
            history_dict = model_to_dict(history)
            history_dict['prediction_date'] = history.prediction_date.strftime('%b %d, %Y')
            history_dict['strengths'] = strengths
            history_dict['weaknesses'] = weaknesses
            history_dict['recommendations'] = recs
            history_dict['feature_importance'] = feature_importance
            
            return JsonResponse({
                'message': 'AI analysis report generated successfully',
                'prediction': history_dict
            })
            
        except Exception as e:
            return JsonResponse({'error': f'Business analysis service error: {str(e)}'}, status=500)
