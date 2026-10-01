from django import template

register = template.Library()


@register.filter
def widget_type(field):
    """Return the lowercased widget class name (e.g. 'checkboxinput', 'textarea')."""
    try:
        return field.field.widget.__class__.__name__.lower()
    except AttributeError:
        return ''
