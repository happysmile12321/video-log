export function SkeletonLoader() {
  return (
    <div className="animate-pulse p-8">
      <div className="max-w-4xl mx-auto">
        {/* 标题骨架 */}
        <div className="h-8 bg-gray-700 rounded-lg w-1/3 mb-6"></div>
        
        {/* 内容骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="bg-gray-700 rounded-lg p-6">
              <div className="h-6 bg-gray-600 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-600 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-600 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 