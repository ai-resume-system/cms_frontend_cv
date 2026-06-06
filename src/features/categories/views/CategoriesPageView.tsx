"use client";

import {
  Check,
  Edit,
  Eye,
  EyeOff,
  Folder,
  FolderOpen,
  FolderTree,
  Loader2,
  Plus,
  Search,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";

import { BaseTable, type TableColumn } from "@/components/ui/BaseTable";
import { Pagination } from "@/components/ui/Pagination";
import {
  ECareerCategoriesStatus,
  ECareerCategoriesStatusLabels,
} from "@/constants/enums/category.enum";
import { showErrorToast, showSuccessToast } from "@/lib/ui/toast";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "@/services/category.service";
import {
  createSkill,
  deleteSkill,
  getAdminSkills,
  updateSkill,
} from "@/services/skill.service";
import type { CareerCategory } from "@/types/category";
import type { Skill } from "@/types/skill";

export function CategoriesPageView() {
  const [categories, setCategories] = useState<CareerCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<
    CareerCategory[]
  >([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all"); // all, active, inactive, deleted
  const [search, setSearch] = useState("");

  // Modal ngành nghề
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

  const [isOpenSkillModal, setIsOpenSkillModal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<CareerCategory | null>(null);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(false);

  // States mới cho quản lý kỹ năng 2 cột
  const [activeParentSkill, setActiveParentSkill] = useState<Skill | null>(
    null,
  );
  const [parentSearch, setParentSearch] = useState("");
  const [newParentName, setNewParentName] = useState("");
  const [newChildName, setNewChildName] = useState("");
  const [inlineEditingSkillId, setInlineEditingSkillId] = useState<
    string | null
  >(null);
  const [inlineEditName, setInlineEditName] = useState("");
  const [skillSubmitLoading, setSkillSubmitLoading] = useState(false);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCategories({
        page: 1,
        limit: 1000,
      });

      setCategories(response.data || []);
      setTotalItems(response.pagination?.totalItems ?? 0);
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Không thể tải danh sách ngành nghề.");
      setCategories([]);
      setTotalItems(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    let result = [...categories];

    if (search.trim()) {
      const keyword = search.toLowerCase().trim();
      result = result.filter((c) => c.name.toLowerCase().includes(keyword));
    }

    if (statusFilter === "active") {
      result = result.filter(
        (c) => c.status === ECareerCategoriesStatus.ACTIVE && !c.deletedAt,
      );
    } else if (statusFilter === "inactive") {
      result = result.filter(
        (c) => c.status === ECareerCategoriesStatus.INACTIVE && !c.deletedAt,
      );
    } else if (statusFilter === "deleted") {
      result = result.filter((c) => !!c.deletedAt);
    }

    setTotalPages(Math.ceil(result.length / limit));

    // Cắt trang
    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    setFilteredCategories(result.slice(startIdx, endIdx));
  }, [categories, search, statusFilter, page, limit]);

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
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      showErrorToast("Vui lòng nhập tên danh mục.");
      return;
    }

    setSubmitLoading(true);
    try {
      if (editingCategory) {
        const updatedCategory = await updateCategory(
          editingCategory.id,
          formData,
        );
        showSuccessToast("Cập nhật danh mục ngành nghề thành công!");

        setCategories((prev) =>
          prev.map((category) =>
            category.id === editingCategory.id ? updatedCategory : category,
          ),
        );
      } else {
        const newCategory = await createCategory(formData);
        showSuccessToast("Thêm danh mục ngành nghề mới thành công!");
        setCategories((prev) => [newCategory, ...prev]);
      }

      handleCloseModal();
      void fetchCategories();
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(
        err.message || "Thao tác thất bại. Vui lòng kiểm tra lại!",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn xóa danh mục ngành nghề này không?",
      )
    ) {
      return;
    }

    try {
      await deleteCategory(id);
      showSuccessToast("Xóa danh mục ngành nghề thành công!");
      void fetchCategories();
    } catch (error: unknown) {
      const err = error as { message?: string };
      // Hiển thị trực tiếp cảnh báo lỗi từ backend khi xóa bản ghi đang được sử dụng
      showErrorToast(err.message || "Xóa danh mục ngành nghề thất bại!");
    }
  };

  // ─────────────────────────────────────────
  // QUẢN LÝ KỸ NĂNG TRONG MODAL
  // ─────────────────────────────────────────
  const handleOpenSkillModal = async (category: CareerCategory) => {
    setSelectedCategory(category);
    setIsOpenSkillModal(true);
    setActiveParentSkill(null);
    setParentSearch("");
    setNewParentName("");
    setNewChildName("");
    setInlineEditingSkillId(null);
    setInlineEditName("");
    void loadSkills(category.id);
  };

  const handleCloseSkillModal = () => {
    setIsOpenSkillModal(false);
    setSelectedCategory(null);
    setSkills([]);
    setActiveParentSkill(null);
    setParentSearch("");
    setNewParentName("");
    setNewChildName("");
    setInlineEditingSkillId(null);
    setInlineEditName("");
  };

  const loadSkills = async (
    categoryId: string,
    activeParentIdToSet?: string,
  ) => {
    setSkillsLoading(true);
    try {
      const response = await getAdminSkills({
        careerCategoryId: categoryId,
        limit: 1000, // Lấy toàn bộ skill
      });
      const data = response.data || [];
      setSkills(data);

      const parentSkills = data;
      if (activeParentIdToSet) {
        const found = parentSkills.find((s) => s.id === activeParentIdToSet);
        if (found) {
          setActiveParentSkill(found);
        } else {
          setActiveParentSkill(parentSkills[0] || null);
        }
      } else {
        setActiveParentSkill((prev) => {
          if (prev) {
            const stillExists = parentSkills.find((s) => s.id === prev.id);
            if (stillExists) return stillExists;
          }
          return parentSkills[0] || null;
        });
      }
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Không thể tải danh sách kỹ năng.");
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleStartInlineEdit = (skill: Skill) => {
    setInlineEditingSkillId(skill.id);
    setInlineEditName(skill.name);
  };

  const handleCancelInlineEdit = () => {
    setInlineEditingSkillId(null);
    setInlineEditName("");
  };

  const handleSaveInlineEdit = async (skill: Skill) => {
    if (!inlineEditName.trim()) {
      showErrorToast("Tên kỹ năng không được để trống.");
      return;
    }
    if (!selectedCategory) return;

    try {
      await updateSkill(skill.id, {
        name: inlineEditName.trim(),
      });
      showSuccessToast("Cập nhật tên kỹ năng thành công!");
      setInlineEditingSkillId(null);
      setInlineEditName("");
      void loadSkills(selectedCategory.id);
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Cập nhật kỹ năng thất bại.");
    }
  };

  const handleAddParentSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !newParentName.trim()) return;

    setSkillSubmitLoading(true);
    try {
      const response = await createSkill({
        name: newParentName.trim(),
        careerCategoryId: selectedCategory.id,
      });
      showSuccessToast("Thêm nhóm kỹ năng thành công!");
      setNewParentName("");
      void loadSkills(selectedCategory.id, response.id);
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Thêm nhóm kỹ năng thất bại.");
    } finally {
      setSkillSubmitLoading(false);
    }
  };

  const handleAddChildSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !activeParentSkill || !newChildName.trim()) return;

    setSkillSubmitLoading(true);
    try {
      await createSkill({
        name: newChildName.trim(),
        careerCategoryId: selectedCategory.id,
        parentId: activeParentSkill.id,
      });
      showSuccessToast("Thêm kỹ năng chi tiết thành công!");
      setNewChildName("");
      void loadSkills(selectedCategory.id, activeParentSkill.id);
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Thêm kỹ năng chi tiết thất bại.");
    } finally {
      setSkillSubmitLoading(false);
    }
  };

  const handleInlineDeleteSkill = async (skillId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa kỹ năng này không?")) {
      return;
    }
    if (!selectedCategory) return;
    try {
      await deleteSkill(skillId);
      showSuccessToast("Xóa kỹ năng thành công!");
      if (activeParentSkill && activeParentSkill.id === skillId) {
        setActiveParentSkill(null);
      }
      void loadSkills(selectedCategory.id);
    } catch (error: unknown) {
      const err = error as { message?: string };
      showErrorToast(err.message || "Xóa kỹ năng thất bại.");
    }
  };

  // Tính toán số liệu thống kê ở các thẻ
  const activeCategoriesCount = categories.filter(
    (c) => c.status === ECareerCategoriesStatus.ACTIVE && !c.deletedAt,
  ).length;

  const inactiveCategoriesCount = categories.filter(
    (c) => c.status === ECareerCategoriesStatus.INACTIVE && !c.deletedAt,
  ).length;

  const deletedCategoriesCount = categories.filter((c) => !!c.deletedAt).length;

  const totalJobsCount = categories.reduce(
    (sum, c) => sum + (c._count?.jobs || 0),
    0,
  );

  // Cấu hình các cột cho BaseTable
  const columns: TableColumn<CareerCategory>[] = [
    {
      key: "name",
      header: "Tên danh mục",
      render: (item) => (
        <span
          className={`font-bold ${item.deletedAt ? "text-on-surface-variant line-through opacity-60" : "text-on-surface"}`}
        >
          {item.name}
        </span>
      ),
    },
    {
      key: "jobCount",
      header: "Số lượng công việc",
      align: "center",
      render: (item) => (
        <span className="font-bold text-on-surface-variant">
          {item._count?.jobs || 0}
        </span>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (item) => {
        if (item.deletedAt) {
          return (
            <span className="inline-flex items-center rounded-full border border-error/20 bg-error/10 px-2.5 py-0.5 text-[10px] font-bold text-error">
              Đã xóa mềm
            </span>
          );
        }

        const label = ECareerCategoriesStatusLabels[item.status] || item.status;
        return (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${
              item.status === ECareerCategoriesStatus.ACTIVE
                ? "border-secondary/20 bg-secondary/10 text-secondary"
                : "border-outline-variant bg-surface-container-low text-on-surface-variant"
            }`}
          >
            {label}
          </span>
        );
      },
    },
    {
      key: "description",
      header: "Mô tả",
      render: (item) => (
        <span className="text-on-surface-variant truncate block max-w-[200px] sm:max-w-[300px]">
          {item.description || "Chưa có mô tả"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      render: (item) => (
        <div className="flex items-center justify-end gap-2">
          {/* Nút quản lý kỹ năng */}
          <button
            onClick={() => handleOpenSkillModal(item)}
            className="rounded-lg border border-green-500/20 bg-green-500/5 p-2 text-green-500 transition-all active:scale-90 hover:bg-green-500/10 cursor-pointer"
            title="Quản lý kỹ năng"
          >
            <FolderTree className="h-4 w-4" />
          </button>

          {/* Sửa / Xóa chỉ hiện nếu chưa bị xóa mềm */}
          {!item.deletedAt && (
            <>
              <button
                onClick={() => handleOpenModal(item)}
                className="rounded-lg border border-primary/20 bg-primary/5 p-2 text-primary transition-all active:scale-90 hover:bg-primary/10 cursor-pointer"
                title="Sửa"
              >
                <Edit className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="rounded-lg border border-error/20 bg-error/5 p-2 text-error transition-all active:scale-90 hover:bg-error/10 cursor-pointer"
                title="Xóa"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Đã chuyển phần hiển thị kỹ năng sang dạng 2 cột trực tiếp trong Modal

  return (
    <div className="flex flex-col gap-4 sm:gap-6">
      {/* Title block */}
      <div className="flex flex-col items-start justify-between gap-3 text-left sm:flex-row sm:items-center sm:gap-4">
        <div>
          <h2 className="font-headline text-xl font-bold text-on-surface sm:text-2xl">
            Danh mục ngành nghề
          </h2>
        </div>
        <button
          onClick={() => handleOpenModal(null)}
          className="flex shrink-0 self-start rounded-lg bg-primary px-4 py-2.5 font-sans text-xs font-semibold text-white shadow-sm transition-all active:scale-95 hover:bg-primary-container cursor-pointer sm:self-auto sm:px-5"
        >
          <Plus className="h-4 w-4" />
          <span className="ml-2">Thêm danh mục mới</span>
        </button>
      </div>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 md:gap-6">
        <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-12 sm:w-12">
            <FolderTree className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-left">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant sm:text-xs">
              Tổng danh mục
            </p>
            <p className="mt-0.5 font-headline text-lg font-extrabold text-on-surface sm:text-xl">
              {totalItems}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:h-12 sm:w-12">
            <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-left">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant sm:text-xs">
              Đang hiển thị
            </p>
            <p className="mt-0.5 font-headline text-lg font-extrabold text-on-surface sm:text-xl">
              {activeCategoriesCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-outline/20 text-on-surface-variant sm:h-12 sm:w-12">
            <EyeOff className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-left">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant sm:text-xs">
              Tạm ẩn
            </p>
            <p className="mt-0.5 font-headline text-lg font-extrabold text-on-surface sm:text-xl">
              {inactiveCategoriesCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-3 shadow-sm transition-shadow hover:shadow-md sm:p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-error/10 text-error sm:h-12 sm:w-12">
            <Trash2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <div className="text-left">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant sm:text-xs">
              Đã xóa mềm
            </p>
            <p className="mt-0.5 font-headline text-lg font-extrabold text-on-surface sm:text-xl">
              {deletedCategoriesCount}
            </p>
          </div>
        </div>
      </section>

      {/* Filter status & Table block */}
      <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
        <div className="flex flex-col items-start justify-between gap-3 border-b border-outline-variant bg-surface-container-low p-3 sm:flex-row sm:items-center sm:p-4">
          <h3 className="font-headline text-sm font-bold text-on-surface sm:text-base">
            Danh sách ngành nghề
          </h3>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center w-full sm:w-auto">
            {/* Ô tìm kiếm ngành nghề */}
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-full rounded-lg border border-outline-variant bg-white py-1.5 pl-9 pr-8 font-sans text-xs outline-none transition-all placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Tìm tên ngành nghề..."
                type="text"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-on-surface-variant hover:bg-surface-container-high active:scale-95 transition-colors cursor-pointer"
                  title="Xóa tìm kiếm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Bộ lọc trạng thái */}
            <div className="flex rounded-lg bg-surface-container-low p-1 gap-1 shrink-0">
              {[
                { key: "all", label: "Tất cả" },
                { key: "active", label: "Hoạt động" },
                { key: "inactive", label: "Tạm ẩn" },
                { key: "deleted", label: "Đã xóa mềm" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => {
                    setStatusFilter(filter.key);
                    setPage(1);
                  }}
                  className={`rounded px-2.5 py-1 text-[10px] font-bold transition-all sm:px-3 sm:text-xs cursor-pointer ${
                    statusFilter === filter.key
                      ? "bg-white text-primary shadow-sm"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <BaseTable
          columns={columns}
          data={filteredCategories}
          isLoading={isLoading}
          emptyMessage="Chưa có danh mục ngành nghề nào."
          minWidth="min-w-[640px]"
        />

        {/* Footer Pagination */}
        <div className="flex flex-col items-start justify-between gap-3 border-t border-outline-variant px-3 py-3 sm:flex-row sm:items-center sm:px-6 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <p className="whitespace-nowrap font-sans text-[10px] font-semibold text-on-surface-variant sm:text-xs">
              Hiển thị {filteredCategories.length} danh mục
            </p>
            <select
              value={limit}
              onChange={(event) => {
                setLimit(Number(event.target.value));
                setPage(1);
              }}
              className="rounded-lg border border-outline-variant bg-surface-container-lowest px-2 py-1.5 font-sans text-[10px] font-semibold outline-none focus:border-primary sm:px-3 sm:text-xs cursor-pointer"
            >
              {[10, 15, 20, 50, 100].map((option) => (
                <option key={option} value={option}>
                  {option} / trang
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

      {/* Modal Thêm / Sửa ngành nghề */}
      {isOpenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-4 py-3 sm:px-6 sm:py-4">
              <h3 className="font-headline text-md font-bold text-on-surface">
                {editingCategory ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="rounded-lg p-1 text-on-surface-variant transition-colors hover:bg-surface-container-highest cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-4 p-4 text-left sm:p-6"
            >
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
                  className="w-full rounded-lg border border-outline-variant bg-transparent px-4 py-2.5 font-sans text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Nhập tên ngành nghề (VD: Công nghệ thông tin)"
                  required
                />
              </div>

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
                  className="w-full resize-none rounded-lg border border-outline-variant bg-transparent px-4 py-2.5 font-sans text-xs outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Nhập mô tả tóm tắt cho ngành nghề này..."
                />
              </div>

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
                  className="w-full rounded-lg border border-outline-variant bg-transparent px-4 py-2.5 font-sans text-xs font-semibold outline-none transition-all focus:border-primary cursor-pointer"
                >
                  <option value={ECareerCategoriesStatus.ACTIVE}>
                    Hiển thị hệ thống
                  </option>
                  <option value={ECareerCategoriesStatus.INACTIVE}>
                    Tạm ẩn danh mục
                  </option>
                </select>
              </div>

              <div className="mt-4 flex justify-end gap-3 border-t border-outline-variant pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg border border-outline-variant px-4 py-2.5 font-sans text-xs font-semibold transition-colors hover:bg-surface-container-low cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2.5 font-sans text-xs font-semibold text-white shadow-sm transition-all active:scale-95 hover:bg-primary-container cursor-pointer"
                >
                  {submitLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
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

      {/* Modal Quản lý Kỹ năng (Custom modal dạng 2 cột nâng cấp) */}
      {isOpenSkillModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-on-surface/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-5xl overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-outline-variant bg-surface-container-low px-5 py-4 sm:px-6">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FolderTree className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-headline text-base font-extrabold text-on-surface">
                    Quản lý kỹ năng ngành nghề
                  </h3>
                  <p className="font-sans text-xs text-on-surface-variant font-medium">
                    Ngành nghề:{" "}
                    <span className="font-bold text-primary">
                      {selectedCategory.name}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseSkillModal}
                className="rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-highest cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant/60 h-[520px]">
              {/* CỘT TRÁI: NHÓM KỸ NĂNG (CHA) - Nền xám dịu nhẹ phân cấp */}
              <div className="p-5 flex flex-col gap-4 bg-surface-container-low/20 overflow-hidden h-full">
                <div className="flex flex-col gap-2.5 shrink-0">
                  <h4 className="font-headline text-xs font-bold text-primary uppercase tracking-wider">
                    Nhóm kỹ năng cha
                  </h4>

                  {/* Tìm kiếm nhóm */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-on-surface-variant/70" />
                    <input
                      value={parentSearch}
                      onChange={(e) => setParentSearch(e.target.value)}
                      className="w-full rounded-lg border border-outline-variant bg-white pl-9 pr-3 py-1.5 font-sans text-xs outline-none focus:border-primary transition-colors placeholder:text-outline"
                      placeholder="Tìm nhóm kỹ năng..."
                      type="text"
                    />
                  </div>

                  {/* Thêm nhanh nhóm mới */}
                  <form onSubmit={handleAddParentSkill} className="flex gap-2">
                    <input
                      value={newParentName}
                      onChange={(e) => setNewParentName(e.target.value)}
                      className="flex-1 rounded-lg border border-outline-variant bg-white px-3 py-1.5 font-sans text-xs outline-none focus:border-primary transition-colors"
                      placeholder="Tên nhóm mới (VD: Frontend)..."
                      type="text"
                      required
                    />
                    <button
                      type="submit"
                      disabled={skillSubmitLoading}
                      className="flex items-center justify-center rounded-lg bg-primary hover:bg-primary-container text-white px-3.5 py-1.5 transition-colors cursor-pointer shrink-0"
                      title="Thêm nhóm"
                    >
                      {skillSubmitLoading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </form>
                </div>

                {/* Danh sách nhóm kỹ năng */}
                <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5">
                  {skillsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="font-sans text-xs text-on-surface-variant">
                        Đang tải danh sách...
                      </span>
                    </div>
                  ) : (
                    (() => {
                      const parentSkills = skills.filter((s) =>
                        s.name
                          .toLowerCase()
                          .includes(parentSearch.toLowerCase()),
                      );

                      if (parentSkills.length === 0) {
                        return (
                          <div className="py-12 text-center text-on-surface-variant text-xs border border-dashed border-outline-variant/60 rounded-xl bg-white/50">
                            Chưa có nhóm kỹ năng nào.
                          </div>
                        );
                      }

                      return parentSkills.map((parent) => {
                        const isActive = activeParentSkill?.id === parent.id;
                        const isEditing = inlineEditingSkillId === parent.id;

                        // Tính toán số lượng con trực thuộc nhóm cha này
                        const childCount = parent.children?.length ?? 0;

                        return (
                          <div
                            key={parent.id}
                            onClick={() => {
                              if (!isEditing) {
                                setActiveParentSkill(parent);
                              }
                            }}
                            className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer border transition-all ${
                              isActive
                                ? "bg-primary/10 text-primary font-bold border-primary/20 shadow-xs"
                                : "hover:bg-white text-on-surface border-transparent hover:border-outline-variant/30 hover:shadow-xs"
                            }`}
                          >
                            {isEditing ? (
                              <div
                                className="flex items-center gap-1.5 w-full"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <input
                                  value={inlineEditName}
                                  onChange={(e) =>
                                    setInlineEditName(e.target.value)
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      void handleSaveInlineEdit(parent);
                                    if (e.key === "Escape")
                                      handleCancelInlineEdit();
                                  }}
                                  className="flex-1 rounded-lg border border-primary bg-white px-2.5 py-1 font-sans text-xs outline-none focus:ring-1 focus:ring-primary shadow-xs"
                                  autoFocus
                                />
                                <button
                                  onClick={() =>
                                    void handleSaveInlineEdit(parent)
                                  }
                                  className="p-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors cursor-pointer"
                                  title="Lưu"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={handleCancelInlineEdit}
                                  className="p-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                  title="Hủy"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 min-w-0">
                                  <Folder
                                    className={`h-4 w-4 shrink-0 ${isActive ? "text-primary" : "text-slate-400"}`}
                                  />
                                  <span className="text-xs truncate font-medium">
                                    {parent.name}
                                  </span>
                                  <span
                                    className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold ${isActive ? "bg-primary/20 text-primary" : "bg-slate-100 text-slate-500"}`}
                                  >
                                    {childCount}
                                  </span>
                                </div>
                                {/* Chỉ hiển thị các nút thao tác khi hover vào dòng */}
                                <div
                                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() =>
                                      handleStartInlineEdit(parent)
                                    }
                                    className="p-1 rounded-lg text-primary hover:bg-primary/10 cursor-pointer"
                                    title="Sửa tên nhóm"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() =>
                                      void handleInlineDeleteSkill(parent.id)
                                    }
                                    className="p-1 rounded-lg text-error hover:bg-error/10 cursor-pointer"
                                    title="Xóa nhóm"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      });
                    })()
                  )}
                </div>
              </div>

              {/* CỘT PHẢI: KỸ NĂNG CHI TIẾT (CON) - Nền trắng sạch sẽ */}
              <div className="p-5 flex flex-col gap-4 overflow-hidden h-full bg-white">
                {!activeParentSkill ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-6 gap-3 text-slate-400">
                    <div className="p-4 rounded-full bg-slate-50 text-slate-300">
                      <FolderOpen className="h-10 w-10" />
                    </div>
                    <p className="font-sans text-xs font-bold text-slate-500">
                      Chưa chọn nhóm kỹ năng
                    </p>
                    <p className="font-sans text-[10px] max-w-[220px] leading-relaxed">
                      Vui lòng chọn một Nhóm kỹ năng ở cột bên trái để quản lý
                      danh sách kỹ năng chi tiết.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-4 overflow-hidden h-full">
                    <div className="flex flex-col gap-2.5 shrink-0">
                      <div className="flex flex-col">
                        <span className="font-sans text-[10px] text-on-surface-variant/80 font-bold uppercase tracking-wider">
                          Kỹ năng chi tiết thuộc
                        </span>
                        <h4 className="font-headline text-sm font-extrabold text-primary truncate">
                          {activeParentSkill.name}
                        </h4>
                      </div>

                      {/* Thêm nhanh kỹ năng con mới */}
                      <form
                        onSubmit={handleAddChildSkill}
                        className="flex gap-2"
                      >
                        <input
                          value={newChildName}
                          onChange={(e) => setNewChildName(e.target.value)}
                          className="flex-1 rounded-lg border border-outline-variant bg-transparent px-3 py-1.5 font-sans text-xs outline-none focus:border-primary transition-colors"
                          placeholder={`Thêm kỹ năng chi tiết cho nhóm...`}
                          type="text"
                          required
                        />
                        <button
                          type="submit"
                          disabled={skillSubmitLoading}
                          className="flex items-center justify-center rounded-lg bg-primary hover:bg-primary-container text-white px-3.5 py-1.5 transition-colors cursor-pointer shrink-0"
                          title="Thêm kỹ năng chi tiết"
                        >
                          {skillSubmitLoading ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </form>
                    </div>

                    {/* Danh sách kỹ năng con */}
                    <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1.5">
                      {skillsLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-2">
                          <Loader2 className="h-5 w-5 animate-spin text-primary" />
                          <span className="font-sans text-xs text-on-surface-variant">
                            Đang tải danh sách...
                          </span>
                        </div>
                      ) : (
                        (() => {
                          const childSkills = activeParentSkill.children ?? [];

                          if (childSkills.length === 0) {
                            return (
                              <div className="py-12 text-center text-on-surface-variant text-xs border border-dashed border-outline-variant/60 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center gap-1">
                                <span className="font-semibold text-slate-500">
                                  Chưa có kỹ năng chi tiết.
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  Hãy thêm mới kỹ năng đầu tiên bằng ô nhập phía
                                  trên!
                                </span>
                              </div>
                            );
                          }

                          return childSkills.map((child) => {
                            const isEditing = inlineEditingSkillId === child.id;

                            return (
                              <div
                                key={child.id}
                                className="group flex items-center justify-between p-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low/30 hover:bg-surface-container-low/60 hover:shadow-xs transition-all text-on-surface"
                              >
                                {isEditing ? (
                                  <div className="flex items-center gap-1.5 w-full">
                                    <input
                                      value={inlineEditName}
                                      onChange={(e) =>
                                        setInlineEditName(e.target.value)
                                      }
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter")
                                          void handleSaveInlineEdit(child);
                                        if (e.key === "Escape")
                                          handleCancelInlineEdit();
                                      }}
                                      className="flex-1 rounded-lg border border-primary bg-white px-2.5 py-1 font-sans text-xs outline-none focus:ring-1 focus:ring-primary shadow-xs"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() =>
                                        void handleSaveInlineEdit(child)
                                      }
                                      className="p-1 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors cursor-pointer"
                                      title="Lưu"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={handleCancelInlineEdit}
                                      className="p-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                                      title="Hủy"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2 min-w-0">
                                      <Tag className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                                      <span className="text-xs truncate font-medium text-slate-700">
                                        {child.name}
                                      </span>
                                    </div>
                                    {/* Chỉ hiển thị các nút thao tác khi hover vào dòng */}
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                      <button
                                        onClick={() =>
                                          handleStartInlineEdit(child)
                                        }
                                        className="p-1 rounded-lg text-primary hover:bg-primary/10 cursor-pointer"
                                        title="Sửa tên kỹ năng"
                                      >
                                        <Edit className="h-3.5 w-3.5" />
                                      </button>
                                      <button
                                        onClick={() =>
                                          void handleInlineDeleteSkill(child.id)
                                        }
                                        className="p-1 rounded-lg text-error hover:bg-error/10 cursor-pointer"
                                        title="Xóa kỹ năng"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            );
                          });
                        })()
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
