from django import forms
from .models import Statistic, Education, Experience, SkillCategory, Skill, Technology, Certificate, Workshop, ProjectCategory, Project, Achievement, Service, Resume, SocialLink, SiteSettings

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

class EducationForm(OptionalModelForm):
    class Meta:
        model = Education
        fields = '__all__'

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
        fields = '__all__'

class WorkshopForm(OptionalModelForm):
    class Meta:
        model = Workshop
        fields = '__all__'

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
