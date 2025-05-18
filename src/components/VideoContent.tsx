import { useState, useRef } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { 
  DocumentTextIcon, 
  DocumentDuplicateIcon,
  MapIcon,
  ChatBubbleLeftRightIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';
import { VideoSubtitles } from '@/components/VideoSubtitles';
import { MindMap } from '@/components/MindMap';
import { Subtitle } from '@/services/api';
import { Node, Edge } from 'reactflow';

interface VideoContentProps {
  highlights: Array<{
    title: string;
    content: string;
    tags: string[];
  }>;
  thoughts: string[];
  subtitles: Subtitle[];
  currentTime: number;
  onTimeClick: (timestamp: number) => void;
}

export function VideoContent({ 
  highlights, 
  thoughts, 
  subtitles,
  currentTime,
  onTimeClick
}: VideoContentProps) {
  const [activeTab, setActiveTab] = useState('subtitles');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const summaryScrollRef = useRef<HTMLDivElement>(null);

  // Helper function to merge subtitles into paragraphs
  const getMergedSubtitles = () => {
    const paragraphs: Array<{
      startTime: number;
      time: string;
      content: string[];
      speaker: string;
    }> = [];
    
    let currentParagraph: typeof paragraphs[0] | null = null;
    
    subtitles.forEach((subtitle, index) => {
      // Start a new paragraph if:
      // 1. No current paragraph
      // 2. Different speaker
      // 3. Time gap > 10 seconds
      // 4. Every 5 subtitles (to avoid too long paragraphs)
      const shouldStartNewParagraph = !currentParagraph ||
        currentParagraph.speaker !== subtitle.speaker ||
        subtitle.timestamp - (subtitles[index - 1]?.timestamp || 0) > 10 ||
        currentParagraph.content.length >= 5;
      
      if (shouldStartNewParagraph) {
        currentParagraph = {
          startTime: subtitle.timestamp,
          time: subtitle.time,
          content: [subtitle.content],
          speaker: subtitle.speaker
        };
        paragraphs.push(currentParagraph);
      } else {
        (currentParagraph as typeof paragraphs[0]).content.push(subtitle.content);
      }
    });
    
    return paragraphs;
  };

  const handleScroll = (event: React.UIEvent<HTMLElement>) => {
    const scrollTop = event.currentTarget.scrollTop;
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
      id: 'article',
      label: '文章视图',
      icon: <DocumentDuplicateIcon className="w-4 h-4" />,
    },
  ];

  // Generate mindmap data from highlights and thoughts
  const mindmapData = {
    nodes: [
      {
        id: 'root',
        type: 'default',
        data: { label: '程序员职业发展' },
        position: { x: 0, y: 0 },
        style: {
          background: '#1F2937',
          color: '#fff',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '8px 16px',
          fontSize: '14px',
          fontWeight: 'bold',
          width: 140,
          textAlign: 'center',
        },
      },
      // 主要主题节点
      ...highlights.map((highlight, index) => ({
        id: `highlight-${index}`,
        type: 'default',
        data: { label: highlight.title },
        position: { 
          x: Math.cos((2 * Math.PI * index) / highlights.length) * 200,
          y: Math.sin((2 * Math.PI * index) / highlights.length) * 200
        },
        style: {
          background: '#374151',
          color: '#fff',
          border: '1px solid #4B5563',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '13px',
          width: 130,
          textAlign: 'center',
        },
      })),
      // 标签节点
      ...highlights.flatMap((highlight, hIndex) => 
        highlight.tags.map((tag, tIndex) => ({
          id: `tag-${hIndex}-${tIndex}`,
          type: 'default',
          data: { label: `#${tag}` },
          position: {
            x: Math.cos((2 * Math.PI * hIndex) / highlights.length) * 350 + 
               Math.cos((2 * Math.PI * tIndex) / highlight.tags.length) * 60,
            y: Math.sin((2 * Math.PI * hIndex) / highlights.length) * 350 +
               Math.sin((2 * Math.PI * tIndex) / highlight.tags.length) * 60
          },
          style: {
            background: '#1D4ED8',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '2px 8px',
            fontSize: '11px',
            textAlign: 'center',
          },
        }))
      ),
      // 思考节点
      ...thoughts.map((thought, index) => ({
        id: `thought-${index}`,
        type: 'default',
        data: { label: thought },
        position: {
          x: Math.cos((2 * Math.PI * index) / thoughts.length) * 450,
          y: Math.sin((2 * Math.PI * index) / thoughts.length) * 450
        },
        style: {
          background: '#065F46',
          color: '#fff',
          border: '1px solid #047857',
          borderRadius: '8px',
          padding: '6px 12px',
          fontSize: '11px',
          width: 160,
          textAlign: 'center',
        },
      })),
    ] as Node[],
    edges: [
      // 连接主题到根节点
      ...highlights.map((_, index) => ({
        id: `edge-root-${index}`,
        source: 'root',
        target: `highlight-${index}`,
        style: { stroke: '#4B5563', strokeWidth: 2 },
        type: 'smoothstep',
        animated: true,
      })),
      // 连接标签到主题
      ...highlights.flatMap((highlight, hIndex) =>
        highlight.tags.map((_, tIndex) => ({
          id: `edge-highlight-${hIndex}-${tIndex}`,
          source: `highlight-${hIndex}`,
          target: `tag-${hIndex}-${tIndex}`,
          style: { stroke: '#2563EB', strokeWidth: 1 },
          type: 'straight',
        }))
      ),
      // 连接思考到根节点
      ...thoughts.map((_, index) => ({
        id: `edge-thought-${index}`,
        source: 'root',
        target: `thought-${index}`,
        style: { stroke: '#047857', strokeWidth: 1.5 },
        type: 'smoothstep',
      })),
    ] as Edge[],
  };

  // 生成主题总结的辅助函数
  const generateTopic = (content: string): string => {
    if (content.includes('鸿蒙') || content.includes('操作系统')) {
      return '鸿蒙系统为开发者带来新的发展机遇';
    } else if (content.includes('独立开发') || content.includes('创业')) {
      return '独立开发需要全面考虑技术和市场因素';
    } else if (content.includes('就业') || content.includes('工作')) {
      return '当前就业环境下程序员面临的机遇与挑战';
    } else if (content.includes('学习') || content.includes('技术')) {
      return '持续学习是程序员保持竞争力的关键';
    } else if (content.includes('规划') || content.includes('发展')) {
      return '职业发展需要合理规划和积极把握机会';
    } else {
      const words = content.split(' ').filter(word => 
        word.length > 2 && 
        !['这个', '那个', '就是', '可以', '应该'].includes(word)
      );
      return words.length > 0 ? 
        `关于${words[0]}的深入探讨和分析` : 
        '重要观点讨论与分析';
    }
  };

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
                    {subtitles.reduce((acc: Array<JSX.Element>, subtitle, index, array) => {
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
          <div className="h-full bg-gray-800 rounded-lg overflow-hidden">
            <MindMap data={mindmapData} />
          </div>
        )}

        {activeTab === 'article' && (
          <div className="h-full bg-gray-800 rounded-lg p-4 sm:p-6">
            <ScrollArea className="h-full">
              <article className="prose prose-invert prose-sm sm:prose max-w-none">
                <h1 className="text-xl sm:text-2xl mb-8">{highlights[0]?.title}</h1>
                
                {/* 正文内容 */}
                <div className="space-y-8">
                  {getMergedSubtitles().map((paragraph, index) => {
                    const content = paragraph.content.join(' ');
                    const topic = generateTopic(content);
                    
                    return (
                      <div key={index} className="space-y-3">
                        <h3 className="text-gray-400 text-sm font-medium">
                          📌 {topic}
                        </h3>
                        <p className="text-gray-200">
                          {paragraph.content.map((sentence, sentenceIndex) => (
                            <button
                              key={sentenceIndex}
                              onClick={() => onTimeClick(paragraph.startTime)}
                              className="inline hover:text-blue-400 hover:underline cursor-pointer"
                            >
                              {sentence}{' '}
                            </button>
                          ))}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </article>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
} 