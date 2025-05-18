import { useState, useEffect } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { ScrollArea } from '@/components/ui/ScrollArea';
import Image from 'next/image';
import { 
  DocumentTextIcon, 
  ListBulletIcon, 
  DocumentDuplicateIcon,
  MapIcon,
  ChatBubbleLeftRightIcon
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
          <div className="h-full bg-gray-800 rounded-lg p-4 sm:p-6">
            <ScrollArea className="h-full">
              {/* 亮点总结 */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-3 sm:mb-4">亮点总结</h3>
                  <div className="space-y-4">
                    {highlights.map((highlight, index) => (
                      <div key={index} className="border-b border-gray-700 pb-4 last:border-0">
                        <h4 className="text-base font-medium text-white mb-2">
                          {highlight.title}
                        </h4>
                        <p className="text-gray-300 text-sm mb-2 leading-relaxed">
                          {highlight.content}
                        </p>
                        <div className="flex flex-wrap gap-1.5 sm:gap-2">
                          {highlight.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-gray-700 text-xs text-blue-400 rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 思考问题 */}
                <div>
                  <h3 className="text-lg font-medium text-white mb-3 sm:mb-4">思考</h3>
                  <ul className="space-y-2">
                    {thoughts.map((thought, index) => (
                      <li
                        key={index}
                        className="flex items-start text-sm text-gray-300 hover:text-white"
                      >
                        <span className="mr-2 sm:mr-3 mt-1">•</span>
                        <span>{thought}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </ScrollArea>
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