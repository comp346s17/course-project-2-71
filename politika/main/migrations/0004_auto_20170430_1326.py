# -*- coding: utf-8 -*-
# Generated by Django 1.10.6 on 2017-04-30 18:26
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('main', '0003_auto_20170428_2323'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ouruser',
            name='first_name',
            field=models.CharField(default='Anonymous', max_length=40),
        ),
    ]