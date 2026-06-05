import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { getCurrentSchool } from "@/lib/school";
import {
  getSchoolAnalytics,
  getClassAnalytics,
  getSubjectAnalytics,
} from "@/lib/analytics";
import { BarChart, Users, TrendingUp } from "lucide-react";

const emptySchoolAnalytics = {
  schoolAverage: 0,
  passRate: 0,
  totalResults: 0,
  gradeDistribution: {
    A: 0,
    B: 0,
    C: 0,
    D: 0,
    E: 0,
    F: 0,
  },
  topPerformers: [],
  strugglingStudents: [],
};

export default async function AnalyticsPage() {
  const school = await getCurrentSchool();

  // Fetch analytics data
  const schoolAnalytics = (await getSchoolAnalytics(school.id)) ?? emptySchoolAnalytics;
  const classes = await prisma.class.findMany({
    where: { schoolId: school.id },
    orderBy: { name: "asc" },
  });

  const subjects = await prisma.subject.findMany({
    where: { schoolId: school.id },
    orderBy: { name: "asc" },
  });

  // Fetch class and subject analytics in parallel
  const classAnalyticsData = await Promise.all(
    classes.map((c) => getClassAnalytics(c.id, school.id))
  );

  const subjectAnalyticsData = await Promise.all(
    subjects.map((s) => getSubjectAnalytics(s.id, school.id))
  );

  const classesWithAnalytics = classes
    .map((c, idx) => ({
      ...c,
      analytics: classAnalyticsData[idx],
    }))
    .filter((classData) => classData.analytics !== null);

  const subjectsWithAnalytics = subjects
    .map((s, idx) => ({
      ...s,
      analytics: subjectAnalyticsData[idx],
    }))
    .filter((subjectData) => subjectData.analytics !== null);

  // Helper to show grades by count
  const gradeDistribution = schoolAnalytics.gradeDistribution;
  const totalGrades = Object.values(gradeDistribution).reduce(
    (sum, count) => sum + count,
    0
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="mt-1 text-muted">
          Performance insights across your school.
        </p>
      </div>

      {/* School-wide Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-border bg-surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted">
                School Average
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-brand" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {schoolAnalytics.schoolAverage.toFixed(1)}%
            </p>
            <p className="mt-2 text-xs text-muted">
              Across {schoolAnalytics.totalResults} results
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted">
                Pass Rate
              </CardTitle>
              <Users className="h-4 w-4 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-success">
              {schoolAnalytics.passRate.toFixed(1)}%
            </p>
            <p className="mt-2 text-xs text-muted">
              Scored D and above
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted">
                Total Results
              </CardTitle>
              <BarChart className="h-4 w-4 text-brand" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {schoolAnalytics.totalResults}
            </p>
            <p className="mt-2 text-xs text-muted">
              Pupil-subject entries
            </p>
          </CardContent>
        </Card>

        <Card className="border-border bg-surface">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted">
                Classes
              </CardTitle>
              <Users className="h-4 w-4 text-brand" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {classes.length}
            </p>
            <p className="mt-2 text-xs text-muted">
              Active classes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution */}
      <Card className="border-border bg-surface">
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {["A", "B", "C", "D", "E", "F"].map((grade) => {
              const gradeKey = grade as keyof typeof gradeDistribution;
              const count = gradeDistribution[gradeKey] || 0;
              const percentage = totalGrades > 0 ? (count / totalGrades) * 100 : 0;
              const gradeColor: Record<keyof typeof gradeDistribution, string> = {
                A: "bg-success",
                B: "bg-brand",
                C: "bg-brand",
                D: "bg-warning",
                E: "bg-warning",
                F: "bg-error",
              };

              return (
                <div key={grade} className="flex items-center gap-3">
                  <Badge className={`w-8 justify-center ${gradeColor[gradeKey]}`}>
                    {grade}
                  </Badge>
                  <div className="flex-1">
                    <div className="h-2 w-full rounded-full bg-background">
                      <div
                        className={`h-full rounded-full ${gradeColor[gradeKey]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-16 text-right text-xs text-muted">
                    {count} ({percentage.toFixed(0)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      {schoolAnalytics.topPerformers.length > 0 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle>Top 5 Performing Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schoolAnalytics.topPerformers.map((performer, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {performer.pupilName}
                    </p>
                    <p className="text-xs text-muted">
                      {performer.className}
                    </p>
                  </div>
                  <Badge className="bg-success">
                    Avg: {performer.averageScore.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Struggling Students */}
      {schoolAnalytics.strugglingStudents.length > 0 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle>5 Students Needing Support</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {schoolAnalytics.strugglingStudents.map((student, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {student.pupilName}
                    </p>
                    <p className="text-xs text-muted">
                      {student.className}
                    </p>
                  </div>
                  <Badge className="bg-warning">
                    Grade: {student.grade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Performance Comparison */}
      {classesWithAnalytics.length > 0 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle>Class Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classesWithAnalytics.map((classData) => (
                <div key={classData.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-foreground">
                      {classData.name}
                    </h3>
                    <span className="text-xs text-muted">
                      {classData.analytics?.totalResults ?? 0} results
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="rounded bg-background p-3">
                      <p className="text-xs text-muted">Class Average</p>
                      <p className="mt-1 text-lg font-bold text-brand">
                        {(classData.analytics?.classAverage ?? 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="rounded bg-background p-3">
                      <p className="text-xs text-muted">Pass Rate</p>
                      <p className="mt-1 text-lg font-bold text-success">
                        {(classData.analytics?.passRate ?? 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Performance */}
      {subjectsWithAnalytics.length > 0 && (
        <Card className="border-border bg-surface">
          <CardHeader>
            <CardTitle>Subject Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subjectsWithAnalytics.map((subjectData) => (
                <div key={subjectData.id} className="flex items-center justify-between rounded-lg bg-background/50 p-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {subjectData.name}
                    </p>
                    <p className="text-xs text-muted">
                      {subjectData.analytics?.totalResults ?? 0} results
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xs text-muted">Average</p>
                      <p className="font-bold text-brand">
                        {(subjectData.analytics?.subjectAverage ?? 0).toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted">Pass Rate</p>
                      <p className="font-bold text-success">
                        {(subjectData.analytics?.passRate ?? 0).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {schoolAnalytics.totalResults === 0 && (
        <Card className="border border-dashed border-border bg-background/50">
          <CardContent className="pt-6 text-center">
            <BarChart className="mx-auto h-12 w-12 text-muted/30" />
            <p className="mt-2 text-muted">
              No results published yet. Publish assessments to see analytics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
