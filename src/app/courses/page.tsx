'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { courseApi, enrollmentApi, getAccessToken } from '@/lib/api';
import { Subject } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { FiBookOpen, FiCheckCircle, FiPlay } from 'react-icons/fi';

export default function CoursesPage() {
  const [courses, setCourses] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await courseApi.getAllSubjects();
        setCourses(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleEnroll = async (subjectId: number) => {
    const token = getAccessToken();
    if (!token) {
      window.location.href = '/login';
      return;
    }

    try {
      console.log('Enrolling in subject:', subjectId);
      const response = await enrollmentApi.enroll(subjectId);
      console.log('Enrollment response:', response.data);
      // Refresh courses to update enrollment status
      const coursesResponse = await courseApi.getAllSubjects();
      setCourses(coursesResponse.data.data);
    } catch (err: any) {
      console.error('Enrollment error:', err);
      if (err.response?.status === 409) {
        // Already enrolled, redirect to course
        window.location.href = `/course/${subjectId}`;
      } else {
        setError(err.response?.data?.message || 'Failed to enroll');
      }
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
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Available Courses</h1>
        <p className="mt-2 text-gray-600">Expand your knowledge with our curated courses</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="relative h-48 bg-gray-200">
              {course.thumbnail_url ? (
                <Image
                  src={course.thumbnail_url}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <FiBookOpen className="h-16 w-16 text-gray-400" />
                </div>
              )}
              {course.is_enrolled && (
                <div className="absolute top-2 right-2 bg-success-500 text-white px-2 py-1 rounded text-xs font-medium flex items-center">
                  <FiCheckCircle className="mr-1" />
                  Enrolled
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{course.section_count} sections</span>
                <span>{course.video_count} lessons</span>
              </div>

              {course.is_enrolled ? (
                <Link
                  href={`/course/${course.id}`}
                  className="w-full flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
                >
                  <FiPlay className="mr-2" />
                  Continue Learning
                </Link>
              ) : (
                <button
                  onClick={() => handleEnroll(course.id)}
                  className="w-full px-4 py-2 border border-primary-600 text-primary-600 rounded-md hover:bg-primary-50 transition-colors"
                  type="button"
                >
                  {user ? 'Enroll Now' : 'Login to Enroll'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
