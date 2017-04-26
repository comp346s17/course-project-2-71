# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-04-26 18:49
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0007_auto_20170426_1325'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ouruser',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='ouruser', to=settings.AUTH_USER_MODEL),
        ),
    ]
