'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SubjectTree, VideoSummary } from '@/types';
import { FiCheckCircle, FiCircle, FiLock } from 'react-icons/fi';

interface CourseSidebarProps {
  course: SubjectTree;
  currentVideoId?: number;
}

export default function CourseSidebar({ course, currentVideoId }: CourseSidebarProps) {
  const pathname = usePathname();

  const getVideoIcon = (video: VideoSummary, isLocked: boolean) => {
    if (isLocked) {
      return <FiLock className="h-4 w-4 text-gray-400" />;
    }
    if (video.progress?.is_completed) {
      return <FiCheckCircle className="h-4 w-4 text-success-500" />;
    }
    return <FiCircle className="h-4 w-4 text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">{course.title}</h2>
        <p className="text-sm text-gray-500 mt-1">
          {course.sections.reduce((acc, s) => acc + s.videos.length, 0)} lessons
        </p>
      </div>

      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        {course.sections.map((section) => (
          <div key={section.id} className="border-b border-gray-100 last:border-b-0">
            <div className="px-4 py-3 bg-gray-50">
              <h3 className="text-sm font-medium text-gray-700">{section.title}</h3>
            </div>

            <div className="divide-y divide-gray-100">
              {section.videos.map((video, index) => {
                const isCurrentVideo = video.id === currentVideoId;
                const isLocked = index > 0 && !section.videos[index - 1]?.progress?.is_completed && video.id !== currentVideoId;
                
                return (
                  <Link
                    key={video.id}
                    href={`/learn/${video.id}`}
                    className={`flex items-center px-4 py-3 hover:bg-gray-50 transition-colors ${
                      isCurrentVideo ? 'bg-primary-50 border-l-4 border-primary-500' : 'border-l-4 border-transparent'
                    }`}
                  >
                    <span className="flex-shrink-0 mr-3">
                      {getVideoIcon(video, isLocked)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        isCurrentVideo ? 'text-primary-700' : 'text-gray-900'
                      }`}>
                        {video.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {Math.floor(video.duration_seconds / 60)}:{String(video.duration_seconds % 60).padStart(2, '0')}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
