'use client';

import { Subtitle } from '@/services/api';
import { ScrollArea } from '@/components/ui/ScrollArea';

interface VideoSubtitlesProps {
  subtitles: Subtitle[];
  onTimeClick?: (timestamp: number) => void;
  currentTime?: number;
}

export function VideoSubtitles({ subtitles, onTimeClick, currentTime = 0 }: VideoSubtitlesProps) {
  // Helper function to check if a subtitle is currently active
  const isActive = (timestamp: number, nextTimestamp?: number) => {
    if (!nextTimestamp) {
      return currentTime >= timestamp;
    }
    return currentTime >= timestamp && currentTime < nextTimestamp;
  };

  // Get unique speakers to assign colors
  const uniqueSpeakers = Array.from(new Set(subtitles.map(s => s.speaker)));
  const speakerColors = {
    '张老师': 'bg-blue-500/20 text-blue-300 border-blue-500/50',
    '学生A': 'bg-green-500/20 text-green-300 border-green-500/50',
    '学生B': 'bg-purple-500/20 text-purple-300 border-purple-500/50',
    '学生C': 'bg-orange-500/20 text-orange-300 border-orange-500/50',
  };

  // Group subtitles by speaker
  const subtitlesBySpeaker = subtitles.reduce<Record<string, Subtitle[]>>((acc, subtitle) => {
    if (!acc[subtitle.speaker]) {
      acc[subtitle.speaker] = [];
    }
    acc[subtitle.speaker].push(subtitle);
    return acc;
  }, {});

  return (
    <ScrollArea className="h-full">
      <div className="space-y-6 p-4">
        {Object.entries(subtitlesBySpeaker).map(([speaker, speakerSubtitles]) => (
          <div key={speaker} className="space-y-2">
            {/* Speaker header */}
            <div className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm py-2">
              <span className={`inline-block px-3 py-1 rounded text-sm font-medium border ${
                speakerColors[speaker as keyof typeof speakerColors] || 'bg-gray-500/20 text-gray-300 border-gray-500/50'
              }`}>
                {speaker}
              </span>
            </div>

            {/* Subtitles for this speaker */}
            <div className="space-y-2 pl-2">
              {speakerSubtitles.map((subtitle, index) => {
                const nextSubtitle = speakerSubtitles[index + 1];
                const active = isActive(subtitle.timestamp, nextSubtitle?.timestamp);
                
                return (
                  <div
                    key={subtitle.id}
                    className={`group flex items-start gap-4 ${
                      active ? 'bg-gray-700/50' : ''
                    } rounded-lg p-2 -mx-2 hover:bg-gray-800/50 transition-colors`}
                  >
                    {/* Time button with larger click area */}
                    <button
                      onClick={() => onTimeClick?.(subtitle.timestamp)}
                      className="flex-shrink-0 min-w-[4.5rem] px-2 py-1.5 text-sm text-gray-400 
                        hover:text-white transition-colors rounded cursor-pointer 
                        hover:bg-gray-700 group-hover:bg-gray-700/50"
                    >
                      {subtitle.time}
                    </button>

                    {/* Content */}
                    <p className="flex-1 text-sm text-gray-200 leading-relaxed py-1.5">
                      {subtitle.content}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
} 