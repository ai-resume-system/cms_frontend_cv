"use client";

import React, { useState, useEffect } from "react";
import { apiService } from "@/services/api-service";
import { API_ENDPOINTS } from "@/constants/constants/api";
import { CareerCategory } from "@/types/category";
import { ECareerCategoriesStatus } from "@/constants/enums/category.enum";
import { toast } from "react-toastify";
import { Pagination } from "@/components/ui/Pagination";
import {
  FolderTree,
  Briefcase,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Plus,
  X,
  Loader2,
} from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CareerCategory[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // States cho Modal Thêm/Sửa
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CareerCategory | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: ECareerCategoriesStatus.ACTIVE,
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  // Dữ liệu mẫu dự phòng (Mock Data)
  const mockCategories: CareerCategory[] = [
    {
      id: "CAT-001",
      name: "Công nghệ thông tin",
      slug: "cong-nghe-thong-tin",
      description: "Lập trình, mạng máy tính, AI và an ninh mạng",
      status: ECareerCategoriesStatus.ACTIVE,
      createdAt: "2026-05-10T08:00:00Z",
      updatedAt: "2026-05-10T08:00:00Z",
      deletedAt: null,
      _count: { jobs: 452 },
    },
    {
      id: "CAT-002",
      name: "Thiết kế Đồ họa",
      slug: "thiet-ke-do-hoa",
      description: "Thiết kế UI/UX, đồ họa 3D, branding",
      status: ECareerCategoriesStatus.ACTIVE,
      createdAt: "2026-05-11T09:00:00Z",
      updatedAt: "2026-05-11T09:00:00Z",
      deletedAt: null,
      _count: { jobs: 218 },
    },
    {
      id: "CAT-003",
      name: "Marketing & Sales",
      slug: "marketing-sales",
      description: "Truyền thông, quảng cáo kỹ thuật số, bán hàng",
      status: ECareerCategoriesStatus.ACTIVE,
      createdAt: "2026-05-12T10:00:00Z",
      updatedAt: "2026-05-12T10:00:00Z",
      deletedAt: null,
      _count: { jobs: 312 },
    },
    {
      id: "CAT-004",
      name: "Tài chính & Ngân hàng",
      slug: "tai-chinh-ngan-hang",
      description: "Kế toán, phân tích tài chính, ngân hàng",
      status: ECareerCategoriesStatus.INACTIVE,
      createdAt: "2026-05-13T11:00:00Z",
      updatedAt: "2026-05-13T11:00:00Z",
      deletedAt: null,
      _count: { jobs: 84 },
    },
    {
      id: "CAT-005",
      name: "Y tế & Chăm sóc sức khỏe",
      slug: "y-te-cham-soc-suc-khoe",
      description: "Bác sĩ, dược sĩ, thiết bị y tế",
      status: ECareerCategoriesStatus.ACTIVE,
      createdAt: "2026-05-14T12:00:00Z",
      updatedAt: "2026-05-14T12:00:00Z",
      deletedAt: null,
      _count: { jobs: 156 },
    },
  ];

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });

      const response = await apiService.get<{
        data: CareerCategory[];
        pagination: { totalItems: number; totalPages: number };
      }>(`${API_ENDPOINTS.CATEGORIES.LIST}?${queryParams.toString()}`, {
        auth: true,
      });

      const res = response as unknown as {
        data: CareerCategory[];
        pagination: { totalItems: number; totalPages: number };
      };

      if (res && res.data) {
        setCategories(res.data);
        setTotalItems(res.pagination.totalItems);
        setTotalPages(res.pagination.totalPages);
      } else {
        setCategories([]);
        setTotalItems(0);
        setTotalPages(0);
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Không thể tải danh sách ngành nghề.");
      setCategories([]);
      setTotalItems(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [page, limit]);

  const handleOpenModal = (category: CareerCategory | null = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        status: category.status,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: "",
        description: "",
        status: ECareerCategoriesStatus.ACTIVE,
      });
    }
    setIsOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setEditingCategory(null);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Vui lòng nhập tên danh mục.");
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingCategory) {
        // Cập nhật danh mục
        await apiService.patch(
          API_ENDPOINTS.CATEGORIES.UPDATE(editingCategory.id),
          formData,
          { auth: true },
        );
        toast.success("Cập nhật danh mục ngành nghề thành công!");

        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? { ...c, ...formData } : c,
          ),
        );
      } else {
        // Tạo mới danh mục
        const newCat = await apiService.post<CareerCategory>(
          API_ENDPOINTS.CATEGORIES.CREATE,
          formData,
          { auth: true },
        );
        toast.success("Thêm danh mục ngành nghề mới thành công!");

        setCategories((prev) => [newCat, ...prev]);
        setTotalItems((prev) => prev + 1);
      }
      handleCloseModal();
      fetchCategories(); // Reload danh sách để cập nhật dữ liệu mới nhất
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Thao tác thất bại. Vui lòng kiểm tra lại!");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa danh mục ngành nghề này không?",
      )
    )
      return;

    try {
      await apiService.delete(API_ENDPOINTS.CATEGORIES.DELETE(id), {
        auth: true,
      });
      toast.success("Xóa danh mục ngành nghề thành công!");
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setTotalItems((prev) => Math.max(prev - 1, 0));
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(err.message || "Xóa danh mục ngành nghề thất bại!");
    }
  };

  const activeCount = categories.filter(
    (c) => c.status === ECareerCategoriesStatus.ACTIVE,
  ).length;
  const inactiveCount = categories.filter(
    (c) => c.status === ECareerCategoriesStatus.INACTIVE,
  ).length;
  const totalJobsCount = categories.reduce(
    (sum, c) => sum + (c._count?.jobs || 0),
    0,
  );

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 text-left">
        <div>
          <h2 className="font-headline text-xl sm:text-2xl font-bold text-on-surface">
            Quản lý danh mục ngành nghề
          </h2>
          <p className="font-sans text-xs text-on-surface-variant mt-1">
            Quản lý các ngành nghề và danh mục công việc trong hệ thống FUSE.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-container text-white px-4 sm:px-5 py-2.5 rounded-lg font-sans text-xs font-semibold transition-all active:scale-95 shadow-sm shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Thêm danh mục mới
        </button>
      </div>

      {/* Stats Bento Box */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        <div className="bg-surface-container-lowest p-3 sm:p-4 md:p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <FolderTree className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-left">
            <p className="text-on-surface-variant font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Tổng danh mục
            </p>
            <p className="text-xl sm:text-2xl font-headline font-extrabold text-on-surface mt-0.5">
              {totalItems}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-3 sm:p-4 md:p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-left">
            <p className="text-on-surface-variant font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Tổng số công việc
            </p>
            <p className="text-xl sm:text-2xl font-headline font-extrabold text-on-surface mt-0.5">
              {totalJobsCount}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-3 sm:p-4 md:p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Eye className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-left">
            <p className="text-on-surface-variant font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Đang hiển thị
            </p>
            <p className="text-xl sm:text-2xl font-headline font-extrabold text-on-surface mt-0.5">
              {activeCount}
            </p>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-3 sm:p-4 md:p-6 rounded-xl border border-outline-variant shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-error/10 flex items-center justify-center text-error shrink-0">
            <EyeOff className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="text-left">
            <p className="text-on-surface-variant font-sans text-[10px] sm:text-xs font-semibold uppercase tracking-wider">
              Đã ẩn
            </p>
            <p className="text-xl sm:text-2xl font-headline font-extrabold text-on-surface mt-0.5">
              {inactiveCount}
            </p>
          </div>
        </div>
      </section>

      {/* Categories Table Section */}
      <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="p-3 sm:p-4 border-b border-outline-variant bg-surface-container-low flex items-center justify-between">
          <h3 className="font-headline text-sm sm:text-lg font-bold text-on-surface">
            Danh sách ngành nghề
          </h3>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-16 sm:py-20 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-7 sm:w-8 h-7 sm:h-8 text-primary animate-spin" />
              <p className="font-sans text-xs text-on-surface-variant font-medium">
                Đang tải danh sách danh mục...
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="bg-surface-container-low text-on-surface-variant font-sans text-[10px] sm:text-xs font-bold border-b border-outline-variant">
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider">
                    Tên danh mục
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider text-center">
                    Số lượng công việc
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 font-bold uppercase tracking-wider text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant font-sans text-xs">
                {categories.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="text-center py-10 font-medium text-on-surface-variant"
                    >
                      Chưa có danh mục ngành nghề nào.
                    </td>
                  </tr>
                ) : (
                  categories.map((item, index) => (
                    <tr
                      key={item.id}
                      className={`hover:bg-surface-container-low transition-colors ${
                        index % 2 === 1 ? "bg-surface-container-low/10" : ""
                      }`}
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span className="font-bold text-on-surface">
                          {item.name}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-center font-bold text-on-surface-variant">
                        {item._count?.jobs || 0}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            item.status === ECareerCategoriesStatus.ACTIVE
                              ? "bg-secondary/10 text-secondary border-secondary/20"
                              : "bg-outline-variant/30 text-on-surface-variant border-outline-variant/50"
                          }`}
                        >
                          {item.status === ECareerCategoriesStatus.ACTIVE
                            ? "Hiển thị"
                            : "Đang ẩn"}
                        </span>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-on-surface-variant max-w-[200px] sm:max-w-[300px] truncate text-left">
                        {item.description || "Chưa có mô tả"}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-2 text-primary bg-primary/5 hover:bg-primary/10 rounded-lg border border-primary/20 transition-all active:scale-90"
                            title="Sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 text-error bg-error/5 hover:bg-error/10 rounded-lg border border-error/20 transition-all active:scale-90"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-3 sm:px-6 py-3 sm:py-4 border-t border-outline-variant flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="text-on-surface-variant font-sans text-[10px] sm:text-xs font-semibold whitespace-nowrap">
              Hiển thị {categories.length} danh mục
            </p>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="px-2 sm:px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest font-sans text-[10px] sm:text-xs font-semibold focus:border-primary outline-none"
            >
              {[10, 15, 20, 50, 100].map((opt) => (
                <option key={opt} value={opt}>
                  {opt} / trang
                </option>
              ))}
            </select>
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            disabled={isLoading}
          />
        </div>
      </section>

      {/* Modal Thêm / Sửa Danh Mục */}
      {isOpenModal && (
        <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-outline-variant flex items-center justify-between bg-surface-container-low">
              <h3 className="font-headline text-md font-bold text-on-surface">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-on-surface-variant hover:bg-surface-container-highest transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form
              onSubmit={handleSubmit}
              className="p-4 sm:p-6 flex flex-col gap-4 text-left"
            >
              {/* Name */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-sans text-xs font-bold text-on-surface-variant"
                  htmlFor="modal-name"
                >
                  Tên danh mục <span className="text-error">*</span>
                </label>
                <input
                  id="modal-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-transparent font-sans text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  placeholder="Nhập tên ngành nghề (VD: Công nghệ thông tin)"
                  required
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-sans text-xs font-bold text-on-surface-variant"
                  htmlFor="modal-desc"
                >
                  Mô tả
                </label>
                <textarea
                  id="modal-desc"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-transparent font-sans text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all resize-none"
                  placeholder="Nhập mô tả tóm tắt cho ngành nghề này..."
                />
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1.5">
                <label
                  className="font-sans text-xs font-bold text-on-surface-variant"
                  htmlFor="modal-status"
                >
                  Trạng thái hiển thị
                </label>
                <select
                  id="modal-status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-outline-variant bg-transparent font-sans text-xs outline-none focus:border-primary transition-all font-semibold"
                >
                  <option value={ECareerCategoriesStatus.ACTIVE}>
                    Hiển thị hệ thống
                  </option>
                  <option value={ECareerCategoriesStatus.INACTIVE}>
                    Tạm ẩn danh mục
                  </option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-lg border border-outline-variant hover:bg-surface-container-low font-sans text-xs font-semibold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-container text-white rounded-lg font-sans text-xs font-semibold active:scale-95 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  {submitLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : editingCategory ? (
                    "Lưu thay đổi"
                  ) : (
                    "Thêm danh mục"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
