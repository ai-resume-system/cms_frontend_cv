export enum EJobStatus {
  PENDING = "pending",
  OPEN = "open",
  CLOSED = "closed",
  REJECTED = "rejected",
  EXPIRED = "expired",
}

export const EJobStatusLabels: Record<EJobStatus, string> = {
  [EJobStatus.PENDING]: "Chờ duyệt",
  [EJobStatus.OPEN]: "Đang tuyển",
  [EJobStatus.CLOSED]: "Đã đóng",
  [EJobStatus.REJECTED]: "Từ chối",
  [EJobStatus.EXPIRED]: "Hết hạn",
};
