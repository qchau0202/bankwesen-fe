import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import * as React from "react";
import type { SemesterTuition } from "@/config/mockData";

type TuitionFormData = {
  studentId: string;
  studentName: string;
  tuitionAmount: string;
};

type TuitionInfoCardProps = {
  formData: TuitionFormData;
  semesters: SemesterTuition[];
  selectedSemesterId: string | null;
  onStudentIdChange: (value: string) => void;
  onSelectSemester: (value: string) => void;
};

export const TuitionInfoCard: React.FC<TuitionInfoCardProps> = ({
  formData,
  semesters,
  selectedSemesterId,
  onStudentIdChange,
  onSelectSemester,
}) => {
  const selectedSemester = semesters.find((semester) => semester.id === selectedSemesterId);

  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle>Tuition Information</CardTitle>
        <CardDescription>
          Enter the student ID to retrieve tuition information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="student-id">Student ID (MSSV)</Label>
          <Input
            id="student-id"
            name="studentId"
            type="text"
            placeholder="Enter student ID (e.g., SV001)"
            value={formData.studentId}
            onChange={(e) => onStudentIdChange(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="student-name">Student Full Name</Label>
          <Input
            id="student-name"
            name="studentName"
            type="text"
            placeholder="Student name will appear here"
            value={formData.studentName}
            disabled
            className="bg-muted"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="semester-select">Semester</Label>
          <select
            id="semester-select"
            value={selectedSemesterId ?? ""}
            onChange={(event) => onSelectSemester(event.target.value)}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={semesters.length === 0}
          >
            <option value="" disabled>
              {semesters.length === 0 ? "No semesters available" : "Select a semester"}
            </option>
            {semesters.map((semester) => (
              <option key={semester.id} value={semester.id}>
                {semester.schoolYear} - {semester.name} • {semester.amount.toLocaleString()} VND • {semester.status === "paid" ? "Paid" : "Debt"}
              </option>
            ))}
          </select>
          {selectedSemester && (
            <div className="rounded-md border border-muted bg-muted/60 p-3 text-sm">
              <p className="font-semibold">{selectedSemester.schoolYear} - {selectedSemester.name}</p>
              <p>Amount: {selectedSemester.amount.toLocaleString()} VND</p>
              <p>Status: {selectedSemester.status === "paid" ? "Paid" : "Debt"}</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tuition-amount">Tuition Amount</Label>
          <Input
            id="tuition-amount"
            name="tuitionAmount"
            type="text"
            placeholder="Amount will be retrieved automatically"
            value={formData.tuitionAmount ? `${parseFloat(formData.tuitionAmount).toLocaleString()} VND` : ""}
            disabled
            className="bg-muted"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TuitionInfoCard;

