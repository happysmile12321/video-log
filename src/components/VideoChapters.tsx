'use client';

interface Chapter {
  id: string;
  time: string;
  title: string;
  content: string;
}

interface VideoChaptersProps {
  chapters: Chapter[];
}

export function VideoChapters({ chapters }: VideoChaptersProps) {
  return (
    <div className="space-y-4">
      {chapters.map((chapter) => (
        <div
          key={chapter.id}
          className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors cursor-pointer"
        >
          <div className="flex items-start gap-4">
            {/* Time */}
            <div className="flex-shrink-0 w-16 text-sm text-gray-400">
              {chapter.time}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium mb-1">{chapter.title}</h3>
              <p className="text-sm text-gray-400 line-clamp-2">
                {chapter.content}
              </p>
            </div>

            {/* Play Icon */}
            <div className="flex-shrink-0 text-gray-400">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 