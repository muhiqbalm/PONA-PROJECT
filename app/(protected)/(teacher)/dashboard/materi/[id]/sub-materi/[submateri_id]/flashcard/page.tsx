"use client";

import { useState, useEffect, useRef, use, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Save,
  Loader2,
  UploadCloud,
  Trash2,
  Image as ImageIcon,
  ArrowRight,
  ArrowDown,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-hot-toast";

import { useAuth } from "@/components/authProvider";
import HomeHeader from "@/components/homeHeader";
import { createClient } from "@/utils/supabase-client";

// --- TYPES ---
type Flashcard = {
  id?: string;
  topic_id: string;
  front_image_url: string;
  back_image_url: string;
  order_number: number;
};

// --- KOMPONEN UPLOAD GAMBAR (MODULAR & RESPONSIVE) ---
const FlashcardImageUploader = ({
  src,
  label,
  subLabel,
  onUpload,
  onRemove,
  colorTheme = "blue",
}: {
  src: string;
  label: string;
  subLabel: string;
  onUpload: (url: string) => void;
  onRemove: () => void;
  colorTheme?: "blue" | "green";
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      return toast.error("Ukuran file maksimal 3MB");
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `flashcard/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("images").getPublicUrl(fileName);
      onUpload(data.publicUrl);
      toast.success("Berhasil diupload");
    } catch (err) {
      console.error(err);
      toast.error("Gagal upload gambar");
    } finally {
      setIsUploading(false);
    }
  };

  // Styling dinamis
  const borderColor = src
    ? "border-gray-200"
    : colorTheme === "blue"
      ? "border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50"
      : "border-green-200 hover:border-green-400 bg-green-50/30 hover:bg-green-50";

  const iconColor = colorTheme === "blue" ? "text-blue-500" : "text-green-500";
  const badgeColor =
    colorTheme === "blue"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-green-100 text-green-700 border-green-200";

  return (
    <div className="flex-1 w-full min-w-0 flex flex-col gap-2">
      {/* Header Label - Responsive Flex Wrap */}
      <div className="flex flex-wrap items-center justify-between gap-2 min-h-[28px]">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`text-[10px] sm:text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider whitespace-nowrap ${badgeColor}`}
          >
            {label}
          </span>
        </div>

        {src && (
          <button
            onClick={onRemove}
            className="text-[10px] sm:text-xs text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition flex items-center gap-1 ml-auto sm:ml-0"
          >
            <Trash2 size={12} /> Hapus
          </button>
        )}
      </div>

      {/* Upload Area - Mobile Square, Desktop Landscape */}
      <div
        onClick={() => !src && fileInputRef.current?.click()}
        className={`relative w-full aspect-square rounded-xl border-2 border-dashed transition-all duration-200 group overflow-hidden ${borderColor} ${
          !src ? "cursor-pointer" : ""
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        {src ? (
          <div className="relative w-full h-full bg-white">
            <Image
              src={src}
              alt={label}
              fill
              className="object-contain p-2"
              unoptimized
            />
            {/* Overlay Hover */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center cursor-pointer"
            >
              <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all flex flex-col items-center text-white">
                <RefreshCw size={24} className="mb-1" />
                <span className="text-xs font-bold">Ganti</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            {isUploading ? (
              <>
                <Loader2
                  className={`animate-spin mb-2 ${iconColor}`}
                  size={24}
                />
                <span className="text-[10px] sm:text-xs font-bold text-gray-500">
                  Loading...
                </span>
              </>
            ) : (
              <>
                <div
                  className={`p-2.5 sm:p-3 rounded-full mb-2 transition-transform group-hover:scale-110 ${
                    colorTheme === "blue" ? "bg-blue-100" : "bg-green-100"
                  }`}
                >
                  <UploadCloud size={20} className={iconColor} />
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-600">
                  Upload
                </span>
                <span className="text-[9px] sm:text-[10px] text-gray-400 mt-0.5">
                  Max 3MB
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default function KelolaFlashcardPage({
  params,
}: {
  params: Promise<{ id: string; submateri_id: string }>;
}) {
  const { isLoading: authLoading } = useAuth();
  const { id: SUBJECT_ID, submateri_id: TOPIC_ID } = use(params);
  const supabase = useMemo(() => createClient(), []);

  // --- STATE ---
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [topicName, setTopicName] = useState("");

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      if (!TOPIC_ID) return;
      setLoading(true);
      try {
        const { data: topicData } = await supabase
          .from("topics")
          .select("name")
          .eq("id", TOPIC_ID)
          .single();
        if (topicData) setTopicName(topicData.name);

        const { data: cards, error } = await supabase
          .from("topic_flashcard")
          .select("*")
          .eq("topic_id", TOPIC_ID)
          .order("order_number", { ascending: true });

        if (error) throw error;

        // Inisialisasi 3 slot kosong
        const initialCards: Flashcard[] = Array.from({ length: 3 }).map(
          (_, i) => ({
            topic_id: TOPIC_ID,
            front_image_url: "",
            back_image_url: "",
            order_number: i + 1,
          }),
        );

        if (cards && cards.length > 0) {
          cards.forEach((dbCard, index) => {
            const targetIndex = (dbCard.order_number || index + 1) - 1;
            if (targetIndex >= 0 && targetIndex < 3) {
              initialCards[targetIndex] = {
                ...initialCards[targetIndex],
                id: dbCard.id,
                front_image_url: dbCard.front_image_url || "",
                back_image_url: dbCard.back_image_url || "",
              };
            }
          });
        }

        setFlashcards(initialCards);
      } catch (error) {
        console.error(error);
        toast.error("Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [TOPIC_ID, supabase]);

  const updateCard = (index: number, field: keyof Flashcard, value: string) => {
    const newCards = [...flashcards];
    // @ts-ignore
    newCards[index][field] = value;
    setFlashcards(newCards);
  };

  // --- SAVE ALL (DENGAN VALIDASI KETAT) ---
  const handleSaveAll = async () => {
    // Validasi: Wajib mengisi semua 3 slot flashcard (Depan & Belakang)
    for (let i = 0; i < 3; i++) {
      const f = flashcards[i];
      // Jika salah satu sisi kosong (atau keduanya kosong), tolak simpan
      if (!f.front_image_url || !f.back_image_url) {
        return toast.error(
          `Gagal Simpan: Kartu No. ${i + 1} belum lengkap. Anda wajib mengisi gambar Depan & Belakang untuk semua 3 kartu.`,
        );
      }
    }

    setIsSaving(true);
    try {
      const promises = flashcards.map(async (card, index) => {
        // Karena validasi di atas sudah memastikan data terisi,
        // kita bisa langsung menyiapkan payload.
        const payload = {
          topic_id: TOPIC_ID,
          front_image_url: card.front_image_url,
          back_image_url: card.back_image_url,
          order_number: index + 1,
        };

        if (card.id) {
          return supabase
            .from("topic_flashcard")
            .update(payload)
            .eq("id", card.id);
        } else {
          return supabase.from("topic_flashcard").insert(payload);
        }
      });

      await Promise.all(promises);
      toast.success("Semua flashcard berhasil disimpan!");
    } catch (error) {
      console.error(error);
      toast.error("Terjadi kesalahan saat menyimpan.");
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen bg-[#FAFAFA]">
        <HomeHeader />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[#FAFAFA] font-sans overflow-hidden">
      {/* Header Global */}
      <div className="flex-shrink-0 z-40 bg-[#FAFAFA]">
        <HomeHeader />
      </div>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 pb-28 pt-2 overflow-y-auto relative scroll-smooth">
        {/* Navigation & Title */}
        <div className="mb-6 max-w-5xl mx-auto">
          <Link
            href={`/dashboard/materi/${SUBJECT_ID}/sub-materi`}
            className="flex items-center gap-2 mb-3 w-fit text-purple-800 hover:text-purple-600 transition-colors duration-200"
          >
            <ArrowLeft size={16} />
            <p className="text-xs font-bold leading-relaxed">Kembali</p>
          </Link>

          <div className="relative w-full h-auto py-6 sm:h-32 rounded-2xl overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 flex flex-col sm:flex-row items-start sm:items-center mb-2 z-0 shadow-lg shadow-purple-200">
            <div className="w-full sm:w-2/3 pl-6 sm:pl-8 pr-6 z-10 text-white">
              <h1 className="font-black text-xl sm:text-2xl leading-tight">
                Flashcard
              </h1>
              <p className="text-xs font-medium mt-1 opacity-90">
                Sub Materi: {topicName}
              </p>
            </div>
            <div className="hidden sm:block absolute right-0 bottom-0 h-full w-1/3 opacity-20">
              <div className="relative w-full h-full flex items-center justify-center">
                <ImageIcon className="text-white w-24 h-24 transform rotate-12" />
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="max-w-5xl mx-auto space-y-6">
          {flashcards.map((card, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 relative group transition-shadow hover:shadow-md"
            >
              {/* Nomor Urut (Badge Kiri) */}
              <div className="absolute -left-2 -top-2 sm:-left-3 sm:top-6 w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md border-4 border-[#FAFAFA] z-20">
                {index + 1}
              </div>

              {/* Layout Responsif: Column di Mobile, Row di Desktop */}
              <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-8 pt-2 sm:pt-0 sm:pl-4">
                {/* Sisi Depan (Pertanyaan) */}
                <FlashcardImageUploader
                  label="Depan"
                  subLabel="Pertanyaan"
                  src={card.front_image_url}
                  colorTheme="blue"
                  onUpload={(url) => updateCard(index, "front_image_url", url)}
                  onRemove={() => updateCard(index, "front_image_url", "")}
                />

                <div className="md:hidden flex items-center justify-center text-gray-300 py-1">
                  <ArrowDown size={20} strokeWidth={3} />
                </div>

                {/* Sisi Belakang (Jawaban) */}
                <FlashcardImageUploader
                  label="Belakang"
                  subLabel="Jawaban"
                  src={card.back_image_url}
                  colorTheme="green"
                  onUpload={(url) => updateCard(index, "back_image_url", url)}
                  onRemove={() => updateCard(index, "back_image_url", "")}
                />
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Footer Sticky Actions - Fixed Position Left-Right */}
      <div className="left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-gray-500 text-xs w-full sm:w-auto justify-center sm:justify-start">
            <HelpCircle size={14} />
            <span>Wajib upload 3 pasang gambar.</span>
          </div>
          <button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 transition disabled:opacity-70 active:scale-95"
          >
            {isSaving ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Save size={18} />
            )}{" "}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
