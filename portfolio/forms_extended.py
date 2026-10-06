from django import forms
from .models import Statistic, Education, Experience, SkillCategory, Skill, Technology, Certificate, Workshop, ProjectCategory, Project, Achievement, Service, Hobby, Resume, SocialLink, SiteSettings

class OptionalModelForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.required = False
            if isinstance(field, (forms.DateField, forms.DateTimeField, forms.TimeField)):
                field.widget = forms.TextInput(attrs={'placeholder': 'YYYY-MM-DD'})

class StatisticForm(OptionalModelForm):
    class Meta:
        model = Statistic
        fields = '__all__'

class MultipleFileInput(forms.ClearableFileInput):
    allow_multiple_selected = True

class MultipleFileField(forms.ImageField):
    widget = MultipleFileInput

    def clean(self, data, initial=None):
        if not data:
            return []
        files = data if isinstance(data, (list, tuple)) else [data]
        return [super(MultipleFileField, self).clean(file, initial) for file in files]

class EducationForm(OptionalModelForm):
    class Meta:
        model = Education
        fields = '__all__'

    gallery_images = MultipleFileField(
        label='Additional academic photos',
        help_text='Select any number of photos for the academic card slideshow.',
        required=False,
    )

    def save(self, commit=True):
        education = super().save(commit=commit)
        if commit:
            from .models import EducationImage

            for uploaded_image in self.cleaned_data.get('gallery_images', []):
                EducationImage.objects.create(education=education, image=uploaded_image)
        return education

class ExperienceForm(OptionalModelForm):
    class Meta:
        model = Experience
        fields = '__all__'

class SkillCategoryForm(OptionalModelForm):
    class Meta:
        model = SkillCategory
        fields = '__all__'

class SkillForm(OptionalModelForm):
    class Meta:
        model = Skill
        fields = '__all__'

class TechnologyForm(OptionalModelForm):
    class Meta:
        model = Technology
        fields = '__all__'

class CertificateForm(OptionalModelForm):
    class Meta:
        model = Certificate
        exclude = ('credential_url',)

class WorkshopForm(OptionalModelForm):
    gallery_images = MultipleFileField(
        label='Additional workshop photos',
        help_text='Select any number of images. New photos are added to the existing gallery.',
        required=False,
    )

    class Meta:
        model = Workshop
        fields = '__all__'

    def save(self, commit=True):
        workshop = super().save(commit=commit)
        if commit:
            from .models import WorkshopImage

            for uploaded_image in self.cleaned_data.get('gallery_images', []):
                WorkshopImage.objects.create(workshop=workshop, image=uploaded_image)
        return workshop

class ProjectCategoryForm(OptionalModelForm):
    class Meta:
        model = ProjectCategory
        fields = '__all__'

class ProjectForm(OptionalModelForm):
    class Meta:
        model = Project
        fields = '__all__'

class AchievementForm(OptionalModelForm):
    class Meta:
        model = Achievement
        fields = '__all__'

class ServiceForm(OptionalModelForm):
    class Meta:
        model = Service
        fields = '__all__'

class HobbyForm(OptionalModelForm):
    class Meta:
        model = Hobby
        fields = '__all__'

class ResumeForm(OptionalModelForm):
    class Meta:
        model = Resume
        fields = '__all__'

class SocialLinkForm(OptionalModelForm):
    class Meta:
        model = SocialLink
        fields = '__all__'

class SiteSettingsForm(OptionalModelForm):
    class Meta:
        model = SiteSettings
        fields = '__all__'
