import hashlib
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters import rest_framework as filters
from .models import File, StorageStatistics
from .serializers import FileSerializer, StorageStatisticsSerializer
from .filters import FileFilter

# Create your views here.

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer
    filter_backends = (filters.DjangoFilterBackend,)
    filterset_class = FileFilter

    def create(self, request, *args, **kwargs):
        """View to handle file upload."""
        
        uploaded_file = request.FILES.get('file')
        
        if not uploaded_file:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        content_hash = self.__calculate_file_hash(uploaded_file)
        
        new_file = File(
            name=uploaded_file.name,
            file_type=uploaded_file.name.split('.')[-1] if '.' in uploaded_file.name else '',
            size=uploaded_file.size,
            content_hash=content_hash
        )
        
        existing_file = File.objects.filter(content_hash=content_hash, original_file__isnull=True).first()
        
        if existing_file and existing_file.original_file is None:
            new_file.file = existing_file.file
            new_file.original_file = existing_file
        else:
            new_file.file = uploaded_file
            
        # Save the new file
        new_file.save()
        
        # Update storage statistics
        StorageStatistics.update_statistics()
        
        serializer = self.get_serializer(new_file)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    
    def destroy(self, request, pk=None):
        """View to handle file deletion."""
        
        file = File.objects.filter(pk=pk)
        
        if not file:
            return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)
        
        file.delete()
        
        # Update storage statistics
        StorageStatistics.update_statistics()
        
        return Response({'message': 'File deleted successfully'}, status=status.HTTP_200_OK)
    
    
    def __calculate_file_hash(self, file):
        """Calculate the hash of the file."""
        
        sha256 = hashlib.sha256()
        
        for chunk in file.chunks():
            sha256.update(chunk)
            
        file.seek(0)  # Reset file pointer to the beginning
            
        return sha256.hexdigest()
    
    
    @action(detail=False, methods=['get'])
    def storage_statistics(self, request):
        """View to get storage statistics."""
        
        stats = StorageStatistics.objects.first()
        
        if not stats:
            return Response({'error': 'No statistics available'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = StorageStatisticsSerializer(stats)
        return Response(serializer.data, status=status.HTTP_200_OK)