import { useState, useEffect, useRef } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { ScrollArea } from '@/components/ui/ScrollArea';
import Image from 'next/image';
import { 
  DocumentTextIcon, 
  ListBulletIcon, 
  DocumentDuplicateIcon,
  MapIcon,
  ChatBubbleLeftRightIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { VideoSubtitles } from '@/components/VideoSubtitles';
import { Subtitle } from '@/services/api';

interface VideoContentProps {
  highlights: Array<{
    title: string;
    content: string;
    tags: string[];
  }>;
  thoughts: string[];
  transcript?: string;
  mindmap?: string;
  subtitles: Subtitle[];
  currentTime: number;
  onTimeClick: (timestamp: number) => void;
}

export function VideoContent({ 
  highlights, 
  thoughts, 
  transcript, 
  mindmap,
  subtitles,
  currentTime,
  onTimeClick
}: VideoContentProps) {
  const [activeTab, setActiveTab] = useState('subtitles');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const summaryScrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = (event: any) => {
    const scrollTop = event.target.scrollTop;
    setShowBackToTop(scrollTop > 200);
  };

  const scrollToTop = () => {
    if (summaryScrollRef.current) {
      summaryScrollRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const tabs = [
    {
      id: 'subtitles',
      label: '字幕列表',
      icon: <ChatBubbleLeftRightIcon className="w-4 h-4" />,
    },
    {
      id: 'summary',
      label: '总结摘要',
      icon: <DocumentTextIcon className="w-4 h-4" />,
    },
    {
      id: 'mindmap',
      label: '思维导图',
      icon: <MapIcon className="w-4 h-4" />,
    },
    {
      id: 'transcript',
      label: '原文稿',
      icon: <ListBulletIcon className="w-4 h-4" />,
    },
    {
      id: 'article',
      label: '文章视图',
      icon: <DocumentDuplicateIcon className="w-4 h-4" />,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 mt-2 sm:mt-4 min-h-0">
        {activeTab === 'subtitles' && (
          <div className="h-full bg-gray-800 rounded-lg">
            <VideoSubtitles
              subtitles={subtitles}
              currentTime={currentTime}
              onTimeClick={onTimeClick}
            />
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="h-full bg-gray-800 rounded-lg">
            <ScrollArea 
              className="h-full" 
              onScroll={handleScroll}
              ref={summaryScrollRef}
            >
              <div className="p-4 sm:p-6 space-y-8">
                {/* 摘要部分 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">📝 内容速览</h2>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <p className="text-gray-200 text-sm leading-relaxed">
                      {highlights[0]?.content}
                    </p>
                  </div>
                </div>

                {/* 亮点部分 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">✨ 精彩亮点</h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {highlights.map((highlight, index) => (
                      <div 
                        key={index}
                        className="bg-gray-700/50 rounded-lg p-4 space-y-2"
                      >
                        <h3 className="text-white font-medium">{highlight.title}</h3>
                        <p className="text-gray-300 text-sm">{highlight.content}</p>
                        <div className="flex flex-wrap gap-2">
                          {highlight.tags.map(tag => (
                            <span 
                              key={tag}
                              className="text-xs px-2 py-1 bg-blue-500/20 text-blue-300 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 思考启发 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">💡 思考启发</h2>
                  <div className="bg-gray-700/50 rounded-lg p-4">
                    <ul className="space-y-3">
                      {thoughts.map((thought, index) => (
                        <li 
                          key={index}
                          className="flex items-start text-gray-200"
                        >
                          <span className="mr-2 text-blue-400">•</span>
                          <span className="text-sm">{thought}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* 章节总结 */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">📚 章节内容</h2>
                  <div className="space-y-4">
                    {subtitles.reduce((acc: any[], subtitle, index, array) => {
                      // 每5条字幕总结为一个章节
                      if (index % 5 === 0) {
                        const sectionSubtitles = array.slice(index, index + 5);
                        const sectionContent = sectionSubtitles
                          .map(s => s.content)
                          .join(' ');
                        const endSubtitle = array[Math.min(index + 4, array.length - 1)];
                        
                        acc.push(
                          <div 
                            key={subtitle.id}
                            className="bg-gray-700/50 rounded-lg p-4 space-y-2"
                          >
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => onTimeClick(subtitle.timestamp)}
                                className="text-sm text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                              >
                                {subtitle.time}
                              </button>
                              <span className="text-gray-500">-</span>
                              <button
                                onClick={() => onTimeClick(endSubtitle.timestamp)}
                                className="text-sm text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                              >
                                {endSubtitle.time}
                              </button>
                            </div>
                            <p className="text-gray-300 text-sm">{sectionContent}</p>
                          </div>
                        );
                      }
                      return acc;
                    }, [])}
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* 回到顶部按钮 */}
            {showBackToTop && (
              <button
                onClick={scrollToTop}
                className="fixed bottom-6 right-6 p-2 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
              >
                <ChevronUpIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {activeTab === 'mindmap' && (
          <div className="h-full bg-gray-800 rounded-lg p-4 sm:p-6">
            <div className="h-full flex items-center justify-center bg-gray-700 rounded-lg">
              {mindmap ? (
                <div className="relative w-full h-full">
                  <Image 
                    src={mindmap} 
                    alt="思维导图" 
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
              ) : (
                <p className="text-gray-400">暂无思维导图</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transcript' && (
          <div className="h-full bg-gray-800 rounded-lg p-4 sm:p-6">
            <ScrollArea className="h-full">
              {transcript ? (
                <pre className="whitespace-pre-wrap text-gray-300 font-mono text-sm">
                  {transcript}
                </pre>
              ) : (
                <p className="text-gray-400">暂无字幕</p>
              )}
            </ScrollArea>
          </div>
        )}

        {activeTab === 'article' && (
          <div className="h-full bg-gray-800 rounded-lg p-4 sm:p-6">
            <ScrollArea className="h-full">
              <article className="prose prose-invert prose-sm sm:prose max-w-none">
                <h1 className="text-xl sm:text-2xl">{highlights[0]?.title}</h1>
                {highlights.map((highlight, index) => (
                  <section key={index} className="mb-6 sm:mb-8">
                    <h2 className="text-lg sm:text-xl">{highlight.title}</h2>
                    <p>{highlight.content}</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 not-prose mt-3 sm:mt-4">
                      {highlight.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-gray-700 text-xs text-blue-400 rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </section>
                ))}
                
                <h2 className="text-lg sm:text-xl">思考与启发</h2>
                <ul className="space-y-2">
                  {thoughts.map((thought, index) => (
                    <li key={index} className="text-sm sm:text-base">{thought}</li>
                  ))}
                </ul>
              </article>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
} 