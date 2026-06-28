'use client';

import { useState } from 'react';
import { Play, X } from 'lucide-react';

interface VideoProps {
  title: string;
  videoId: string;
}

function VideoCard({ title, videoId, onClick }: VideoProps & { onClick: () => void }) {
  const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;

  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl border-2 border-[#71A5D9] overflow-hidden cursor-pointer transform hover:scale-105 transition duration-300 hover:shadow-xl group"
    >
      <div className="relative w-full aspect-video bg-slate-200">
        <img 
          src={thumbnail} 
          alt={title} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-[#1E4D8C]/90 rounded-full p-4">
            <Play className="w-8 h-8 text-white" />
          </div>
        </div>
      </div>
      <div className="p-5">
        <h4 className="text-lg font-black text-[#1E4D8C] line-clamp-2">{title}</h4>
      </div>
    </div>
  );
}

function Modal({ videoId, title, onClose }: { videoId: string; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl">
        <div className="bg-[#1E4D8C] px-6 py-4 flex justify-between items-center">
          <h3 className="text-white font-black text-lg">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-white hover:text-gray-300 transition text-2xl"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${videoId}`}
            title={title}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>
    </div>
  );
}

const EDUCATIONAL_VIDEOS = [
  {
    title: 'Técnica de respiración diafragmática',
    videoId: 'T96Bl1Md_Oc',
  },
  {
    title: '¿Qué hacer durante un ataque de ansiedad?',
    videoId: '34ZVrmJxEUo',
  },
  {
    title: 'Técnica de respiración 4-7-8',
    videoId: 'B5rhpspkyWw',
  },
  {
    title: '¿Qué es la atención plena?',
    videoId: 'Gq7jTUYtOz4',
  },
  {
    title: 'Beneficios de la atención plena para tu salud mental',
    videoId: 'awB9G2WZ_2w',
  },
  {
    title: 'Cómo practicar la atención plena en tu día a día',
    videoId: '64bWMVSX_ng',
  },
];

export function VideosEducativos({ onHomeClick }: { onHomeClick: () => void }) {
  const [selectedVideo, setSelectedVideo] = useState<{ videoId: string; title: string } | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-6 pt-6">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-black text-[#1E4D8C] mb-4">Videos educativos</h1>
        <p className="text-xl text-slate-700 max-w-3xl mx-auto">
          Aprende técnicas de respiración, atención plena y estrategias para regular tus emociones.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {EDUCATIONAL_VIDEOS.map((video, index) => (
          <VideoCard 
            key={index} 
            {...video} 
            onClick={() => setSelectedVideo(video)}
          />
        ))}
      </div>

      {selectedVideo && (
        <Modal 
          videoId={selectedVideo.videoId} 
          title={selectedVideo.title} 
          onClose={() => setSelectedVideo(null)} 
        />
      )}
    </div>
  );
}