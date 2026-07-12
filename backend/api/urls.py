from django.urls import path
from . import views

urlpatterns = [
    # Auth
    path('auth/register', views.auth_register, name='auth_register'),
    path('auth/login', views.auth_login, name='auth_login'),
    
    # Startups
    path('startups', views.startups_list, name='startups_list'),
    path('startups/<str:name>', views.startup_detail, name='startup_detail'),
    path('startups/<str:name>/predict-success', views.predict_startup_success, name='predict_startup_success'),
    
    # Tasks
    path('tasks', views.tasks_list, name='tasks_create'),
    path('tasks/<str:user_id>', views.tasks_list, name='tasks_list'),
    path('tasks/<int:task_id>/toggle', views.task_toggle, name='task_toggle'),
    
    # Messages
    path('messages', views.messages_list, name='messages_create'),
    path('messages/<str:user_id>', views.messages_list, name='messages_list'),
    
    # Calendar / Meetings
    path('meetings', views.meetings_list, name='meetings_create'),
    path('meetings/<str:user_id>', views.meetings_list, name='meetings_list'),
]
