import { APIError } from "./APIError";
import { CampusId } from "./campus";

/* -------------------------------------
    DEPARTMENT
------------------------------------- */

export interface DepartmentInfo {
  id: string;
  name: string;
}

/**
 * Get an array of all departments available in the given campus.
 */

export async function getCampusDepartments(
  campusId: CampusId,
): Promise<[APIError, null] | [null, Array<DepartmentInfo>]> {
  const res = await fetch(`https://opencourse.dev/${campusId}/depts`);

  if (res.status === 200) {
    const data = await res.json();
    return [null, data];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/**
 * Get relevant information about a given deparment at the given campus.
 */
export async function getDepartmentInfo(
  campusId: CampusId,
  departmentId: string,
): Promise<[APIError, null] | [null, DepartmentInfo]> {
  const res = await fetch(
    `https://opencourse.dev/${campusId}/depts/${departmentId}`,
  );

  if (res.status === 200) {
    const data = await res.json();
    return [null, data];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/* -------------------------------------
    COURSES
------------------------------------- */

export interface CourseInfo {
  campus: CampusId;
  department: string;
  course: string;
  title: string;
  classes: string[];
}

/**
 * Get an array of all courses available in the given department at the given campus.
 */

export async function getDepartmentCourses(
  campusId: CampusId,
  departmentId: string,
): Promise<[APIError, null] | [null, CourseInfo[]]> {
  const res = await fetch(
    `https://opencourse.dev/${campusId}/depts/${departmentId}/courses`,
  );

  if (res.status === 200) {
    const data = await res.json();
    return [
      null,
      data.map((courseInfo: any) => ({
        ...courseInfo,
        department: courseInfo.dept,
        campus: campusId,
      })),
    ];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/**
 * Get relevant information about a given course for a given department at the given campus.
 */
export async function getCourseInfo(
  campusId: CampusId,
  departmentId: string,
  courseId: string,
): Promise<[APIError, null] | [null, CourseInfo]> {
  const res = await fetch(
    `https://opencourse.dev/${campusId}/depts/${departmentId}/courses/${courseId}`,
  );

  if (res.status === 200) {
    const data = await res.json();
    return [null, data];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/* -------------------------------------
    COURSES
------------------------------------- */

export type ClassStatus = "open" | "waitlist" | "full" | "unknown";

export interface ClassInfo {
  /** Class's CRN */
  CRN: number;
  /** Full identifier for the class */
  raw_course: string;
  /** Campus */
  campus: CampusId;
  /** Department */
  department: string;
  /** Course */
  course: string;
  /** Section */
  section: string;
  /** Title of the course */
  title: string;
  /** Units */
  units: number;
  /** Start date "MM/DD/YYYY" */
  start: string;
  /** End date "MM/DD/YYYY" */
  end: string;
  /** Number of seats open */
  seats: number;
  /** Number of waitlist seats open */
  wait_seats: number;
  /** Status of the class */
  status: ClassStatus;
  /** Schedule for the class */
  times: {
    /** Days this class runs */
    days: string;
    /** Time the class starts "hh:mm a" */
    start_time: string;
    /** Time the class ends */
    end_time: string;
    /** List of instructors */
    instructor: string[];
    /** Location */
    location: string;
  }[];
}

/**
 * Get an array of all classes available for the given course in the given department at the given campus.
 */
export async function getCourseClasses(
  campusId: CampusId,
  departmentId: string,
  courseId: string,
): Promise<[APIError, null] | [null, ClassInfo[]]> {
  const res = await fetch(
    `https://opencourse.dev/${campusId}/depts/${departmentId}/courses/${courseId}/classes`,
  );

  if (res.status === 200) {
    const data = await res.json();
    return [
      null,
      data.map((classInfo: any) => ({
        ...classInfo,
        department: classInfo.dept,
        campus: campusId.toLowerCase(),
      })),
    ];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}

/**
 * Get info about a specific class.
 */
export async function getClassInfo(
  campusId: CampusId,
  CRN: number,
): Promise<[APIError, null] | [null, ClassInfo | undefined]> {
  const res = await fetch(
    `https://opencourse.dev/${campusId}/classes/${CRN}`,
  );

  if (res.status === 200) {
    const data = await res.json();
    return [
      null,
      {
        ...data,
        department: data.dept,
        campus: campusId.toLowerCase(),
      },
    ];
  } else {
    const error = (await res.json()).error;
    return [new APIError(res.status, error), null];
  }
}
