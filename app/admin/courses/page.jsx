"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BookOpen, Users, Calendar, Eye, Edit, Trash2, Search, X } from "lucide-react";
import Link from "next/link";
import { toast } from "react-toastify";

export default function AdminCoursesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchFilter, setSearchFilter] = useState("all"); // all, published, draft

  useEffect(() => {
    if (!session || session.user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    loadCourses();
  }, [session, router]);

  useEffect(() => {
    filterCourses();
  }, [courses, searchTerm, searchFilter]);

  const loadCourses = async () => {
    try {
      const response = await axios.get("/api/admin/courses");
      setCourses(response.data);
    } catch (error) {
      console.error("Error loading courses:", error);
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.skill?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status
    if (searchFilter === "published") {
      filtered = filtered.filter((course) => course.publishedAt);
    } else if (searchFilter === "draft") {
      filtered = filtered.filter((course) => !course.publishedAt);
    }

    setFilteredCourses(filtered);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchFilter("all");
  };

  const handleDelete = async (courseId) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        await axios.delete(`/api/admin/courses/${courseId}`);
        toast.success("Course deleted successfully!");
        loadCourses();
      } catch (error) {
        toast.error("Failed to delete course");
      }
    }
  };

  const togglePublish = async (courseId, currentStatus) => {
    try {
      await axios.patch(`/api/admin/courses/${courseId}`, {
        publishedAt: currentStatus ? null : new Date(),
      });
      toast.success(currentStatus ? "Course unpublished" : "Course published");
      loadCourses();
    } catch (error) {
      toast.error("Failed to update course status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
            <p className="text-gray-600">Oversee all platform courses</p>
          </div>
          <Link
            href="/courses"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create New Course
          </Link>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search courses, instructors, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex gap-2">
              <select
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Courses</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>

              {/* Clear Filters Button */}
              {(searchTerm || searchFilter !== "all") && (
                <button
                  onClick={clearSearch}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Search Results Info */}
          {(searchTerm || searchFilter !== "all") && (
            <div className="mt-4 text-sm text-gray-600">
              Showing {filteredCourses.length} of {courses.length} courses
              {searchTerm && (
                <span> matching "{searchTerm}"</span>
              )}
              {searchFilter !== "all" && (
                <span> ({searchFilter})</span>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {courses.length}
            </div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {courses.filter((c) => c.publishedAt).length}
            </div>
            <div className="text-sm text-gray-600">Published</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {courses.reduce(
                (acc, c) => acc + (c._count?.enrollments || 0),
                0
              )}
            </div>
            <div className="text-sm text-gray-600">Total Enrollments</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {courses.filter((c) => !c.publishedAt).length}
            </div>
            <div className="text-sm text-gray-600">Drafts</div>
          </div>
        </div>

        {/* Courses Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {filteredCourses.length === 0 ? (
            <div className="p-8 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || searchFilter !== "all" 
                  ? "No courses found" 
                  : "No courses available"
                }
              </h3>
              <p className="text-gray-500">
                {searchTerm || searchFilter !== "all"
                  ? "Try adjusting your search criteria or filters."
                  : "Create your first course to get started."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Instructor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollments
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCourses.map((course) => (
                    <tr key={course.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <BookOpen className="h-10 w-10 text-blue-600" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {course.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {course.skill?.name && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 text-xs rounded">
                                  {course.skill.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {course.createdBy?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Users className="h-4 w-4 mr-1" />
                          {course._count?.enrollments || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            togglePublish(course.id, course.publishedAt)
                          }
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                            course.publishedAt
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {course.publishedAt ? "Published" : "Draft"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/courses/${course.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button className="text-green-600 hover:text-green-900">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(course.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
