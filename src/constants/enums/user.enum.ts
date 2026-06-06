// ─────────────────────────────────────────
// ROLE
// ─────────────────────────────────────────
export enum EUserRole {
  ADMIN = "admin",
  JOB_SEEKER = "job_seeker",
  RECRUITER = "recruiter",
}

export const EUserRoleLabels: Record<EUserRole, string> = {
  [EUserRole.ADMIN]: "Quản trị viên",
  [EUserRole.JOB_SEEKER]: "Người tìm việc",
  [EUserRole.RECRUITER]: "Nhà tuyển dụng",
};

// ─────────────────────────────────────────
// USER STATUS
// ─────────────────────────────────────────
export enum EUserStatus {
  ACTIVE = "active",
  UNVERIFIED = "unverified",
  LOCKED = "locked",
}

export const EUserStatusLabels: Record<EUserStatus, string> = {
  [EUserStatus.ACTIVE]: "Hoạt động",
  [EUserStatus.UNVERIFIED]: "Chưa xác minh",
  [EUserStatus.LOCKED]: "Đã khóa",
};
