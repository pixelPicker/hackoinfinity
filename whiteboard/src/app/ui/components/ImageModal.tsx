import React from 'react';
import { X, Heart, Bookmark, Share2 } from 'lucide-react';

interface ImageModalProps {
  selectedImg: string | null;
  onClose: () => void;
}

export const ImageModal: React.FC<ImageModalProps> = ({ selectedImg, onClose }) => {
  if (!selectedImg) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex justify-center items-center z-50 p-4">
      <button
        className="absolute top-6 right-6 text-white cursor-pointer hover:text-gray-300 transition-colors z-10"
        onClick={onClose}
      >
        <X size={32} />
      </button>
      
      <div className="relative max-w-[90vw] max-h-[90vh] rounded-2xl overflow-hidden">
        <img
          src={selectedImg}
          alt="Full preview"
          className="max-w-full max-h-full object-contain"
        />
      </div>
      
      {/* Modal Actions */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-4">
        <button className="p-3 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-all">
          <Heart size={20} />
        </button>
        <button className="p-3 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-all">
          <Bookmark size={20} />
        </button>
        <button className="p-3 bg-white/20 rounded-xl text-white hover:bg-white/30 transition-all">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
};