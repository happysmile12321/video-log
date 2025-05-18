'use client';

interface VideoSummaryProps {
  summary: string;
  keyPoints: string[];
}

export function VideoSummary({ summary, keyPoints }: VideoSummaryProps) {
  return (
    <div className="space-y-8">
      {/* Main Summary */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">视频摘要</h3>
        <p className="text-gray-300 leading-relaxed">{summary}</p>
      </div>

      {/* Key Points */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">亮点</h3>
        <ul className="space-y-4">
          {keyPoints.map((point, index) => (
            <li key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">
                {index + 1}
              </div>
              <p className="flex-1 text-gray-300 leading-relaxed">{point}</p>
            </li>
          ))}
        </ul>
      </div>

      {/* Share Section */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-white mb-4">分享笔记</h3>
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-700 rounded-lg">
          <button className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            一键生成分享图
          </button>
        </div>
      </div>
    </div>
  );
} 