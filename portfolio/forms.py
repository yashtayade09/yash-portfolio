from django import forms
from .models import Profile, HeroRole, SiteSettings

class OptionalModelForm(forms.ModelForm):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        for field in self.fields.values():
            field.required = False
            if isinstance(field, (forms.DateField, forms.DateTimeField, forms.TimeField)):
                field.widget = forms.TextInput(attrs={'placeholder': 'YYYY-MM-DD'})

class ProfileForm(OptionalModelForm):
    class Meta:
        model = Profile
        exclude = ('user',)
        widgets = {
            'bio': forms.Textarea(attrs={'rows': 4, 'class': 'form-input'}),
            'philosophy': forms.Textarea(attrs={'rows': 4, 'class': 'form-input'}),
        }

class HeroRoleForm(OptionalModelForm):
    class Meta:
        model = HeroRole
        fields = '__all__'

class SiteSettingsForm(OptionalModelForm):
    class Meta:
        model = SiteSettings
        fields = '__all__'
