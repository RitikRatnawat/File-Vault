"""Models for File Upload and Storage Statistics"""

import os
import uuid
from django.db import models
from django.utils import timezone



def file_upload_path(instance, filename):
    """Generate file path for new file upload"""
    
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('uploads', filename)


class File(models.Model):
    """Model to store uploaded files"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to=file_upload_path)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    content_hash = models.CharField(max_length=64, db_index=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    original_file = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='duplicates')
    
    class Meta:
        ordering = ['-uploaded_at']
        
    def save(self, *args, **kwargs):
        if not self.file_type:
            _, ext = os.path.splitext(self.file.name)
            self.file_type = ext.lstrip('.').lower()
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.original_file.name if self.original_file else self.name


class StorageStatistics(models.Model):
    """Model to store statistics about file storage"""
    
    total_files = models.BigIntegerField(default=0)
    unique_files = models.BigIntegerField(default=0)
    duplicates = models.BigIntegerField(default=0)
    total_size = models.BigIntegerField(default=0)
    actual_size = models.BigIntegerField(default=0)
    saved_size = models.BigIntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    @classmethod
    def update_statistics(cls):
        """Update the statistics based on current files in the database"""
        
        stats, created = cls.objects.get_or_create(id=1)
        
        stats.total_files = File.objects.count()
        stats.unique_files = File.objects.exclude(original_file__isnull=False).count()
        
        stats.duplicates = stats.total_files - stats.unique_files
        
        stats.total_size = File.objects.aggregate(total_size=models.Sum("size"))['total_size'] or 0
          
        stats.actual_size = File.objects.filter(original_file__isnull=True).aggregate(total_size=models.Sum("size"))['total_size'] or 0
        stats.saved_size = stats.total_size - stats.actual_size
        
        stats.last_updated = timezone.now()
        
        stats.save()
        
        return stats