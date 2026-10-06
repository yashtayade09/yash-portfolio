from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    short_name = models.CharField(max_length=100)
    professional_title = models.CharField(max_length=255)
    bio = models.TextField()
    philosophy = models.TextField()
    location = models.CharField(max_length=255)
    profile_image = models.ImageField(upload_to='profile/')
    alternate_profile_image = models.ImageField(upload_to='profile/', blank=True, null=True)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True, null=True)
    availability_status = models.CharField(max_length=100, default='Available')
    current_status = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return self.full_name

class HeroRole(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='hero_roles', blank=True, null=True)
    role_text = models.CharField(max_length=100)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.role_text

class Statistic(models.Model):
    label = models.CharField(max_length=100)
    value = models.CharField(max_length=50)
    suffix = models.CharField(max_length=20, blank=True, null=True)
    icon = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"{self.label}: {self.value}"

class Education(models.Model):
    institution = models.CharField(max_length=255)
    degree = models.CharField(max_length=255)
    field = models.CharField(max_length=255)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    percentage = models.CharField(max_length=20)
    description = models.TextField()
    logo = models.ImageField(upload_to='education/', blank=True)
    location = models.CharField(max_length=255)
    achievements = models.TextField(blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"{self.degree} at {self.institution}"

class EducationImage(models.Model):
    education = models.ForeignKey(Education, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='education/gallery/')
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']

class Experience(models.Model):
    company = models.CharField(max_length=255)
    position = models.CharField(max_length=255)
    employment_type = models.CharField(max_length=100)
    location = models.CharField(max_length=255)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    description = models.TextField()
    responsibilities = models.JSONField(default=list)
    logo = models.ImageField(upload_to='experience/', blank=True)
    company_url = models.URLField(blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"{self.position} at {self.company}"

class SkillCategory(models.Model):
    name = models.CharField(max_length=100)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.name

class Skill(models.Model):
    category = models.ForeignKey(SkillCategory, on_delete=models.CASCADE, related_name='skills', blank=True, null=True)
    name = models.CharField(max_length=100)
    proficiency_percentage = models.PositiveIntegerField(default=0)
    icon = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return f"{self.name} ({self.category.name})" if self.category else self.name

class Technology(models.Model):
    name = models.CharField(max_length=100)
    logo = models.ImageField(upload_to='tech/', blank=True)
    url = models.URLField(blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.name

class Certificate(models.Model):
    title = models.CharField(max_length=255)
    issuer = models.CharField(max_length=255)
    issue_date = models.DateField(blank=True, null=True)
    credential_id = models.CharField(max_length=255, blank=True, null=True)
    credential_url = models.URLField(blank=True, null=True)
    image = models.ImageField(upload_to='certificates/', blank=True)
    pdf = models.FileField(upload_to='certificates/', blank=True, null=True)
    description = models.TextField()
    display_order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.title

class Workshop(models.Model):
    title = models.CharField(max_length=255)
    organizer = models.CharField(max_length=255)
    date = models.DateField(blank=True, null=True)
    duration = models.CharField(max_length=100)
    description = models.TextField()
    image = models.ImageField(upload_to='workshops/', blank=True, null=True)
    topic = models.CharField(max_length=255)
    url = models.URLField(blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.title

class WorkshopImage(models.Model):
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='workshops/gallery/')
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']

class ProjectCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.name

class Project(models.Model):
    category = models.ForeignKey(ProjectCategory, on_delete=models.CASCADE, related_name='projects', blank=True, null=True)
    title = models.CharField(max_length=255)
    slug = models.SlugField(unique=True, blank=True, null=True)
    short_description = models.CharField(max_length=255)
    full_description = models.TextField()
    problem = models.TextField(blank=True, null=True)
    solution = models.TextField(blank=True, null=True)
    features = models.JSONField(default=list)
    github_url = models.URLField(blank=True, null=True)
    live_url = models.URLField(blank=True, null=True)
    main_image = models.ImageField(upload_to='projects/', blank=True)
    thumbnail = models.ImageField(upload_to='projects/', blank=True, null=True)
    is_featured = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    status = models.CharField(max_length=50, default='completed')

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.title

class ProjectImage(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='images', blank=True, null=True)
    image = models.ImageField(upload_to='projects/gallery/', blank=True)
    alt_text = models.CharField(max_length=255, blank=True, null=True)

class Achievement(models.Model):
    title = models.CharField(max_length=255)
    date = models.DateField(blank=True, null=True)
    description = models.TextField()
    organization = models.CharField(max_length=255, blank=True, null=True)
    image = models.ImageField(upload_to='achievements/', blank=True, null=True)
    certificate_proof = models.FileField(upload_to='achievements/', blank=True, null=True)
    url = models.URLField(blank=True, null=True)
    icon = models.CharField(max_length=100, blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_visible = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.title

class Service(models.Model):
    title = models.CharField(max_length=255)
    short_description = models.CharField(max_length=255)
    detailed_description = models.TextField()
    icon = models.CharField(max_length=100)
    image = models.ImageField(upload_to='services/', blank=True, null=True)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.title

class Hobby(models.Model):
    name = models.CharField(max_length=120)
    description = models.CharField(max_length=255, blank=True)
    icon = models.CharField(max_length=100, blank=True, default='fa-heart')
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order', 'name']

    def __str__(self):
        return self.name

class Resume(models.Model):
    file = models.FileField(upload_to='resumes/', blank=True)
    title = models.CharField(max_length=255)
    version = models.CharField(max_length=50, blank=True, null=True)
    upload_date = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.title} - {self.version}"

class SocialLink(models.Model):
    platform = models.CharField(max_length=100)
    url = models.URLField()
    icon = models.CharField(max_length=100)
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']

    def __str__(self):
        return self.platform

class ContactMessage(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return f"Message from {self.name} - {self.subject}"

class SiteSettings(models.Model):
    site_title = models.CharField(max_length=255)
    meta_description = models.TextField()
    keywords = models.TextField()
    author = models.CharField(max_length=255)
    canonical_url = models.URLField(blank=True, null=True)
    og_title = models.CharField(max_length=255, blank=True, null=True)
    og_description = models.TextField(blank=True, null=True)
    og_image = models.ImageField(upload_to='site/', blank=True, null=True)
    twitter_title = models.CharField(max_length=255, blank=True, null=True)
    twitter_description = models.TextField(blank=True, null=True)
    twitter_image = models.ImageField(upload_to='site/', blank=True, null=True)
    favicon = models.ImageField(upload_to='site/', blank=True, null=True)
    footer_text = models.TextField()
    copyright_text = models.CharField(max_length=255, blank=True, null=True)

    class Meta:
        verbose_name_plural = "Site Settings"

    def __str__(self):
        return "Global Site Settings"
