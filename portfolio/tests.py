from io import BytesIO
import json
import tempfile

from django.contrib.auth import get_user_model
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from django.forms import ModelForm
from django.test import TestCase, override_settings
from django.urls import reverse
from PIL import Image

from . import forms, forms_extended
from .models import Certificate, ContactMessage, Education, EducationImage, Hobby, Profile, Project, ProjectCategory, Statistic, Workshop, WorkshopImage


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

    def test_certificate_api_uses_uploaded_pdf_for_credential(self):
        user = get_user_model().objects.create_user(username='certificate-api-user', password='test-pass')
        Profile.objects.create(
            user=user,
            full_name='Certificate API Tester',
            short_name='CAT',
            professional_title='Developer',
            bio='',
            philosophy='',
            location='',
            email='certificate@example.com',
            profile_image='',
        )
        Certificate.objects.create(
            title='Python Certificate',
            issuer='Example Academy',
            description='Completed the advanced course.',
            credential_url='https://example.com/credential',
            pdf='certificates/python-certificate.pdf',
        )

        response = self.client.get('/api/portfolio/')

        self.assertEqual(response.status_code, 200)
        certificate = response.json()['certificates'][0]
        self.assertEqual(certificate['pdf'], '/media/certificates/python-certificate.pdf')
        self.assertNotIn('url', certificate)

    def test_workshop_api_returns_legacy_and_gallery_images(self):
        user = get_user_model().objects.create_user(username='workshop-api-user', password='test-pass')
        Profile.objects.create(
            user=user,
            full_name='Workshop API Tester',
            short_name='WAT',
            professional_title='Developer',
            bio='',
            philosophy='',
            location='',
            email='workshop@example.com',
            profile_image='',
        )
        workshop = Workshop.objects.create(
            title='Data Workshop',
            organizer='Example Academy',
            description='Hands-on data practice.',
            topic='Analytics',
            image='workshops/cover.jpg',
        )
        WorkshopImage.objects.create(workshop=workshop, image='workshops/gallery/photo-1.jpg')
        WorkshopImage.objects.create(workshop=workshop, image='workshops/gallery/photo-2.jpg')

        response = self.client.get('/api/portfolio/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['workshops'][0]['images'], [
            '/media/workshops/cover.jpg',
            '/media/workshops/gallery/photo-1.jpg',
            '/media/workshops/gallery/photo-2.jpg',
        ])

    def test_education_api_returns_logo_and_gallery_images(self):
        user = get_user_model().objects.create_user(username='education-api-user', password='test-pass')
        Profile.objects.create(
            user=user,
            full_name='Education API Tester',
            short_name='EAT',
            professional_title='Developer',
            bio='',
            philosophy='',
            location='',
            email='education@example.com',
            profile_image='',
        )
        education = Education.objects.create(
            institution='Example University',
            degree='Bachelor',
            field='Computer Engineering',
            percentage='90%',
            description='Academic description.',
            logo='education/logo.jpg',
            location='Pune',
            achievements='Dean list',
        )
        EducationImage.objects.create(education=education, image='education/gallery/campus.jpg')

        response = self.client.get('/api/portfolio/')

        self.assertEqual(response.status_code, 200)
        record = response.json()['education'][0]
        self.assertEqual(record['images'], [
            '/media/education/logo.jpg',
            '/media/education/gallery/campus.jpg',
        ])
        self.assertEqual(record['achievements'], 'Dean list')

    def test_portfolio_api_returns_active_hobbies(self):
        user = get_user_model().objects.create_user(username='hobby-api-user', password='test-pass')
        Profile.objects.create(
            user=user,
            full_name='Hobby API Tester',
            short_name='HAT',
            professional_title='Developer',
            bio='',
            philosophy='',
            location='',
            email='hobby@example.com',
            profile_image='',
        )
        Hobby.objects.create(name='Photography', description='Capturing everyday details.', icon='fa-camera')
        Hobby.objects.create(name='Inactive hobby', is_active=False)

        response = self.client.get('/api/portfolio/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['hobbies'], [{
            'name': 'Photography',
            'description': 'Capturing everyday details.',
            'icon': 'fa-camera',
        }])


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

    def test_dashboard_login_uses_database_credentials(self):
        user = get_user_model().objects.create_user(username='portfolio-admin', password='strong-test-password')

        response = self.client.post(
            reverse('admin_login'),
            {'username': user.username, 'password': 'strong-test-password'},
        )

        self.assertRedirects(response, reverse('dashboard'))
        self.assertTrue('_auth_user_id' in self.client.session)
        self.assertFalse(get_user_model().objects.filter(username='yash').exists())


class DashboardSmokeTests(TestCase):
    def setUp(self):
        self.user = get_user_model().objects.create_user(username='dashboard-test', password='test-password')
        self.client.force_login(self.user)

    def test_dashboard_modules_render_for_authenticated_user(self):
        route_names = (
            'dashboard', 'manage_profile', 'manage_hero_roles', 'manage_projects',
            'manage_certificates', 'manage_skills', 'manage_education', 'manage_experience',
            'manage_achievements', 'manage_services', 'manage_hobbies', 'manage_workshops', 'manage_stats',
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
            'manage_hobbies', 'manage_stats', 'manage_tech', 'manage_resume', 'manage_socials',
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

    def test_workshop_form_accepts_more_than_five_gallery_photos(self):
        image_buffer = BytesIO()
        Image.new('RGB', (1, 1)).save(image_buffer, format='PNG')
        png = image_buffer.getvalue()
        with tempfile.TemporaryDirectory() as media_dir, override_settings(MEDIA_ROOT=media_dir):
            add_url = f"{reverse('manage_workshops')}?action=add"
            form_response = self.client.get(add_url)
            self.assertEqual(form_response.status_code, 200)
            self.assertRegex(form_response.content.decode(), r'name="gallery_images"[^>]*multiple')
            uploads = [
                SimpleUploadedFile(f'workshop-{index}.png', png, content_type='image/png')
                for index in range(6)
            ]
            response = self.client.post(
                add_url,
                {
                    'title': 'Multi-photo workshop',
                    'organizer': 'Example Academy',
                    'gallery_images': uploads,
                },
            )

        self.assertRedirects(response, reverse('manage_workshops'))
        workshop = Workshop.objects.get(title='Multi-photo workshop')
        self.assertEqual(WorkshopImage.objects.filter(workshop=workshop).count(), 6)

    def test_education_form_accepts_multiple_gallery_photos(self):
        image_buffer = BytesIO()
        Image.new('RGB', (1, 1)).save(image_buffer, format='PNG')
        png = image_buffer.getvalue()
        with tempfile.TemporaryDirectory() as media_dir, override_settings(MEDIA_ROOT=media_dir):
            add_url = f"{reverse('manage_education')}?action=add"
            form_response = self.client.get(add_url)
            self.assertEqual(form_response.status_code, 200)
            self.assertRegex(form_response.content.decode(), r'name="gallery_images"[^>]*multiple')
            uploads = [
                SimpleUploadedFile(f'campus-{index}.png', png, content_type='image/png')
                for index in range(6)
            ]
            response = self.client.post(
                add_url,
                {
                    'institution': 'Multi-photo University',
                    'gallery_images': uploads,
                },
            )

        self.assertRedirects(response, reverse('manage_education'))
        education = Education.objects.get(institution='Multi-photo University')
        self.assertEqual(EducationImage.objects.filter(education=education).count(), 6)

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

    def test_dashboard_project_is_returned_by_public_portfolio_api(self):
        Profile.objects.create(
            user=self.user,
            full_name='Dashboard Tester',
            short_name='DT',
            professional_title='Developer',
            bio='',
            philosophy='',
            location='',
            email='tester@example.com',
            profile_image='',
        )

        response = self.client.post(
            f"{reverse('manage_projects')}?action=add",
            {
                'title': 'Dashboard Project',
                'short_description': 'Saved from the dashboard',
                'full_description': 'This should appear on the public site.',
                'features': '[]',
                'is_visible': 'on',
            },
        )

        self.assertRedirects(response, reverse('manage_projects'))
        public_response = self.client.get(reverse('portfolio_api'))

        self.assertEqual(public_response.status_code, 200)
        self.assertEqual(public_response.json()['projects'][0]['title'], 'Dashboard Project')


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
