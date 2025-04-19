"""Module to define filters for file operations."""

from django_filters import rest_framework as filters
from .models import File


class FileFilter(filters.FilterSet):
    """Filter class for File model."""

    file_name = filters.CharFilter(field_name='name', lookup_expr='icontains')
    file_type = filters.CharFilter(field_name='file_type')
    min_size = filters.NumberFilter(field_name='size', lookup_expr='gte')
    max_size = filters.NumberFilter(field_name='size', lookup_expr='lte')
    from_date = filters.DateTimeFilter(field_name='uploaded_at', lookup_expr='gte')
    to_date = filters.DateTimeFilter(field_name='uploaded_at', lookup_expr='lte')
    
    
    class Meta:
        model = File
        fields = ["file_name", "file_type", "min_size", "max_size", "from_date", "to_date"]