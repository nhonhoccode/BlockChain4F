from django import template
from django.utils.translation import gettext as _
from django.utils import translation

register = template.Library()

@register.simple_tag(takes_context=True)
def get_current_language(context):
    """Returns the current language code"""
    return translation.get_language()

@register.simple_tag
def get_language_name(lang_code):
    """Returns the language name for a language code"""
    languages = {
        'en': _('English'),
        'vi': _('Vietnamese')
    }
    return languages.get(lang_code, lang_code) 