'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { videoApi, courseApi, progressApi } from '@/lib/api';
import { Video, SubjectTree } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import YouTubePlayer from '@/components/YouTubePlayer';
import CourseSidebar from '@/components/CourseSidebar';
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiLock } from 'react-icons/fi';

export default function LearnPage() {
  return (
    <ProtectedRoute>
      <LearnContent />
    </ProtectedRoute>
  );
}

function LearnContent() {
  const params = useParams();
  const router = useRouter();
  const videoId = parseInt(params.videoId as string);

  const [video, setVideo] = useState<Video | null>(null);
  const [course, setCourse] = useState<SubjectTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingComplete, setMarkingComplete] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const videoResponse = await videoApi.getVideo(videoId);
      const videoData = videoResponse.data.data;
      setVideo(videoData);

      // Fetch course tree for sidebar (best-effort, may fail if not enrolled)
      try {
        const courseResponse = await courseApi.getSubjectTree(videoData.subject_id);
        setCourse(courseResponse.data.data);
      } catch (courseErr) {
        console.warn('Could not load course sidebar:', courseErr);
        // Still allow watching the video, just without sidebar
        setCourse({
          id: videoData.subject_id,
          title: videoData.subject_title,
          description: '',
          thumbnail_url: '',
          created_at: '',
          is_enrolled: true,
          sections: []
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    if (videoId) {
      fetchData();
    }
  }, [videoId, fetchData]);

  const handleMarkComplete = async () => {
    if (!video) return;
    
    setMarkingComplete(true);
    try {
      await progressApi.updateProgress(videoId, 0, true);
      // Refresh data
      fetchData();
    } catch (err) {
      console.error('Failed to mark complete:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleVideoComplete = async () => {
    if (!video || video.progress.is_completed) return;
    
    try {
      await progressApi.updateProgress(videoId, 0, true);
      fetchData();
    } catch (err) {
      console.error('Failed to update progress:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => router.push('/courses')}
          className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
        >
          Back to Courses
        </button>
      </div>
    );
  }

  if (!video || !course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Video not found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Main Content */}
      <div className="flex-1">
        {/* Back Link */}
        <Link
          href={`/course/${video.subject_id}`}
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to {video.subject_title}
        </Link>

        {/* Video Player */}
        <YouTubePlayer
          videoId={video.youtube_video_id}
          startTime={video.progress.last_position_seconds}
          videoDbId={video.id}
          isLocked={video.locked}
          onComplete={handleVideoComplete}
        />

        {/* Video Info */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{video.title}</h1>
              <p className="text-gray-600 mt-1">{video.subject_title}</p>
            </div>
            
            {!video.locked && !video.progress.is_completed && (
              <button
                onClick={handleMarkComplete}
                disabled={markingComplete}
                className="flex items-center px-4 py-2 bg-success-500 text-white rounded-md hover:bg-success-600 transition-colors disabled:opacity-50"
              >
                <FiCheckCircle className="mr-2" />
                {markingComplete ? 'Marking...' : 'Mark Complete'}
              </button>
            )}
            
            {video.progress.is_completed && (
              <div className="flex items-center text-success-600">
                <FiCheckCircle className="mr-2" />
                <span className="font-medium">Completed</span>
              </div>
            )}
          </div>

          {video.locked && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center">
              <FiLock className="h-5 w-5 text-yellow-600 mr-3" />
              <p className="text-yellow-800">
                Complete the previous lesson to unlock this one.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          {video.previous_video_id ? (
            <Link
              href={`/learn/${video.previous_video_id}`}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <FiArrowLeft className="mr-2" />
              Previous Lesson
            </Link>
          ) : (
            <div />
          )}

          {video.next_video_id ? (
            <Link
              href={`/learn/${video.next_video_id}`}
              className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                video.progress.is_completed
                  ? 'bg-primary-600 text-white hover:bg-primary-700'
                  : 'border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Next Lesson
              <FiArrowRight className="ml-2" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-80 flex-shrink-0">
        <CourseSidebar course={course} currentVideoId={videoId} />
      </div>
    </div>
  );
}
