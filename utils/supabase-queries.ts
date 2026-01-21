import { SupabaseClient } from "@supabase/supabase-js";
import {
  Subject,
  ReadingMaterial,
  PracticeQuestion,
  RoleCodeData,
} from "@/types/database";
import Cookies from "js-cookie";

export const getSubjects = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching subjects:", error);
    return [];
  }

  return data as Subject[];
};

export const getReadingMaterials = async (
  supabase: SupabaseClient,
  subjectId: string,
) => {
  const { data, error } = await supabase
    .from("reading_materials")
    .select("*")
    .eq("subject_id", subjectId)
    .order("order_number", { ascending: true });

  if (error) {
    console.error("Error fetching materials:", error);
    return [];
  }

  return data as ReadingMaterial[];
};

export const getPracticeQuestions = async (
  supabase: SupabaseClient,
  subjectId: number,
) => {
  const { data, error } = await supabase
    .from("practice_questions")
    .select("*")
    .eq("subject_id", subjectId)
    .order("number", { ascending: true });

  if (error) {
    console.error("Error fetching questions:", error);
    return [];
  }

  return data as PracticeQuestion[];
};

export const getSubjectById = async (supabase: SupabaseClient, id: number) => {
  const { data, error } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching subject:", error);
    return null;
  }

  return data as Subject;
};

export const getAllRoles = async (supabase: SupabaseClient) => {
  const { data, error } = await supabase
    .from("role_codes")
    .select("*")
    .order("role_name", { ascending: true }); // Urutkan berdasarkan nama role

  if (error) {
    console.error("Gagal mengambil data role:", error.message);
    return [];
  }

  return data as RoleCodeData[];
};

export const registerUser = async (
  fullName: string,
  identity: string, // Ini generik: Bisa NPP atau Kelas
  code: string,
  password: string,
  supabase: SupabaseClient,
) => {
  let email = "";

  // 1. CEK KODE DULU (Untuk menentukan format email dummy)
  const { data: codeData, error: codeError } = await supabase
    .from("role_codes")
    .select("role_name")
    .eq("code", code)
    .single();

  if (codeError || !codeData) {
    return { success: false, error: "Kode Registrasi tidak valid!" };
  }

  const role = codeData.role_name;

  // 2. GENERATE EMAIL DUMMY (Logic Frontend)
  if (role === "TEACHER") {
    const cleanNPP = identity.replace(/\s+/g, "");
    email = `${cleanNPP}@mail.com`;
  } else if (role === "STUDENT") {
    const cleanName = fullName.toLowerCase().replace(/\s+/g, "_");
    const cleanClass = identity.toLowerCase().replace(/\s+/g, "_");
    email = `${cleanName}.${cleanClass}@mail.com`;
  }

  // 3. DAFTAR KE SUPABASE
  // Disini perbedaannya: Kita simpan CODE dan IDENTITY_VALUE
  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
    options: {
      data: {
        full_name: fullName,
        registration_code: code, // <-- Kita simpan kodenya
        identity_value: identity, // <-- Kita simpan nilainya (entah itu NPP/Kelas)
        role: role, // (Opsional) Tetap simpan role agar frontend mudah akses nanti
      },
    },
  });

  if (error) return { success: false, error: error.message };

  return { success: true, data };
};

export const loginUser = async (
  fullName: string,
  identity: string, // NPP atau Kelas
  code: string,
  password: string,
  supabase: SupabaseClient,
) => {
  let email = "";

  // 1. CEK KODE DULU (Penting: Kita butuh tahu Role untuk menyusun ulang email dummy)
  const { data: codeData, error: codeError } = await supabase
    .from("role_codes")
    .select("role_name")
    .eq("code", code)
    .single();

  if (codeError || !codeData) {
    return { success: false, error: "Kode Akses Salah atau Tidak Valid!" };
  }

  const role = codeData.role_name;

  // 2. REKONSTRUKSI EMAIL DUMMY (Logika HARUS SAMA PERSIS dengan Register)
  if (role === "TEACHER") {
    // Guru login: Gunakan NPP
    const cleanNPP = identity.replace(/\s+/g, "");
    email = `${cleanNPP}@mail.com`;
  } else if (role === "STUDENT") {
    // Siswa login: Gunakan Nama + Kelas
    // PENTING: fullName diperlukan untuk siswa karena email register pakai nama
    const cleanName = fullName.toLowerCase().replace(/\s+/g, "_");
    const cleanClass = identity.toLowerCase().replace(/\s+/g, "_");
    email = `${cleanName}.${cleanClass}@mail.com`;
  }

  // 3. LOGIN KE SUPABASE
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    // Supaya user tidak bingung dengan error "Invalid login credentials"
    return { success: false, error: "Data diri atau Password salah!" };
  }

  // 4. SIMPAN DATA USER KE COOKIES (Expired 7 Hari)
  if (data.user) {
    // Kita ambil data penting dari metadata yang disimpan saat register
    const userDataToStore = {
      id: data.user.id,
      email: data.user.email,
      full_name: data.user.user_metadata.full_name,
      role: data.user.user_metadata.role,
      identity_value: data.user.user_metadata.identity_value,
    };

    // Simpan cookie dengan nama 'app_user_data', expired 7 hari
    Cookies.set("app_user_data", JSON.stringify(userDataToStore), {
      expires: 7,
    });
  }

  return { success: true, data };
};
