# Generated by Django 4.2.20 on 2025-04-19 19:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('files', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='storagestatistics',
            name='actual_size',
            field=models.BigIntegerField(default=0),
        ),
    ]
