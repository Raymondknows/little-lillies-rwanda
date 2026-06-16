/**
 * Teacher Portal Utilities
 * Handles school type detection and teacher-specific data fetching
 */

import { getBackendUrl } from './backend-url';

export type SchoolPhase = 'EARLY_YEARS' | 'PRIMARY' | 'SECONDARY';

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  school: {
    name: string;
    slug: string;
  };
  createdAt: string;
}

export interface TeacherDashboardData {
  teacher: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  school: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    country: string;
  };
  classes: Array<{
    id: string;
    name: string;
    phase: string;
    arm?: string;
    studentCount: number;
  }>;
  subjects: Array<{
    id: string;
    name: string;
  }>;
  totalStudents: number;
  classCount: number;
}

/**
 * Get teacher dashboard data from backend
 */
export async function getTeacherDashboard(): Promise<TeacherDashboardData> {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/api/teacher/dashboard`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch teacher dashboard');
  }

  return response.json();
}

/**
 * Get teacher profile data from backend
 */
export async function getTeacherProfile(): Promise<TeacherProfile> {
  const backendUrl = getBackendUrl();
  const response = await fetch(`${backendUrl}/api/teacher/profile`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch teacher profile');
  }

  return response.json();
}

/**
 * Detect school phase based on school data
 * For now, returns PRIMARY as default (backend can enhance this)
 */
export function detectSchoolPhase(schoolData?: any): SchoolPhase {
  // TODO: Enhance backend to return school phase
  // For now, default to PRIMARY
  // In future: check school.phases or school.schoolPhases
  return 'PRIMARY';
}

/**
 * Get navigation items based on school phase
 */
export function getTeacherNavigation(phase: SchoolPhase) {
  const baseNav = [
    { href: '/teacher', label: 'Dashboard', icon: 'LayoutDashboard' },
    { href: '/teacher/students', label: 'Students', icon: 'Users' },
    { href: '/teacher/subjects', label: 'Subjects', icon: 'BookOpen' },
    { href: '/teacher/attendance', label: 'Attendance', icon: 'ClipboardList' },
    { href: '/teacher/announcements', label: 'Announcements', icon: 'Megaphone' },
    { href: '/teacher/profile', label: 'Profile', icon: 'UserCircle' },
    { href: '/teacher/school', label: 'School', icon: 'Building2' },
  ];

  const phaseSpecific = {
    EARLY_YEARS: [
      { href: '/teacher/children', label: 'Children', icon: 'Baby' },
      { href: '/teacher/observations', label: 'Observations', icon: 'Eye' },
      { href: '/teacher/daily-reports', label: 'Daily Reports', icon: 'FileText' },
      { href: '/teacher/results', label: 'Results', icon: 'BarChart3' },
    ],
    PRIMARY: [
      { href: '/teacher/class', label: 'My Class', icon: 'BookOpen' },
      { href: '/teacher/results', label: 'Results', icon: 'FileText' },
      { href: '/teacher/comments', label: 'Comments', icon: 'PenTool' },
    ],
    SECONDARY: [
      { href: '/teacher/results', label: 'Results', icon: 'FileText' },
      { href: '/teacher/exams', label: 'Exams', icon: 'ClipboardCheck' },
    ],
  };

  return {
    base: baseNav,
    phase: phaseSpecific[phase] || [],
    all: [...baseNav.slice(0, 1), ...phaseSpecific[phase] || [], ...baseNav.slice(1)],
  };
}

/**
 * Mobile navigation for teacher portal
 */
export function getTeacherMobileNav(phase: SchoolPhase) {
  const mobileNav = {
    EARLY_YEARS: [
      { href: '/teacher', label: '🏠 Home' },
      { href: '/teacher/students', label: '👥 Students' },
      { href: '/teacher/subjects', label: '📚 Subjects' },
      { href: '/teacher/children', label: '👶 Children' },
      { href: '/teacher/attendance', label: '✅ Attendance' },
      { href: '/teacher/results', label: '📊 Results' },
      { href: '/teacher/announcements', label: '📢 Announcements' },
      { href: '/teacher/profile', label: '👤 Profile' },
      { href: '/teacher/school', label: '🏫 School' },
    ],
    PRIMARY: [
      { href: '/teacher', label: '🏠 Home' },
      { href: '/teacher/students', label: '👥 Students' },
      { href: '/teacher/subjects', label: '📚 Subjects' },
      { href: '/teacher/class', label: '🏫 Class' },
      { href: '/teacher/attendance', label: '✅ Attendance' },
      { href: '/teacher/results', label: '📊 Results' },
      { href: '/teacher/profile', label: '👤 Profile' },
      { href: '/teacher/school', label: '🏢 School' },
    ],
    SECONDARY: [
      { href: '/teacher', label: '🏠 Home' },
      { href: '/teacher/students', label: '👥 Students' },
      { href: '/teacher/subjects', label: '📚 Subjects' },
      { href: '/teacher/results', label: '📝 Results' },
      { href: '/teacher/attendance', label: '✅ Attendance' },
      { href: '/teacher/profile', label: '👤 Profile' },
      { href: '/teacher/school', label: '🏢 School' },
    ],
  };

  return mobileNav[phase] || mobileNav.PRIMARY;
}
