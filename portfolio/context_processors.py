from .models import ContactMessage


def dashboard_globals(request):
    """Expose the unread message count to every dashboard template."""
    return {
        'unread_count': ContactMessage.objects.filter(is_read=False).count(),
    }
