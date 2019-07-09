from django import template
from django.contrib.contenttypes.models import ContentType
from django.db.models.fields import exceptions
from ..models import ReadNum
register = template.Library()

@register.simple_tag
def get_read_num(obj):
    try:
        content_type = ContentType.objects.get_for_model(obj)
        readnum = ReadNum.objects.get(content_type=content_type, object_id=obj.pk)
        return readnum.read_num
    except exceptions.ObjectDoesNotExist:
        return 0

