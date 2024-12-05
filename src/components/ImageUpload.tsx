import React from 'react';
import { Image } from 'lucide-react';

interface ImageUploadProps {
  imageUrl?: string;
  onUpdate: (imageUrl?: string) => void;
}

export default function ImageUpload({ imageUrl, onUpdate }: ImageUploadProps) {
  return (
    <div>
      <button
        onClick={() => {
          const url = prompt('Enter image URL:');
          if (url) {
            onUpdate(url);
          }
        }}
        className="flex items-center space-x-1 text-gray-600 hover:text-gray-900"
      >
        <Image className="h-4 w-4" />
        <span className="text-sm">Add Image</span>
      </button>

      {imageUrl && (
        <div className="mt-4">
          <img
            src={imageUrl}
            alt="Question illustration"
            className="max-w-full h-auto rounded-md"
          />
          <button
            onClick={() => onUpdate(undefined)}
            className="mt-2 text-red-600 hover:text-red-700 text-sm"
          >
            Remove Image
          </button>
        </div>
      )}
    </div>
  );
}