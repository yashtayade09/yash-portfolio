from django.urls import path, re_path
from django.views.static import serve as static_serve
from django.conf import settings
from . import views

urlpatterns = [
    # Public site
    path('', views.home_view, name='home'),

    # Front-end assets that live at the project root
    # (index.html references /style.css, /main.js and /assets/... directly)
    re_path(r'^(?P<path>style\.css|main\.js)$', static_serve, {'document_root': settings.BASE_DIR}),
    re_path(r'^assets/(?P<path>.*)$', static_serve, {'document_root': settings.BASE_DIR / 'assets'}),

    # Auth
    path('admin-login/', views.admin_login, name='admin_login'),
    path('admin-logout/', views.admin_logout, name='admin_logout'),

    # Dashboard
    path('dashboard/', views.dashboard_home, name='dashboard'),
    path('dashboard/profile/', views.manage_profile, name='manage_profile'),
    path('dashboard/hero/', views.manage_hero_roles, name='manage_hero_roles'),
    path('dashboard/hero/delete/<int:role_id>/', views.delete_hero_role, name='delete_hero_role'),

    # Content modules
    path('dashboard/projects/', views.manage_projects, name='manage_projects'),
    path('dashboard/certificates/', views.manage_certificates, name='manage_certificates'),
    path('dashboard/skills/', views.manage_skills, name='manage_skills'),
    path('dashboard/education/', views.manage_education, name='manage_education'),
    path('dashboard/experience/', views.manage_experience, name='manage_experience'),
    path('dashboard/achievements/', views.manage_achievements, name='manage_achievements'),
    path('dashboard/services/', views.manage_services, name='manage_services'),
    path('dashboard/workshops/', views.manage_workshops, name='manage_workshops'),
    path('dashboard/stats/', views.manage_stats, name='manage_stats'),
    path('dashboard/tech/', views.manage_tech, name='manage_tech'),
    path('dashboard/resume/', views.manage_resume, name='manage_resume'),
    path('dashboard/socials/', views.manage_socials, name='manage_socials'),
    path('dashboard/settings/', views.manage_settings, name='manage_settings'),
    path('dashboard/delete/<str:model_name>/<int:item_id>/', views.delete_item, name='delete_item'),

    # Messages inbox
    path('dashboard/messages/', views.manage_messages, name='manage_messages'),
    path('dashboard/messages/<int:msg_id>/toggle/', views.toggle_message_read, name='toggle_message_read'),
    path('dashboard/messages/mark-all-read/', views.mark_all_read, name='mark_all_read'),
    path('dashboard/messages/<int:msg_id>/delete/', views.delete_message, name='delete_message'),

    # API
    path('api/portfolio/', views.portfolio_api, name='portfolio_api'),
    path('api/contact/', views.contact_api, name='contact_api'),
]
