const GENERIC_API_ERROR_MESSAGE = "Có lỗi xảy ra. Vui lòng thử lại sau.";

const API_ERROR_STATUS_MESSAGES: Record<number, string> = {
  400: "Dữ liệu gửi lên không hợp lệ.",
  401: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
  403: "Bạn không có quyền thực hiện thao tác này.",
  404: "Không tìm thấy dữ liệu yêu cầu.",
  409: "Dữ liệu đang xung đột với trạng thái hiện tại.",
  422: "Dữ liệu gửi lên không hợp lệ.",
  429: "Bạn thao tác quá nhanh. Vui lòng thử lại sau.",
  500: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau.",
  503: "Hệ thống đang bận. Vui lòng thử lại sau ít phút.",
};

export const LOCAL_API_ERROR_MESSAGES = {
  CMS_ACCESS_DENIED:
    "Tài khoản của bạn không có quyền truy cập hệ thống quản trị.",
  SESSION_EXPIRED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  NETWORK_UNAVAILABLE:
    "Không thể kết nối tới máy chủ. Vui lòng báo cho bộ phận sự lý hoặc kiểm tra kết nối mạng.",
} as const;

const API_ERROR_MESSAGE_MAP: Record<string, string> = {
  "email already exists": "Email này đã tồn tại trong hệ thống.",
  "invalid phone number": "Số điện thoại không hợp lệ.",
  "password too weak": "Mật khẩu quá yếu. Vui lòng chọn mật khẩu mạnh hơn.",
  "registration failed": "Đăng ký tài khoản thất bại.",
  "invalid otp type": "Loại mã OTP không hợp lệ.",
  "invalid or expired otp": "Mã OTP không hợp lệ hoặc đã hết hạn.",
  "otp has expired": "Mã OTP đã hết hạn.",
  "account not found": "Không tìm thấy tài khoản.",
  "account locked due otp failures":
    "Tài khoản đã bị khóa do nhập sai OTP quá nhiều lần.",
  "too many requests": "Bạn đang thao tác quá nhanh. Vui lòng thử lại sau.",
  "please wait 60 seconds": "Vui lòng chờ 60 giây rồi thử lại.",
  "account is unverified": "Tài khoản của bạn chưa được xác minh.",
  "account already verified": "Tài khoản đã được xác minh trước đó.",
  "invalid or expired key": "Khóa xác thực không hợp lệ hoặc đã hết hạn.",
  "role does not match": "Vai trò tài khoản không phù hợp.",
  "account locked, contact support":
    "Tài khoản đã bị khóa. Vui lòng liên hệ hỗ trợ.",
  "incorrect email or password": "Tên đăng nhập hoặc mật khẩu không chính xác.",
  "account is inactive": "Tài khoản hiện đang bị vô hiệu hóa.",
  "login failed": "Đăng nhập thất bại.",
  "too many failures, try in 10m":
    "Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 10 phút.",
  "invalid or expired token": "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
  "invalid or expired access token":
    "Access token không hợp lệ hoặc đã hết hạn.",
  "invalid or expired refresh token":
    "Refresh token không hợp lệ hoặc đã hết hạn.",
  "password change failed": "Đổi mật khẩu thất bại.",
  "old password is incorrect": "Mật khẩu hiện tại không chính xác.",
  "new password same as old":
    "Mật khẩu mới không được trùng với mật khẩu hiện tại.",
  "user not found": "Không tìm thấy người dùng.",
  "user already exists": "Người dùng đã tồn tại.",
  "company not found": "Không tìm thấy công ty.",
  "invalid employee range": "Khoảng số lượng nhân sự không hợp lệ.",
  "job not found": "Không tìm thấy tin tuyển dụng.",
  "job already exists": "Tin tuyển dụng đã tồn tại.",
  "failed to create job": "Tạo tin tuyển dụng thất bại.",
  "failed to update job": "Cập nhật tin tuyển dụng thất bại.",
  "failed to delete job": "Xóa tin tuyển dụng thất bại.",
  "invalid job status transition":
    "Không thể chuyển trạng thái tin tuyển dụng theo cách này.",
  "expired date must be future":
    "Ngày hết hạn phải lớn hơn thời điểm hiện tại.",
  "invalid salary range": "Khoảng lương không hợp lệ.",
  "cv not found": "Không tìm thấy CV.",
  "cv already exists": "CV đã tồn tại.",
  "failed to create cv": "Tạo CV thất bại.",
  "failed to update cv": "Cập nhật CV thất bại.",
  "failed to delete cv": "Xóa CV thất bại.",
  "file too large (max 10mb)": "Dung lượng tệp quá lớn (tối đa 10MB).",
  "invalid file type (pdf/docx/doc)":
    "Định dạng tệp không hợp lệ. Chỉ chấp nhận PDF, DOCX hoặc DOC.",
  "access denied to cv": "Bạn không có quyền truy cập CV này.",
  "rate limit exceeded":
    "Bạn đã vượt quá giới hạn thao tác. Vui lòng thử lại sau.",
  "cv analysis already in progress":
    "CV đang được phân tích. Vui lòng chờ hoàn tất.",
  "cv file is missing": "Thiếu tệp CV để phân tích.",
  "failed to start cv analysis": "Không thể bắt đầu phân tích CV.",
  "career category not found": "Không tìm thấy danh mục ngành nghề.",
  "career category already exists": "Danh mục ngành nghề đã tồn tại.",
  "failed to create career category": "Tạo danh mục ngành nghề thất bại.",
  "failed to update career category": "Cập nhật danh mục ngành nghề thất bại.",
  "failed to delete career category": "Xóa danh mục ngành nghề thất bại.",
  "career category is not deleted":
    "Danh mục ngành nghề này chưa ở trạng thái đã xóa.",
  "category in use, cannot delete":
    "Danh mục đang được sử dụng nên không thể xóa.",
  "failed to restore career category":
    "Khôi phục danh mục ngành nghề thất bại.",
  "skill not found": "Không tìm thấy kỹ năng.",
  "skill already exists": "Kỹ năng đã tồn tại.",
  "failed to create skill": "Tạo kỹ năng thất bại.",
  "failed to update skill": "Cập nhật kỹ năng thất bại.",
  "failed to delete skill": "Xóa kỹ năng thất bại.",
  "skill is not deleted": "Kỹ năng này chưa ở trạng thái đã xóa.",
  "skill in use, cannot delete": "Kỹ năng đang được sử dụng nên không thể xóa.",
  "career category of this skill is deleted":
    "Danh mục ngành nghề của kỹ năng này đang ở trạng thái đã xóa.",
  "failed to restore skill": "Khôi phục kỹ năng thất bại.",
  "favourite job not found": "Không tìm thấy tin tuyển dụng đã lưu.",
  "job already in favourites": "Tin tuyển dụng này đã có trong danh sách lưu.",
  "failed to add favourite": "Thêm vào danh sách lưu thất bại.",
  "failed to remove favourite": "Xóa khỏi danh sách lưu thất bại.",
  "application not found": "Không tìm thấy hồ sơ ứng tuyển.",
  "already applied for this job": "Bạn đã ứng tuyển tin này trước đó.",
  "failed to apply": "Ứng tuyển thất bại.",
  "failed to update application": "Cập nhật hồ sơ ứng tuyển thất bại.",
  "failed to withdraw application": "Thu hồi hồ sơ ứng tuyển thất bại.",
  "job is not open": "Tin tuyển dụng hiện không mở nhận hồ sơ.",
  "application period expired": "Thời gian ứng tuyển đã hết hạn.",
  "cv already used elsewhere": "CV này đang được sử dụng ở nơi khác.",
  "cannot withdraw application now":
    "Hiện tại chưa thể thu hồi hồ sơ ứng tuyển.",
  "access denied to application":
    "Bạn không có quyền truy cập hồ sơ ứng tuyển này.",
  "invalid status transition": "Không thể chuyển trạng thái theo cách này.",
  "interview schedule required": "Vui lòng cung cấp lịch phỏng vấn.",
  "file cannot be empty": "Tệp tải lên không được để trống.",
  "file too large (max 5mb)": "Dung lượng tệp quá lớn (tối đa 5MB).",
  "invalid file type": "Định dạng tệp không hợp lệ.",
  "invalid media type": "Loại tệp media không hợp lệ.",
  "upload failed": "Tải tệp lên thất bại.",
  "cannot determine permissions":
    "Không thể xác định quyền truy cập của tài khoản.",
  "insufficient permissions":
    "Bạn không có đủ quyền để thực hiện thao tác này.",
  "invalid uuid": "Mã định danh không hợp lệ.",
  "ip address not found": "Không tìm thấy địa chỉ IP.",
  "internal server error": "Hệ thống đang gặp sự cố nội bộ.",
  "invalid input data": "Dữ liệu nhập vào không hợp lệ.",
  "system busy, try again later": "Hệ thống đang bận. Vui lòng thử lại sau.",
};

function normalizeApiErrorMessage(message: string): string {
  return message.trim().replace(/\s+/g, " ").toLowerCase();
}

function containsNonAsciiCharacter(value: string): boolean {
  return /[^\x00-\x7F]/.test(value);
}

export function resolveApiErrorMessage(
  message?: string,
  statusCode?: number,
): string {
  if (message) {
    const normalizedMessage = normalizeApiErrorMessage(message);
    const mappedMessage = API_ERROR_MESSAGE_MAP[normalizedMessage];

    if (mappedMessage) {
      return mappedMessage;
    }

    if (containsNonAsciiCharacter(message)) {
      return message.trim();
    }
  }

  if (statusCode && API_ERROR_STATUS_MESSAGES[statusCode]) {
    return API_ERROR_STATUS_MESSAGES[statusCode];
  }

  return GENERIC_API_ERROR_MESSAGE;
}

export {
  API_ERROR_MESSAGE_MAP,
  API_ERROR_STATUS_MESSAGES,
  GENERIC_API_ERROR_MESSAGE,
};
