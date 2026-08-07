'use client';

import { useState, useEffect } from "react";
import { PanelHeader, Card, Badge, LoadingState, ErrorState } from "@/components/dashboard/ui";
import { MessageSquare, Mail, Phone, Clock, CheckCircle2, Archive, Reply, ExternalLink, RefreshCw, Filter } from "lucide-react";
import type { ContactMessageRow } from "@/lib/ginza-db";

export default function MessagesPanel() {
  const [messages, setMessages] = useState<ContactMessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessageRow | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil pesan.");
      setMessages(data.messages || []);
    } catch (err: any) {
      setError(err.message || "Gagal memuat pesan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleUpdateStatus = async (id: string, status: ContactMessageRow["status"]) => {
    try {
      const res = await fetch("/api/admin/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Gagal memperbarui status.");
      }
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, status } : msg))
      );
      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err: any) {
      alert(err.message || "Gagal mengubah status pesan.");
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (activeFilter === "all") return true;
    return m.status === activeFilter;
  });

  const unreadCount = messages.filter((m) => m.status === "unread").length;

  if (loading && messages.length === 0) {
    return <LoadingState label="Memuat pesan masuk pengembang..." />;
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PanelHeader
          title="Pesan Masuk (Messages)"
          subtitle="Kelola pesan pengguna dari formulir Pengaturan dan forwarding Resend email."
        />
        <button
          onClick={fetchMessages}
          className="px-3.5 py-2 rounded-xl bg-bento-surface-lighter hover:bg-[#202336] text-bento-text-primary border border-bento-border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {error && <ErrorState message={error} />}

      {/* Filter Tabs & Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-2xl bg-[#0F1017] border border-[#232638]">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { key: "all", label: "Semua Pesan", count: messages.length },
            { key: "unread", label: "Belum Dibaca", count: unreadCount, highlight: unreadCount > 0 },
            { key: "read", label: "Dibaca", count: messages.filter((m) => m.status === "read").length },
            { key: "replied", label: "Dibalas", count: messages.filter((m) => m.status === "replied").length },
            { key: "archived", label: "Diarsip", count: messages.filter((m) => m.status === "archived").length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                activeFilter === tab.key
                  ? "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20"
                  : "text-gray-400 hover:text-white hover:bg-[#1A1D2D]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  tab.highlight
                    ? "bg-rose-500 text-white font-bold"
                    : activeFilter === tab.key
                    ? "bg-white/20 text-white"
                    : "bg-[#1E2133] text-gray-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout: Messages List + Detail Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Messages List Column */}
        <div className={selectedMessage ? "lg:col-span-6 space-y-3" : "lg:col-span-12 space-y-3"}>
          {filteredMessages.length === 0 ? (
            <Card className="p-8 text-center text-gray-400 text-xs">
              <MessageSquare className="w-8 h-8 text-gray-500 mx-auto mb-2 opacity-50" />
              <p>Belum ada pesan dalam kategori ini.</p>
            </Card>
          ) : (
            filteredMessages.map((msg) => {
              const isSelected = selectedMessage?.id === msg.id;
              return (
                <div
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg);
                    if (msg.status === "unread") {
                      handleUpdateStatus(msg.id, "read");
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? "bg-[#161828] border-blue-500/50 shadow-lg shadow-blue-600/10"
                      : msg.status === "unread"
                      ? "bg-[#131522] border-blue-500/30"
                      : "bg-[#0F1017] border-[#222538] hover:border-[#2E324A]"
                  }`}
                >
                  {msg.status === "unread" && (
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-blue-500" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm tracking-tight">{msg.name}</h4>
                        {msg.status === "unread" && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[9px] font-bold">NEW</span>
                        )}
                        {msg.status === "replied" && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold">DIBALAS</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 font-mono">{msg.email}</p>
                    </div>

                    <span className="text-[10px] text-gray-500 font-mono shrink-0 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {new Date(msg.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-gray-300 mt-2 line-clamp-2 leading-relaxed">
                    {msg.message}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-[#1C1F32] flex items-center justify-between text-[11px] text-gray-400">
                    <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px]">
                      {msg.whatsapp ? `WA: ${msg.whatsapp}` : "Tanpa WhatsApp"}
                    </span>
                    {msg.forwarded_to && (
                      <span className="text-gray-500 text-[10px]">Fwd: {msg.forwarded_to}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Message Detail Drawer */}
        {selectedMessage && (
          <div className="lg:col-span-6">
            <div className="p-6 rounded-3xl bg-[#11131E] border border-[#282C42] sticky top-6 space-y-5 shadow-xl">
              
              <div className="flex items-start justify-between border-b border-[#212438] pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{selectedMessage.name}</h3>
                  <p className="text-xs text-blue-400 font-mono">{selectedMessage.email}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge tone={selectedMessage.status === "unread" ? "danger" : selectedMessage.status === "replied" ? "success" : "default"}>
                    {selectedMessage.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {/* Detail Info Sender */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-[#161828] border border-[#24273C]">
                  <span className="text-[10px] text-gray-400 uppercase block font-semibold">WhatsApp</span>
                  <span className="text-white font-mono">{selectedMessage.whatsapp || "Tidak diisi"}</span>
                </div>
                <div className="p-3 rounded-xl bg-[#161828] border border-[#24273C]">
                  <span className="text-[10px] text-gray-400 uppercase block font-semibold">Waktu Pengiriman</span>
                  <span className="text-white font-mono text-[11px]">
                    {new Date(selectedMessage.created_at).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Isi Pesan */}
              <div className="p-4 rounded-2xl bg-[#0B0C12] border border-[#212438] space-y-2">
                <span className="text-xs font-semibold text-gray-400 block">Isi Pesan Lengkap:</span>
                <p className="text-xs text-gray-200 whitespace-pre-wrap leading-relaxed font-sans">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Status Mail Forwarding */}
              {selectedMessage.forwarded_to && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-[11px] text-blue-300 flex items-center justify-between">
                  <span>Diteruskan otomatis via Resend:</span>
                  <span className="font-mono text-white font-bold">{selectedMessage.forwarded_to}</span>
                </div>
              )}

              {/* Quick Actions */}
              <div className="pt-3 border-t border-[#212438] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <a
                    href={`mailto:${selectedMessage.email}`}
                    className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Balas Email</span>
                  </a>

                  {selectedMessage.whatsapp && (
                    <a
                      href={`https://wa.me/${selectedMessage.whatsapp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Chat WhatsApp</span>
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "replied")}
                    className="p-2 rounded-xl bg-[#1A1D2E] hover:bg-[#252840] text-emerald-400 border border-[#2C304A] text-xs font-semibold transition-all"
                    title="Tandai Dibalas"
                  >
                    <Reply className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedMessage.id, "archived")}
                    className="p-2 rounded-xl bg-[#1A1D2E] hover:bg-[#252840] text-gray-400 hover:text-white border border-[#2C304A] text-xs font-semibold transition-all"
                    title="Arsipkan Pesan"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
