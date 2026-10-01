from io import BytesIO
import json

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.forms import ModelForm
from django.test import TestCase, override_settings
from django.urls import reverse

from . import forms, forms_extended
from .models import ContactMessage, Education, Profile, Project, ProjectCategory, Statistic


class PortfolioApiTests(TestCase):
    def test_public_home_and_contact_fields_render_without_required_constraints(self):
        response = self.client.get(reverse('home'))

        self.assertEqual(response.status_code, 200)
        self.assertContains(response, 'id="contact-form"')
        for field_id in ('name', 'email', 'subject', 'message'):
            with self.subTest(field=field_id):
                self.assertNotIn(f'id="{field_id}" name="{field_id}" required', response.content.decode())

    def test_portfolio_api_prefers_populated_profile(self):
        User = get_user_model()

        blank_user = User.objects.create_user(username='blank-user', password='test-pass')
        Profile.objects.create(
            user=blank_user,
            full_name='',
            short_name='',
            professional_title='',
            bio='',
            philosophy='',
            location='',
            email='',
            profile_image=SimpleUploadedFile('blank.png', b'blank', content_type='image/png'),
        )

        filled_user = User.objects.create_user(username='filled-user', password='test-pass')
        Profile.objects.create(
            user=filled_user,
            full_name='Jane Doe',
            short_name='JD',
            professional_title='Full-Stack Developer',
            bio='Builds modern experiences.',
            philosophy='Ship with clarity.',
            location='Bengaluru, India',
            email='jane@example.com',
            profile_image=SimpleUploadedFile('filled.png', b'filled', content_type='image/png'),
        )

        response = self.client.get('/api/portfolio/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['personal']['name'], 'Jane Doe')
        self.assertEqual(response.json()['personal']['title'], 'Full-Stack Developer')


class DashboardFormsOptionalTest(TestCase):
    def test_dashboard_forms_make_all_fields_optional(self):
        for module in (forms, forms_extended):
            for form_class in vars(module).values():
                if (isinstance(form_class, type) and issubclass(form_class, ModelForm)
                        and form_class.__name__ != 'OptionalModelForm'):
                    form = form_class()
                    for field in form.fields.values():
                        self.assertFalse(field.required, f'{form_class.__name__} field {field.label} must be optional')

    def test_dashboard_redirects_unauthenticated_users_to_custom_login(self):
        response = self.client.get('/dashboard/')

        self.assertRedirects(
            response,
            '/admin-login/?next=/dashboard/',
            fetch_redirect_response=False,
        )


class DashboardSmokeTests(TestCase):
    def setUp(self):
        user = get_user_model().objects.create_user(username='dashboard-test', password='test-password')
        self.client.force_login(user)

    def test_dashboard_modules_render_for_authenticated_user(self):
        route_names = (
            'dashboard', 'manage_profile', 'manage_hero_roles', 'manage_projects',
            'manage_certificates', 'manage_skills', 'manage_education', 'manage_experience',
            'manage_achievements', 'manage_services', 'manage_workshops', 'manage_stats',
            'manage_tech', 'manage_resume', 'manage_socials', 'manage_settings',
            'manage_messages',
        )
        for route_name in route_names:
            with self.subTest(route=route_name):
                response = self.client.get(reverse(route_name))
                self.assertEqual(response.status_code, 200)

    def test_empty_generic_records_save_and_lists_render(self):
        modules = (
            'manage_projects', 'manage_certificates', 'manage_skills', 'manage_education',
            'manage_experience', 'manage_achievements', 'manage_services', 'manage_workshops',
            'manage_stats', 'manage_tech', 'manage_resume', 'manage_socials',
        )
        for route_name in modules:
            with self.subTest(route=route_name):
                add_url = f'{reverse(route_name)}?action=add'
                response = self.client.post(add_url, {})
                self.assertEqual(response.status_code, 302)
                list_response = self.client.get(reverse(route_name))
                self.assertEqual(list_response.status_code, 200)

    def test_empty_settings_update_is_accepted(self):
        response = self.client.post(reverse('manage_settings'), {})

        self.assertRedirects(response, reverse('manage_settings'))

    def test_partial_statistic_can_be_created(self):
        response = self.client.post(
            f"{reverse('manage_stats')}?action=add",
            {'label': 'Years building'},
        )

        self.assertRedirects(response, reverse('manage_stats'))
        statistic = Statistic.objects.get(label='Years building')
        self.assertEqual(statistic.value, '')

    def test_partial_education_and_project_can_be_created(self):
        education_response = self.client.post(
            f"{reverse('manage_education')}?action=add",
            {'institution': 'Example Institute'},
        )
        self.assertRedirects(education_response, reverse('manage_education'))
        education = Education.objects.get(institution='Example Institute')
        self.assertIsNone(education.start_date)
        self.assertFalse(education.logo)

        ProjectCategory.objects.create(name='Uncategorized')
        project_response = self.client.post(
            f"{reverse('manage_projects')}?action=add",
            {'title': 'Small project'},
        )
        self.assertRedirects(project_response, reverse('manage_projects'))
        project = Project.objects.get(title='Small project')
        self.assertIsNone(project.slug)
        self.assertIsNone(project.category)
        self.assertFalse(project.main_image)

    def test_profile_can_be_partially_updated(self):
        response = self.client.post(reverse('manage_profile'), {'full_name': 'Partial Profile'})

        self.assertRedirects(response, reverse('manage_profile'))
        profile = Profile.objects.get(user__username='dashboard-test')
        self.assertEqual(profile.full_name, 'Partial Profile')
        self.assertEqual(profile.email, '')


class ContactApiTests(TestCase):
    @override_settings(
        EMAIL_BACKEND='django.core.mail.backends.locmem.EmailBackend',
        RECIPIENT_EMAIL='owner@example.com',
        DEFAULT_FROM_EMAIL='site@example.com',
    )
    def test_partial_contact_submission_is_saved_and_emailed(self):
        response = self.client.post(
            reverse('contact_api'),
            data=json.dumps({'name': 'Visitor'}),
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 201)
        contact = ContactMessage.objects.get(name='Visitor')
        self.assertEqual(contact.email, 'not-provided@example.com')
        self.assertEqual(len(mail.outbox), 1)
        self.assertEqual(mail.outbox[0].to, ['owner@example.com'])

    def test_contact_api_rejects_non_post_requests_and_malformed_json(self):
        self.assertEqual(self.client.get(reverse('contact_api')).status_code, 405)
        response = self.client.post(reverse('contact_api'), data='{', content_type='application/json')
        self.assertEqual(response.status_code, 400)
        self.assertEqual(ContactMessage.objects.count(), 0)
