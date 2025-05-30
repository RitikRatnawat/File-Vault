import React, { useState, useCallback } from 'react';
import { fileService } from '../services/fileService';
import { CloudArrowUpIcon } from '@heroicons/react/24/outline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { set } from 'lodash';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onUploadSuccess }) => {
  const [fileState, setFileState] = useState<{
    selectedFile: File | null;
    error: string | null;
    dragActive: boolean;
  }>({
    selectedFile: null,
    error: null,
    dragActive: false
  });
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: fileService.uploadFile,
    onSuccess: () => {
      // Invalidate and refetch files query
      queryClient.invalidateQueries({ queryKey: ['files'] });
      queryClient.invalidateQueries({ queryKey: ['storageStats'] });
      setFileState(prev => ({ ...prev, selectedFile: null }));
      onUploadSuccess();
    },
    onError: (error) => {
      setFileState(prev => ({ ...prev, error: 'Failed to upload file. Please try again.' }));
      console.error('Upload error:', error);
    },
  });

  // Mutation for Storage Statistics
  const { data: storageStats } = useQuery({
    queryKey: ['storageStats'],
    queryFn: fileService.getStorageStats,
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setFileState(prev => ({
        ...prev,
        selectedFile: event.target.files![0],
        error: null
      }));
    }
  };

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const isActive = e.type === 'dragenter' || e.type === 'dragover';
    
    setFileState(prev => {
      // Only update if there's an actual change to prevent unnecessary re-renders
      if (prev.dragActive !== isActive) {
        return { ...prev, dragActive: isActive };
      }
      return prev;
    });
  }, [setFileState]);

  // Handle drop event
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFileState({
        selectedFile: e.dataTransfer.files[0],
        error: null,
        dragActive: false
      });
    } else {
      setFileState(prev => ({ ...prev, dragActive: false }));
    }
  }, [setFileState]);

  const handleUpload = async () => {
    if (!fileState.selectedFile) {
      setFileState(prev => ({ ...prev, error: 'Please select a file' }));
      return;
    }

    const formData = new FormData();
    formData.append('file', fileState.selectedFile);

    try {
      setFileState(prev => ({ ...prev, error: null }));
      await uploadMutation.mutateAsync(formData);
    } catch (err) {
      // Error handling is done in onError callback
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <CloudArrowUpIcon className="h-6 w-6 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Upload File</h2>
      </div>
      <div className="mt-4 space-y-4">
        <div className={`flex justify-center px-6 pt-5 pb-6 border-2 rounded-lg ${fileState.dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 border-dashed'}`}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}>
          <div className="space-y-1 text-center">
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="file-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
              >
                <span>Upload a file</span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  onChange={handleFileSelect}
                  disabled={uploadMutation.isPending}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">Any file up to 10MB</p>
          </div>
        </div>
        {fileState.selectedFile && (
          <div className="text-sm text-gray-600">
            Selected: {fileState.selectedFile.name}
          </div>
        )}
        {fileState.error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            {fileState.error}
          </div>
        )}
        <button
          onClick={handleUpload}
          disabled={!fileState.selectedFile || uploadMutation.isPending}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${!fileState.selectedFile || uploadMutation.isPending
            ? 'bg-gray-300 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
            }`}
        >
          {uploadMutation.isPending ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Uploading...
            </>
          ) : (
            'Upload'
          )}
        </button>
      </div>
    </div>
  );
}; 