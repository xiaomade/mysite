# Generated by Django 2.2.1 on 2019-05-29 08:33

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('blog', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='blog',
            old_name='last_upsated_time',
            new_name='last_updated_time',
        ),
    ]
