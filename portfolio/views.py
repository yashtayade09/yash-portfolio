from django.shortcuts import render, redirect, get_object_or_404, Http404
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import HttpResponse
from django.conf import settings
from django.core.mail import send_mail
from .models import (
    Profile, HeroRole, Statistic, Education, Experience, Project, ProjectCategory,
    Certificate, Workshop, Achievement, Service, Resume, SocialLink, SiteSettings,
    ContactMessage, Skill, SkillCategory, Technology,
)
from .forms import ProfileForm, HeroRoleForm, SiteSettingsForm
from .forms_extended import (
    StatisticForm, EducationForm, ExperienceForm, SkillForm, CertificateForm,
    WorkshopForm, ProjectForm, AchievementForm, ServiceForm, ResumeForm,
    SocialLinkForm, TechnologyForm,
)


def _get_public_profile(user=None):
    """Return the first populated profile record, while ignoring blank placeholder rows."""
    queryset = Profile.objects.all()
    if user is not None:
        queryset = queryset.filter(user=user)

    profile = queryset.exclude(full_name='').exclude(professional_title='').exclude(email='').order_by('id').first()
    if profile:
        return profile
    return queryset.order_by('id').first()


def home_view(request):
    """Serve the public portfolio front page."""
    index_path = settings.BASE_DIR / 'index.html'
    if not index_path.exists():
        raise Http404('Front page not found.')
    return HttpResponse(index_path.read_text(encoding='utf-8'), content_type='text/html')

def admin_login(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # Simple hardcoded logic as requested
        if username == 'yash' and password == 'tayde2906':
            # We still need a user object for @login_required to work
            from django.contrib.auth.models import User
            user, created = User.objects.get_or_create(username='yash')
            if created:
                user.set_password('tayde2906')
                user.is_staff = True
                user.is_superuser = True
                user.save()
            
            login(request, user)
            return redirect('dashboard')
        else:
            messages.error(request, "Invalid username or password.")
    
    return render(request, 'dashboard/login.html')

def admin_logout(request):
    logout(request)
    return redirect('admin_login')

@login_required
def dashboard_home(request):
    modules = [
        {'name': 'Education', 'count': Education.objects.count(), 'url': 'manage_education', 'icon': 'fa-graduation-cap'},
        {'name': 'Experience', 'count': Experience.objects.count(), 'url': 'manage_experience', 'icon': 'fa-briefcase'},
        {'name': 'Skills', 'count': Skill.objects.count(), 'url': 'manage_skills', 'icon': 'fa-code'},
        {'name': 'Projects', 'count': Project.objects.count(), 'url': 'manage_projects', 'icon': 'fa-folder-open'},
        {'name': 'Certificates', 'count': Certificate.objects.count(), 'url': 'manage_certificates', 'icon': 'fa-certificate'},
        {'name': 'Workshops', 'count': Workshop.objects.count(), 'url': 'manage_workshops', 'icon': 'fa-chalkboard-user'},
        {'name': 'Achievements', 'count': Achievement.objects.count(), 'url': 'manage_achievements', 'icon': 'fa-trophy'},
        {'name': 'Services', 'count': Service.objects.count(), 'url': 'manage_services', 'icon': 'fa-gears'},
        {'name': 'Technologies', 'count': Technology.objects.count(), 'url': 'manage_tech', 'icon': 'fa-microchip'},
        {'name': 'Statistics', 'count': Statistic.objects.count(), 'url': 'manage_stats', 'icon': 'fa-chart-simple'},
        {'name': 'Social Links', 'count': SocialLink.objects.count(), 'url': 'manage_socials', 'icon': 'fa-link'},
        {'name': 'Resume Files', 'count': Resume.objects.count(), 'url': 'manage_resume', 'icon': 'fa-file-pdf'},
    ]
    context = {
        'project_count': Project.objects.count(),
        'cert_count': Certificate.objects.count(),
        'skill_count': Skill.objects.count(),
        'msg_count': ContactMessage.objects.filter(is_read=False).count(),
        'achievement_count': Achievement.objects.count(),
        'modules': modules,
        'recent_messages': ContactMessage.objects.order_by('-created_at')[:5],
    }
    return render(request, 'dashboard/home.html', context)

@login_required
def manage_profile(request):
    profile, created = Profile.objects.get_or_create(
        user=request.user,
        defaults={
            'full_name': 'Your Name',
            'short_name': 'YN',
            'professional_title': 'Full-Stack Developer',
            'bio': 'Tell the world about your work.',
            'philosophy': 'Build useful, polished experiences.',
            'location': 'Your City',
            'email': f'{request.user.username}@example.com',
            'profile_image': '',
        },
    )
    if request.method == 'POST':
        form = ProfileForm(request.POST, request.FILES, instance=profile)
        if form.is_valid():
            form.save()
            messages.success(request, "Profile updated successfully!")
            return redirect('manage_profile')
    else:
        form = ProfileForm(instance=profile)
    
    return render(request, 'dashboard/profile.html', {'form': form, 'profile': profile})

@login_required
def manage_hero_roles(request):
    profile, created = Profile.objects.get_or_create(
        user=request.user,
        defaults={
            'full_name': 'Your Name',
            'short_name': 'YN',
            'professional_title': 'Full-Stack Developer',
            'bio': 'Tell the world about your work.',
            'philosophy': 'Build useful, polished experiences.',
            'location': 'Your City',
            'email': f'{request.user.username}@example.com',
            'profile_image': '',
        },
    )
    roles = profile.hero_roles.all()

    if request.method == 'POST':
        role_text = request.POST.get('role_text', '').strip()
        if role_text:
            HeroRole.objects.create(
                profile=profile,
                role_text=role_text,
                display_order=roles.count() + 1,
            )
            messages.success(request, "Role added successfully!")
        else:
            messages.error(request, "Role text cannot be empty.")
        return redirect('manage_hero_roles')

    return render(request, 'dashboard/hero.html', {'roles': roles, 'profile': profile})

@login_required
def delete_hero_role(request, role_id):
    role = get_object_or_404(HeroRole, id=role_id)
    role.delete()
    messages.success(request, "Role deleted successfully!")
    return redirect('manage_hero_roles')

# Generic CRUD helper to avoid repeating code for all 15+ sections
def generic_crud(request, model, form_class, url_name, model_name):
    has_order = 'display_order' in [f.name for f in model._meta.concrete_fields]

    # List view
    if request.method == 'GET' and 'action' not in request.GET:
        items = model.objects.all().order_by('display_order', 'id') if has_order else model.objects.all().order_by('-id')
        return render(request, 'dashboard/generic_list.html', {
            'items': items,
            'model_name': model_name,
            'model_key': model.__name__,
            'list_url': url_name,
            'has_order': has_order,
        })

    # Create
    if request.GET.get('action') == 'add':
        if request.method == 'POST':
            form = form_class(request.POST, request.FILES)
            if form.is_valid():
                form.save()
                messages.success(request, f"{model_name} added successfully!")
                return redirect(url_name)
            else:
                messages.error(request, "Please fix the highlighted fields below.")
        else:
            form = form_class()
        return render(request, 'dashboard/generic_form.html', {
            'form': form,
            'model_name': model_name,
            'list_url': url_name,
        })

    # Edit
    if request.GET.get('action') == 'edit':
        item_id = request.GET.get('id')
        item = get_object_or_404(model, id=item_id)
        if request.method == 'POST':
            form = form_class(request.POST, request.FILES, instance=item)
            if form.is_valid():
                form.save()
                messages.success(request, f"{model_name} updated successfully!")
                return redirect(url_name)
            else:
                messages.error(request, "Please fix the highlighted fields below.")
        else:
            form = form_class(instance=item)
        return render(request, 'dashboard/generic_form.html', {
            'form': form,
            'model_name': model_name,
            'list_url': url_name,
            'item': item,
        })

    raise Http404('Unknown action.')


# Wrapped views for each section
@login_required
def manage_projects(request): return generic_crud(request, Project, ProjectForm, 'manage_projects', 'Project')
@login_required
def manage_certificates(request): return generic_crud(request, Certificate, CertificateForm, 'manage_certificates', 'Certificate')
@login_required
def manage_skills(request): return generic_crud(request, Skill, SkillForm, 'manage_skills', 'Skill')
@login_required
def manage_education(request): return generic_crud(request, Education, EducationForm, 'manage_education', 'Education')
@login_required
def manage_experience(request): return generic_crud(request, Experience, ExperienceForm, 'manage_experience', 'Experience')
@login_required
def manage_achievements(request): return generic_crud(request, Achievement, AchievementForm, 'manage_achievements', 'Achievement')
@login_required
def manage_services(request): return generic_crud(request, Service, ServiceForm, 'manage_services', 'Service')
@login_required
def manage_workshops(request): return generic_crud(request, Workshop, WorkshopForm, 'manage_workshops', 'Workshop')
@login_required
def manage_stats(request): return generic_crud(request, Statistic, StatisticForm, 'manage_stats', 'Statistic')
@login_required
def manage_tech(request): return generic_crud(request, Technology, TechnologyForm, 'manage_tech', 'Technology')
@login_required
def manage_resume(request): return generic_crud(request, Resume, ResumeForm, 'manage_resume', 'Resume')
@login_required
def manage_socials(request): return generic_crud(request, SocialLink, SocialLinkForm, 'manage_socials', 'Social Link')
@login_required
def manage_settings(request):
    settings = SiteSettings.objects.first()
    if not settings:
        settings = SiteSettings.objects.create(site_title="My Portfolio")
    if request.method == 'POST':
        form = SiteSettingsForm(request.POST, request.FILES, instance=settings)
        if form.is_valid():
            form.save()
            messages.success(request, "Settings saved!")
            return redirect('manage_settings')
    else:
        form = SiteSettingsForm(instance=settings)
    return render(request, 'dashboard/settings.html', {'form': form})

# Map each deletable model to its management URL name
DELETE_MODEL_MAP = {
    'Project': (Project, 'manage_projects'),
    'Certificate': (Certificate, 'manage_certificates'),
    'Skill': (Skill, 'manage_skills'),
    'Education': (Education, 'manage_education'),
    'Experience': (Experience, 'manage_experience'),
    'Achievement': (Achievement, 'manage_achievements'),
    'Service': (Service, 'manage_services'),
    'Workshop': (Workshop, 'manage_workshops'),
    'Statistic': (Statistic, 'manage_stats'),
    'Technology': (Technology, 'manage_tech'),
    'Resume': (Resume, 'manage_resume'),
    'SocialLink': (SocialLink, 'manage_socials'),
}


@login_required
def delete_item(request, model_name, item_id):
    entry = DELETE_MODEL_MAP.get(model_name)
    if not entry:
        raise Http404('Unknown model.')
    model, redirect_name = entry
    item = get_object_or_404(model, id=item_id)
    item.delete()
    messages.success(request, f"{model_name} deleted successfully!")
    return redirect(redirect_name)


# ------------------------------------------------------------------
# Messages inbox
# ------------------------------------------------------------------
@login_required
def manage_messages(request):
    msg_filter = request.GET.get('filter', 'all')
    queryset = ContactMessage.objects.order_by('-created_at')
    if msg_filter == 'unread':
        queryset = queryset.filter(is_read=False)
    elif msg_filter == 'read':
        queryset = queryset.filter(is_read=True)
    else:
        msg_filter = 'all'

    return render(request, 'dashboard/messages.html', {
        'messages_list': queryset,
        'filter': msg_filter,
    })


@login_required
def toggle_message_read(request, msg_id):
    msg = get_object_or_404(ContactMessage, id=msg_id)
    msg.is_read = not msg.is_read
    msg.save(update_fields=['is_read'])
    messages.success(request, f"Message marked as {'read' if msg.is_read else 'unread'}.")
    return redirect('manage_messages')


@login_required
def mark_all_read(request):
    updated = ContactMessage.objects.filter(is_read=False).update(is_read=True)
    if updated:
        plural = 's' if updated != 1 else ''
        messages.success(request, f"{updated} message{plural} marked as read.")
    return redirect('manage_messages')


@login_required
def delete_message(request, msg_id):
    msg = get_object_or_404(ContactMessage, id=msg_id)
    msg.delete()
    messages.success(request, "Message deleted successfully!")
    return redirect('manage_messages')

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def contact_api(request):
    """
    API endpoint for the frontend contact form.
    Saves the message to the database and emails it to the configured recipient.
    """
    if request.method == 'POST':
        try:
            import json
            data = json.loads(request.body)

            name = (data.get('name') or '').strip()
            sender_email = (data.get('email') or '').strip()
            subject = (data.get('subject') or '').strip() or 'Portfolio enquiry'
            message = (data.get('message') or '').strip()

            contact = ContactMessage.objects.create(
                name=name or 'Anonymous',
                email=sender_email or 'not-provided@example.com',
                subject=subject,
                message=message or 'No message body provided.',
            )

            email_body = (
                f"Name: {name or 'Anonymous'}\n"
                f"Email: {sender_email or 'Not provided'}\n\n"
                f"Subject: {subject}\n\n"
                f"Message:\n{message or 'No message body provided.'}"
            )

            recipient = getattr(settings, 'RECIPIENT_EMAIL', settings.DEFAULT_FROM_EMAIL)
            send_mail(
                subject=f"Portfolio enquiry: {subject}",
                message=email_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient],
                fail_silently=False,
            )

            return JsonResponse({'status': 'success', 'message': 'Message sent successfully!'}, status=201)
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

    return JsonResponse({'status': 'error', 'message': 'Only POST requests allowed'}, status=405)

def _date_range(start, end, is_current):
    """Format a human-readable date range for the public API."""
    start_str = start.strftime('%b %Y') if start else ''
    if is_current:
        return f"{start_str} — Present" if start_str else 'Present'
    end_str = end.strftime('%b %Y') if end else ''
    if start_str and end_str:
        return f"{start_str} — {end_str}"
    return end_str or start_str or ''


def portfolio_api(request):
    """
    Single endpoint to provide all portfolio data to the frontend.
    This replaces the static portfolio-data.js.
    """
    profile = _get_public_profile()
    if not profile:
        return JsonResponse({'error': 'Profile not configured'}, status=404)

    active_resume = Resume.objects.filter(is_active=True).first()

    education = [
        {
            'institution': e.institution,
            'course': f"{e.degree}{f' — {e.field}' if e.field else ''}",
            'duration': _date_range(e.start_date, e.end_date, e.is_current),
            'percentage': e.percentage,
            'description': e.description,
            'logo': e.logo.url if e.logo else '',
        }
        for e in Education.objects.filter(is_visible=True)
    ]

    experience = [
        {
            'company': x.company,
            'role': x.position,
            'employmentType': x.employment_type,
            'duration': _date_range(x.start_date, x.end_date, x.is_current),
            'location': x.location,
            'outcomes': x.description,
            'responsibilities': x.responsibilities or [],
            'technologies': [],
        }
        for x in Experience.objects.filter(is_visible=True)
    ]

    skills_by_category = {}
    for s in Skill.objects.filter(is_active=True).select_related('category').order_by('display_order'):
        cat = s.category.name if s.category else 'Other'
        skills_by_category.setdefault(cat, []).append({'name': s.name, 'level': s.proficiency_percentage})

    data = {
        'personal': {
            'name': profile.full_name,
            'title': profile.professional_title,
            'shortName': profile.short_name,
            'email': profile.email,
            'bio': profile.bio,
            'philosophy': profile.philosophy,
            'location': profile.location,
            'availability': profile.availability_status,
            'currentStatus': profile.current_status or '',
            'resumeUrl': active_resume.file.url if active_resume else '',
            'profileImage': profile.profile_image.url if profile.profile_image else '',
            'altProfileImage': profile.alternate_profile_image.url if profile.alternate_profile_image else '',
        },
        'socials': {
            'links': list(SocialLink.objects.filter(is_active=True).order_by('display_order').values('platform', 'url', 'icon'))
        },
        'heroRoles': list(
            HeroRole.objects.filter(is_active=True)
            .order_by('display_order')
            .values_list('role_text', flat=True)
        ),
        'technologies': list(
            Technology.objects.filter(is_active=True)
            .order_by('display_order')
            .values_list('name', flat=True)
        ),
        'stats': {
            'projects': Project.objects.filter(is_visible=True).count(),
            'technologies': Technology.objects.filter(is_active=True).count(),
            'certificates': Certificate.objects.filter(is_visible=True).count(),
            'experienceMonths': 0,
            'custom': list(
                Statistic.objects.filter(is_active=True)
                .order_by('display_order')
                .values('label', 'value', 'suffix', 'icon', 'description')
            ),
        },
        'education': education,
        'experience': experience,
        'skills': {
            'categories': list(SkillCategory.objects.filter(is_active=True).values_list('name', flat=True)),
            'data': [{'name': s.name, 'level': s.proficiency_percentage, 'category': s.category.name if s.category else ''}
                     for s in Skill.objects.filter(is_active=True).select_related('category')],
            **skills_by_category,
        },
        'certificates': [
            {
                'title': c.title,
                'issuer': c.issuer,
                'date': c.issue_date.strftime('%b %Y') if c.issue_date else '',
                'image': c.image.url if c.image else '',
                'description': c.description,
                'url': c.credential_url or '',
            }
            for c in Certificate.objects.filter(is_visible=True)
        ],
        'workshops': list(Workshop.objects.filter(is_visible=True).values('title', 'organizer', 'date', 'description', 'topic')),
        'projects': [
            {
                'id': p.id,
                'title': p.title,
                'tagline': p.short_description,
                'status': p.status,
                'category': p.category.name if p.category else '',
                'description': p.full_description,
                'problem': p.problem or '',
                'solution': p.solution or '',
                'features': p.features or [],
                'github': p.github_url or '',
                'live': p.live_url or '',
                'images': [img.image.url for img in p.images.all()],
            }
            for p in Project.objects.filter(is_visible=True).select_related('category').prefetch_related('images')
        ],
        'achievements': list(Achievement.objects.filter(is_visible=True).values('title', 'description', 'date')),
        'services': [{'title': s.title, 'description': s.short_description, 'icon': s.icon}
                      for s in Service.objects.filter(is_active=True)],
    }
    return JsonResponse(data)
