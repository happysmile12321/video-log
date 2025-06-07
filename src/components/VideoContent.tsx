import React, { useState, useRef, useEffect } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { ScrollArea } from '@/components/ui/ScrollArea';
import { 
  DocumentTextIcon, 
  DocumentDuplicateIcon,
  MapIcon,
  ChatBubbleLeftRightIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { VideoSubtitles } from '@/components/VideoSubtitles';
import { MindMap } from '@/components/MindMap';
import { Node, Edge } from 'reactflow';
import { MermaidRenderer } from '@/components/MermaidRenderer';
import { Element, scroller, Element as ScrollElement } from 'react-scroll';

interface Subtitle {
  id: string;
  content: string;
  speaker: string;
  time: string;
  timestamp: number;
  timeStart?: string;
  timeEnd?: string;
}

// 章节接口定义，支持多层级结构
interface Chapter {
  id: string;
  content: string;
  speaker: string;
  time: string;
  timestamp: number;
  timeStart?: string;
  timeEnd?: string;
  children: Chapter[];
}

interface VideoContentProps {
  highlights: Array<{
    title: string;
    content: string;
    tags: string[];
  }>;
  thoughts: string[];
  subtitles: Subtitle[];
  chapters: Chapter[];
  chapterContent: string;
  mindmapContent?: string;
  currentTime: number;
  onTimeClick: (timestamp: number) => void;
}

// Helper function to parse timestamp to seconds
function parseTimestamp(timestamp: string | undefined): number {
  if (!timestamp) return 0;
  
  const parts = timestamp.split(':').map(Number);
  if (parts.length === 2) {
    // MM:SS format
    const [minutes, seconds] = parts;
    return minutes * 60 + seconds;
  } else if (parts.length === 3) {
    // HH:MM:SS format
    const [hours, minutes, seconds] = parts;
    return hours * 3600 + minutes * 60 + seconds;
  } else {
    console.error('Invalid timestamp format:', timestamp);
    return 0;
  }
}

// Helper function to format seconds to MM:SS
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function VideoContent({ 
  highlights, 
  thoughts, 
  subtitles,
  chapters,
  chapterContent,
  mindmapContent,
  currentTime,
  onTimeClick
}: VideoContentProps) {
  const [activeTab, setActiveTab] = useState('article');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedStates, setExpandedStates] = useState<Record<string, boolean>>({});
  const [collapsedItems, setCollapsedItems] = useState<Set<string>>(new Set());
  const summaryScrollRef = useRef<HTMLDivElement>(null);
  const articleScrollRef = useRef<HTMLDivElement>(null);
  const activeSubtitleRef = useRef<HTMLDivElement>(null);
  const chapterListRef = useRef<HTMLDivElement>(null);
  const activeChapterRef = useRef<HTMLDivElement>(null);

  // 处理展开/收起状态
  const toggleExpand = (id: string) => {
    setExpandedStates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleCollapse = (id: string) => {
    setCollapsedItems(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // 获取展开状态
  const isExpanded = (id: string) => expandedStates[id] || false;
  
  // 获取折叠状态
  const isCollapsed = (id: string) => collapsedItems.has(id);

  console.log(subtitles);


  // Helper function to merge subtitles into paragraphs
  const getMergedSubtitles = () => {
    const paragraphs: Array<{
      startTime: number;
      time: string;
      timeStart?: string;
      timeEnd?: string;
      content: Array<{
        text: string;
        timestamp: number;
        time: string;
      }>;
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
          timeStart: subtitle.timeStart,
          timeEnd: subtitle.timeEnd,
          content: [{
            text: subtitle.content,
            timestamp: subtitle.timestamp,
            time: subtitle.time
          }],
          speaker: subtitle.speaker
        };
        paragraphs.push(currentParagraph);
      } else {
        (currentParagraph as typeof paragraphs[0]).content.push({
          text: subtitle.content,
          timestamp: subtitle.timestamp,
          time: subtitle.time
        });
        // 更新结束时间
        if (subtitle.timeEnd) {
          (currentParagraph as typeof paragraphs[0]).timeEnd = subtitle.timeEnd;
        }
      }
    });
    
    return paragraphs;
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop } = e.currentTarget;
    setShowBackToTop(scrollTop > 100);
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
    { id: 'article', label: '文章', icon: '📑' },
    { id: 'summary', label: '总结摘要', icon: '📝' },
    { id: 'mindmap', label: '思维导图', icon: '🧠' }
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

  // 在渲染字幕内容时使用
  const renderSubtitle = (subtitle: Subtitle, id: string) => {
    const lines = subtitle.content.split('\n');
    const shouldShowExpand = lines.length > 3;
    const isActive = Math.abs(subtitle.timestamp - currentTime) < 1; // 当前播放的字幕

    return (
      <div
        key={id}
        id={`subtitle-${id}`}
        ref={isActive ? activeSubtitleRef : undefined}
        style={{display: 'inline-block', padding: '10px 10px'}}
        className={`transition-colors duration-300 ${isActive ? 'bg-blue-500/20' : ''}`}
      >
        {subtitle.speaker && (
          <span className="text-sm text-gray-400 mr-2">{subtitle.speaker}:</span>
        )}
        <span 
          className={`${!isExpanded(id) && shouldShowExpand ? 'line-clamp-3' : ''} cursor-pointer hover:text-blue-300 text-gray-200 text-sm ${isActive ? 'text-blue-300' : ''}`}
          onClick={() => onTimeClick(subtitle.timestamp)}
        >
          {subtitle.content}
        </span>
        {shouldShowExpand && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(id);
            }}
            className="ml-2 text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1"
          >
            {isExpanded(id) ? (
              <>
                <ChevronUpIcon className="w-4 h-4" />
                <span>收起</span>
              </>
            ) : (
              <>
                <ChevronDownIcon className="w-4 h-4" />
                <span>展开</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  // 查找当前激活的章节
  const findActiveChapter = (chapters: Chapter[], currentTime: number): { chapter: Chapter; subChapter?: Chapter; subSubChapter?: Chapter } | null => {
    for (const chapter of chapters) {
      const chapterStart = chapter.timeStart ? parseTimestamp(chapter.timeStart) : chapter.timestamp;
      const chapterEnd = chapter.timeEnd ? parseTimestamp(chapter.timeEnd) : chapter.timestamp;
      
      if (currentTime >= chapterStart && currentTime <= chapterEnd) {
        // 检查子章节
        if (chapter.children && chapter.children.length > 0) {
          for (const subChapter of chapter.children) {
            const subChapterStart = subChapter.timeStart ? parseTimestamp(subChapter.timeStart) : subChapter.timestamp;
            const subChapterEnd = subChapter.timeEnd ? parseTimestamp(subChapter.timeEnd) : subChapter.timestamp;
            
            if (currentTime >= subChapterStart && currentTime <= subChapterEnd) {
              // 检查三级章节
              if (subChapter.children && subChapter.children.length > 0) {
                for (const subSubChapter of subChapter.children) {
                  const subSubChapterStart = subSubChapter.timeStart ? parseTimestamp(subSubChapter.timeStart) : subSubChapter.timestamp;
                  const subSubChapterEnd = subSubChapter.timeEnd ? parseTimestamp(subSubChapter.timeEnd) : subSubChapter.timestamp;
                  
                  if (currentTime >= subSubChapterStart && currentTime <= subSubChapterEnd) {
                    return { chapter, subChapter, subSubChapter };
                  }
                }
              }
              return { chapter, subChapter };
            }
          }
        }
        return { chapter };
      }
    }
    return null;
  };

  // 监听 currentTime 变化，处理滚动和高亮
  useEffect(() => {
    // 处理文章视图的滚动
    if (activeTab === 'article' && activeChapterRef.current) {
      const target = activeChapterRef.current;
      const targetId = target.id;
      
      if (targetId) {
        scroller.scrollTo(targetId, {
          duration: 800,
          smooth: true,
          offset: -100, // 向上偏移，使目标元素位于视图中间偏上位置
          containerId: 'article-scroll-area'
        });
      }
    }
  }, [currentTime, activeTab]);

  // 渲染章节列表
  const renderChapterList = () => {
    const activeChapterInfo = findActiveChapter(chapters, currentTime);

    // 处理第一层章节，添加旁白
    const processedChapters = chapters.reduce<Array<{
      type: 'chapter' | 'narration';
      chapter?: Chapter;
      start: number;
      end: number;
      subtitles: Subtitle[];
    }>>((result, chapter, index) => {
      const chapterStart = chapter.timeStart ? parseTimestamp(chapter.timeStart) : chapter.timestamp;
      const chapterEnd = chapter.timeEnd ? parseTimestamp(chapter.timeEnd) : chapter.timestamp;

      // 如果不是第一个章节，检查是否需要添加旁白
      if (index > 0) {
        const prevChapter = chapters[index - 1];
        const prevChapterEnd = prevChapter.timeEnd ? parseTimestamp(prevChapter.timeEnd) : prevChapter.timestamp;
        
        if (chapterStart > prevChapterEnd) {
          // 添加旁白
          const narrationSubtitles = subtitles.filter(subtitle => {
            const subtitleStart = subtitle.timeStart ? parseTimestamp(subtitle.timeStart) : parseTimestamp(subtitle.time);
            const subtitleEnd = subtitle.timeEnd ? parseTimestamp(subtitle.timeEnd) : parseTimestamp(subtitle.time);
            return subtitleStart >= prevChapterEnd && subtitleEnd <= chapterStart;
          });

          result.push({
            type: 'narration',
            start: prevChapterEnd,
            end: chapterStart,
            subtitles: narrationSubtitles
          });
        }
      }

      // 添加当前章节
      const chapterSubtitles = subtitles.filter(subtitle => {
        const subtitleStart = subtitle.timeStart ? parseTimestamp(subtitle.timeStart) : parseTimestamp(subtitle.time);
        const subtitleEnd = subtitle.timeEnd ? parseTimestamp(subtitle.timeEnd) : parseTimestamp(subtitle.time);
        return subtitleStart >= chapterStart && subtitleEnd <= chapterEnd;
      });

      result.push({
        type: 'chapter',
        chapter,
        start: chapterStart,
        end: chapterEnd,
        subtitles: chapterSubtitles
      });

      return result;
    }, []);

    return (
      <div className="space-y-6">
        {processedChapters.map((item, index) => {
          if (item.type === 'narration') {
            return (
              <div key={`narration-${index}`} className="bg-gray-700/50 rounded-lg p-6">
                <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-2">
                    <span>🎭</span>
                    <span>旁白</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onTimeClick(item.start)}
                        className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                      >
                        {formatTime(item.start)}
                      </button>
                      <span>-</span>
                      <button
                        onClick={() => onTimeClick(item.end)}
                        className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                      >
                        {formatTime(item.end)}
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleCollapse(`narration-${index}`)}
                    className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1"
                  >
                    {isCollapsed(`narration-${index}`) ? (
                      <>
                        <ChevronDownIcon className="w-4 h-4" />
                        <span>展开</span>
                      </>
                    ) : (
                      <>
                        <ChevronUpIcon className="w-4 h-4" />
                        <span>收起</span>
                      </>
                    )}
                  </button>
                </div>
                {!isCollapsed(`narration-${index}`) && (
                  <div className="bg-gray-900/30 rounded-lg p-3">
                    {item.subtitles.length > 0 ? (
                      item.subtitles.map((subtitle, subIndex) => 
                        renderSubtitle(subtitle, `narration-${index}-${subIndex}`)
                      )
                    ) : (
                      <div className="text-gray-400 text-sm flex items-center gap-2">
                        <span>✨</span>
                        <span>这段没有旁白内容</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          } else {
            const chapter = item.chapter!;
            const isActiveChapter = activeChapterInfo?.chapter === chapter;

            return (
              <div 
                key={`chapter-${index}`}
                id={`chapter-${index}`}
                ref={isActiveChapter ? activeChapterRef : undefined}
                className={`bg-gray-700/50 rounded-lg p-6 space-y-4 transition-colors duration-300 ${isActiveChapter ? 'ring-2 ring-blue-500' : ''}`}
              >
                <div className="flex items-start gap-2">
                  <div className="flex-none">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">{formatTime(item.start)}</span>
                      <span className="text-gray-600">-</span>
                      <span className="text-sm text-gray-400">{formatTime(item.end)}</span>
                    </div>
                  </div>
                  <h3 className={`text-white font-medium text-lg ${isActiveChapter ? 'text-blue-300' : ''}`}>{chapter.content}</h3>
                </div>

                {/* 渲染子章节 */}
                {chapter.children && chapter.children.map((subChapter, subIndex) => {
                  const isActiveSubChapter = activeChapterInfo?.subChapter === subChapter;
                  const subChapterSubtitles = subtitles.filter(subtitle => {
                    const subtitleStart = subtitle.timeStart ? parseTimestamp(subtitle.timeStart) : parseTimestamp(subtitle.time);
                    const subtitleEnd = subtitle.timeEnd ? parseTimestamp(subtitle.timeEnd) : parseTimestamp(subtitle.time);
                    return subtitleStart >= parseTimestamp(subChapter.timeStart) && subtitleEnd <= parseTimestamp(subChapter.timeEnd);
                  });

                  return (
                    <div 
                      key={`sub-${index}-${subIndex}`}
                      id={`subchapter-${index}-${subIndex}`}
                      className={`ml-8 space-y-3 ${isActiveSubChapter ? 'bg-blue-500/10 rounded-lg p-3' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-none">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">{subChapter.timeStart}</span>
                            <span className="text-gray-600">-</span>
                            <span className="text-sm text-gray-400">{subChapter.timeEnd}</span>
                          </div>
                        </div>
                        <h4 className={`text-white font-medium text-base ${isActiveSubChapter ? 'text-blue-300' : ''}`}>{subChapter.content}</h4>
                      </div>

                      {/* 渲染三级章节 */}
                      {subChapter.children && subChapter.children.map((subSubChapter, subSubIndex) => {
                        const isActiveSubSubChapter = activeChapterInfo?.subSubChapter === subSubChapter;
                        const subSubChapterSubtitles = subtitles.filter(subtitle => {
                          const subtitleStart = subtitle.timeStart ? parseTimestamp(subtitle.timeStart) : parseTimestamp(subtitle.time);
                          const subtitleEnd = subtitle.timeEnd ? parseTimestamp(subtitle.timeEnd) : parseTimestamp(subtitle.time);
                          return subtitleStart >= parseTimestamp(subSubChapter.timeStart) && subtitleEnd <= parseTimestamp(subSubChapter.timeEnd);
                        });

                        return (
                          <div 
                            key={`subsub-${index}-${subIndex}-${subSubIndex}`}
                            id={`subsubchapter-${index}-${subIndex}-${subSubIndex}`}
                            className={`ml-8 space-y-2 ${isActiveSubSubChapter ? 'bg-blue-500/10 rounded-lg p-2' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              <div className="flex-none">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-400">{subSubChapter.timeStart}</span>
                                  <span className="text-gray-600">-</span>
                                  <span className="text-sm text-gray-400">{subSubChapter.timeEnd}</span>
                                </div>
                              </div>
                              <h5 className={`text-white font-medium text-sm ${isActiveSubSubChapter ? 'text-blue-300' : ''}`}>{subSubChapter.content}</h5>
                            </div>

                            {/* 渲染字幕 */}
                            {subSubChapterSubtitles.length > 0 && (
                              <div className="ml-8 space-y-2">
                                {subSubChapterSubtitles.map((subtitle, subSubSubIndex) => 
                                  renderSubtitle(subtitle, `subsubchapter-${index}-${subIndex}-${subSubIndex}-${subSubSubIndex}`)
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* 渲染字幕 */}
                      {subChapterSubtitles.length > 0 && (
                        <div className="ml-8 space-y-2">
                          {subChapterSubtitles.map((subtitle, subSubIndex) => 
                            renderSubtitle(subtitle, `subchapter-${index}-${subIndex}-${subSubIndex}`)
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* 渲染字幕 */}
                {item.subtitles.length > 0 && (
                  <div className="ml-8 space-y-2">
                    {item.subtitles.map((subtitle, subIndex) => 
                      renderSubtitle(subtitle, `chapter-${index}-${subIndex}`)
                    )}
                  </div>
                )}
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 mt-2 sm:mt-4 min-h-0">
        {activeTab === 'article' && (
          <div className="h-full bg-gray-800 rounded-lg">
            <ScrollArea 
              className="h-full" 
              ref={articleScrollRef}
              id="article-scroll-area"
            >
              <div className="p-4 sm:p-6 space-y-4">
                {/* 章节内容 */}
                {chapters.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>📑</span>
                      <span>章节内容</span>
                    </h2>
                    <div id="chapter-scroll-area">
                      {renderChapterList()}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
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
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span>📝</span>
                    <span>内容速览</span>
                  </h2>
                  <div className="bg-gray-700/50 rounded-lg p-6">
                    <div className="prose prose-invert max-w-none">
                      {highlights.length > 0 ? (
                        <div className="space-y-4">
                          <p className="text-gray-200 text-base leading-relaxed whitespace-pre-line">
                            {highlights[0].content}
                          </p>
                          {highlights[0].tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              {highlights[0].tags.map(tag => (
                                <span 
                                  key={tag}
                                  className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-gray-400 italic">暂无内容摘要</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* 章节内容（章节内容原文，格式化显示） */}
                {chapterContent && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>📑</span>
                      <span>章节内容</span>
                    </h2>
                    <div className="bg-gray-700/50 rounded-lg p-6">
                      <div className="text-gray-200 text-base leading-relaxed whitespace-pre-line">
                        {chapterContent.split(/\n/).map((line, idx) => {
                          // 匹配 ⏰00:00-01:00 或 ⏰00:00
                          const timeRegex = /⏰(\d{2}:\d{2})(?:-(\d{2}:\d{2}))?/g;
                          let lastIndex = 0;
                          const parts: React.ReactNode[] = [];
                          let match;
                          while ((match = timeRegex.exec(line)) !== null) {
                            // 添加前面的文本
                            if (match.index > lastIndex) {
                              parts.push(line.slice(lastIndex, match.index));
                            }
                            // 起始时间
                            const start = match[1];
                            // 结束时间
                            const end = match[2];
                            // 转换为秒
                            const toSeconds = (t: string) => {
                              const [m, s] = t.split(':').map(Number);
                              return m * 60 + s;
                            };
                            // 渲染起始时间按钮
                            parts.push(
                              <button
                                key={`start-${idx}-${match.index}`}
                                onClick={() => onTimeClick(toSeconds(start))}
                                className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer mx-1"
                              >
                                ⏰{start}
                              </button>
                            );
                            // 如果有结束时间，渲染结束时间按钮
                            if (end) {
                              parts.push(
                                <>
                                  <span>-</span>
                                  <button
                                    key={`end-${idx}-${match.index}`}
                                    onClick={() => onTimeClick(toSeconds(end))}
                                    className="text-blue-400 hover:text-blue-300 hover:underline cursor-pointer mx-1"
                                  >
                                    {end}
                                  </button>
                                </>
                              );
                            }
                            lastIndex = match.index + match[0].length;
                          }
                          // 添加剩余文本
                          if (lastIndex < line.length) {
                            parts.push(line.slice(lastIndex));
                          }
                          return <div key={idx}>{parts}</div>;
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* 亮点部分 */}
                {highlights.length > 1 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>✨</span>
                      <span>精彩亮点</span>
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {highlights.slice(1).map((highlight, index) => (
                        <div 
                          key={index}
                          className="bg-gray-700/50 rounded-lg p-6 space-y-3"
                        >
                          <h3 className="text-white font-medium text-lg">{highlight.title}</h3>
                          <p className="text-gray-300 text-base leading-relaxed whitespace-pre-line">{highlight.content}</p>
                          {highlight.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 pt-2">
                              {highlight.tags.map(tag => (
                                <span 
                                  key={tag}
                                  className="text-xs px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 思考启发 */}
                {thoughts.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <span>💡</span>
                      <span>思考启发</span>
                    </h2>
                    <div className="bg-gray-700/50 rounded-lg p-6">
                      <ul className="space-y-4">
                        {thoughts.map((thought, index) => (
                          <li 
                            key={index}
                            className="flex items-start text-gray-200"
                          >
                            <span className="mr-3 text-blue-400 text-lg">•</span>
                            <span className="text-base leading-relaxed whitespace-pre-line">{thought}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
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
          <div className="h-full bg-gray-800 rounded-lg">
            <ScrollArea className="h-full">
              <div className="p-4 sm:p-6">
                {mindmapContent ? (
                  <MermaidRenderer code={mindmapContent} />
                ) : (
                  <div className="text-gray-400 text-center">暂无思维导图内容</div>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  );
} 