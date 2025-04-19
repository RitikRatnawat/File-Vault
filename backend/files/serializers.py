from rest_framework import serializers
from .models import File, StorageStatistics

class FileSerializer(serializers.ModelSerializer):
    """Serializer for File model"""
    
    is_duplicate = serializers.SerializerMethodField()
    original_filename = serializers.SerializerMethodField()

    class Meta:
        model = File
        fields = ['id', 'name', 'file', 'file_type', 'size', 'uploaded_at', 'is_duplicate', 'original_filename']
        read_only_fields = ['id', 'uploaded_at']
        
    
    def get_is_duplicate(self, obj):
        """Check if the file is a duplicate"""
        
        return obj.original_file is not None
    
    
    def get_original_filename(self, obj):
        """Get the original filename if the file is a duplicate"""
        
        return obj.original_file.name if obj.original_file else None
    

class StorageStatisticsSerializer(serializers.ModelSerializer):
    """Serializer for StorageStatistics model"""
    
    class Meta:
        model = StorageStatistics
        fields = ['total_files', 'unique_files', 'duplicates', 'total_size', 'actual_size', 'saved_size', 'last_updated']
        read_only_fields = ['last_updated']