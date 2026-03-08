'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { courseApi, enrollmentApi } from '@/lib/api';
import { SubjectTree } from '@/types';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProgressBar from '@/components/ProgressBar';
import { FiBookOpen, FiCheckCircle, FiCircle, FiLock, FiPlay, FiArrowLeft } from 'react-icons/fi';

export default function CourseDetailPage() {
  return (
    <ProtectedRoute>
      <CourseDetailContent />
    </ProtectedRoute>
  );
}

function CourseDetailContent() {
  const params = useParams();
  const router = useRouter();
  const subjectId = parseInt(params.subjectId as string);

  const [course, setCourse] = useState<SubjectTree | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        // Check enrollment first
        const enrollmentResponse = await enrollmentApi.checkEnrollment(subjectId);
        setIsEnrolled(enrollmentResponse.data.data.is_enrolled);

        if (!enrollmentResponse.data.data.is_enrolled) {
          setError('You must be enrolled in this course to view its content');
          setLoading(false);
          return;
        }

        // Fetch course tree
        const response = await courseApi.getSubjectTree(subjectId);
        setCourse(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (subjectId) {
      fetchCourse();
    }
  }, [subjectId]);

  const handleEnroll = async () => {
    try {
      await enrollmentApi.enroll(subjectId);
      setIsEnrolled(true);
      // Refresh course data
      const response = await courseApi.getSubjectTree(subjectId);
      setCourse(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to enroll');
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
        <p className="text-red-600 mb-4">{error}</p>
        {!isEnrolled && (
          <button
            onClick={handleEnroll}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Enroll Now
          </button>
        )}
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Course not found</p>
      </div>
    );
  }

  const totalVideos = course.sections.reduce((acc, s) => acc + s.videos.length, 0);
  const completedVideos = course.sections.reduce(
    (acc, s) => acc + s.videos.filter((v) => v.progress?.is_completed).length,
    0
  );
  const progressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

  // Find first incomplete video
  let firstIncompleteVideoId: number | null = null;
  for (const section of course.sections) {
    for (const video of section.videos) {
      if (!video.progress?.is_completed) {
        firstIncompleteVideoId = video.id;
        break;
      }
    }
    if (firstIncompleteVideoId) break;
  }

  // If all completed, use first video
  const continueVideoId = firstIncompleteVideoId || course.sections[0]?.videos[0]?.id;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => router.push('/courses')}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <FiArrowLeft className="mr-2" />
        Back to Courses
      </button>

      {/* Course Header */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="relative h-64 bg-gray-200">
          {course.thumbnail_url ? (
            <Image
              src={course.thumbnail_url}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <FiBookOpen className="h-24 w-24 text-gray-400" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">{course.title}</h1>
            <p className="text-white/90">{course.description}</p>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-600">
              {course.sections.length} sections • {totalVideos} lessons
            </div>
            <div className="text-sm text-gray-600">
              {completedVideos} of {totalVideos} completed
            </div>
          </div>

          <ProgressBar progress={progressPercentage} size="lg" />

          {continueVideoId && (
            <Link
              href={`/learn/${continueVideoId}`}
              className="mt-6 inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              <FiPlay className="mr-2" />
              {completedVideos > 0 ? 'Continue Learning' : 'Start Learning'}
            </Link>
          )}
        </div>
      </div>

      {/* Course Content */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>

        {course.sections.map((section, sectionIndex) => (
          <div key={section.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Section {sectionIndex + 1}: {section.title}
              </h3>
            </div>

            <div className="divide-y divide-gray-100">
              {section.videos.map((video, videoIndex) => {
                const isLocked =
                  videoIndex > 0 &&
                  !section.videos[videoIndex - 1]?.progress?.is_completed;

                return (
                  <Link
                    key={video.id}
                    href={isLocked ? '#' : `/learn/${video.id}`}
                    className={`flex items-center px-6 py-4 hover:bg-gray-50 transition-colors ${
                      isLocked ? 'cursor-not-allowed opacity-60' : ''
                    }`}
                    onClick={(e) => {
                      if (isLocked) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <span className="flex-shrink-0 mr-4">
                      {isLocked ? (
                        <FiLock className="h-5 w-5 text-gray-400" />
                      ) : video.progress?.is_completed ? (
                        <FiCheckCircle className="h-5 w-5 text-success-500" />
                      ) : (
                        <FiCircle className="h-5 w-5 text-gray-400" />
                      )}
                    </span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{video.title}</p>
                      <p className="text-sm text-gray-500">
                        {Math.floor(video.duration_seconds / 60)}:
                        {String(video.duration_seconds % 60).padStart(2, '0')}
                      </p>
                    </div>
                    {!isLocked && (
                      <FiPlay className="h-5 w-5 text-primary-600" />
                    )}
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
