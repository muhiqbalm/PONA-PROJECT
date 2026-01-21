import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase-client";
import { getSubjects } from "@/utils/supabase-queries";
import { Subject } from "@/types/database";
import { toast } from "react-hot-toast";

export const useSubjectManager = () => {
  const supabase = createClient();

  // --- STATE ---
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // State Modal Edit
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [newName, setNewName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // State Modal Tambah
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // --- FETCH DATA ---
  const fetchData = async () => {
    try {
      const data = await getSubjects(supabase);
      setSubjects(data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Gagal memuat daftar materi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- LOGIC: FILTERING ---
  // Gunakan useMemo agar filtering tidak dijalankan ulang jika subjects/searchQuery tidak berubah
  const filteredSubjects = useMemo(() => {
    return subjects.filter((subject) =>
      subject.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [subjects, searchQuery]);

  // --- LOGIC: VALIDASI ---
  const validateName = (name: string, excludeId?: string): boolean => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Nama materi tidak boleh kosong");
      return false;
    }
    if (trimmed.length > 30) {
      toast.error("Nama materi maksimal 30 karakter!");
      return false;
    }

    const isDuplicate = subjects.some((subject) => {
      if (excludeId && subject.id === excludeId) return false;
      return subject.name.toLowerCase() === trimmed.toLowerCase();
    });

    if (isDuplicate) {
      toast.error(`Materi dengan nama "${trimmed}" sudah ada!`);
      return false;
    }

    return true;
  };

  // --- ACTION: OPEN EDIT ---
  const openEditModal = (subject: Subject) => {
    setEditingSubject(subject);
    setNewName(subject.name);
    setIsEditModalOpen(true);
  };

  // --- ACTION: SAVE EDIT ---
  const saveEditSubject = async () => {
    if (!editingSubject || !validateName(newName, editingSubject.id)) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("subjects")
        .update({ name: newName.trim() })
        .eq("id", editingSubject.id);

      if (error) throw error;

      toast.success("Nama materi berhasil diubah!");
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === editingSubject.id ? { ...s, name: newName.trim() } : s,
        ),
      );
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- ACTION: ADD SUBJECT ---
  const addSubject = async () => {
    if (!validateName(newSubjectName)) return;

    setIsAdding(true);
    try {
      const { data, error } = await supabase
        .from("subjects")
        .insert([{ name: newSubjectName.trim() }])
        .select();

      if (error) throw error;

      toast.success("Materi baru berhasil ditambahkan!");
      if (data) {
        setSubjects((prev) => [...prev, data[0]]);
      }
      closeAddModal();
    } catch (error) {
      console.error("Error adding subject:", error);
      toast.error("Gagal menambahkan materi.");
    } finally {
      setIsAdding(false);
    }
  };

  // --- ACTION: CLOSE ADD MODAL ---
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setNewSubjectName("");
  };

  return {
    // Data
    subjects,
    filteredSubjects,
    loading,

    // Search
    searchQuery,
    setSearchQuery,

    // Edit Modal State & Actions
    isEditModalOpen,
    setIsEditModalOpen,
    editingSubject,
    newName,
    setNewName,
    isSaving,
    openEditModal,
    saveEditSubject,

    // Add Modal State & Actions
    isAddModalOpen,
    setIsAddModalOpen,
    newSubjectName,
    setNewSubjectName,
    isAdding,
    addSubject,
    closeAddModal,
  };
};
