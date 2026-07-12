from django.contrib import admin

from .models import AppUser, Startup, Message, Task, Meeting, Investor

@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'role', 'company')
    search_fields = ('name', 'email', 'company')

@admin.register(Startup)
class StartupAdmin(admin.ModelAdmin):
    list_display = ('startup_name', 'industry', 'funding_stage', 'valuation_usd', 'monthly_revenue_usd')
    search_fields = ('startup_name', 'industry', 'funding_stage')
    list_filter = ('funding_stage', 'industry')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender_id', 'receiver_id', 'text', 'time')

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('text', 'user_id', 'priority', 'done')
    list_filter = ('done', 'priority')

@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):
    list_display = ('title', 'user_id', 'date', 'badge')

@admin.register(Investor)
class InvestorAdmin(admin.ModelAdmin):
    list_display = ('name', 'investment_firm', 'investor_type', 'verified', 'active', 'typical_check_size')
    list_filter = ('investor_type', 'verified', 'active')
    search_fields = ('name', 'investment_firm')

