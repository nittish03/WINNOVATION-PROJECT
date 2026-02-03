"use client";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { fetchCached, cacheInvalidate, cacheSet } from "@/lib/cache";
import toast from "react-hot-toast";
import { MdNoteAdd, MdExpandMore, MdExpandLess } from "react-icons/md";
import {useSession} from 'next-auth/react'
import {
  FiCopy,
  FiTrash2,
  FiSave,
  FiFileText,
  FiClock,
  FiFeather,
  FiEye,
  FiEyeOff,
  FiEdit,
  FiX,
} from "react-icons/fi";

// Format date to "1-NOV-2025" format
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const day = date.getDate();
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const Text = () => {
  const {data:session} = useSession();
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [savedTexts, setSavedTexts] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [loading, setLoading] = useState(false);

  // Fetch saved texts
  const [cacheVersion, setCacheVersion] = useState(0);
  const fetchTexts = useCallback(async () => {
    try {
      const url = selectedFolderId
        ? `/api/text?folderId=${encodeURIComponent(selectedFolderId)}`
        : "/api/text";
      const res = await fetchCached(url, { ttlMs: 30_000, version: cacheVersion + ":texts" });
      // Handle both response formats: { success: true, data: [...] } or direct array
      if (res && (res.success ? res.data : res)) {
        setSavedTexts(res.success ? res.data : res);
      } else {
        setMessage({
          type: "error",
          content: "❌ Could not fetch saved texts.",
        });
      }
    } catch (err) {
      console.log(err);
      setMessage({ type: "error", content: "❌ Failed to fetch saved texts." });
    }
  }, [selectedFolderId, cacheVersion]);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await fetchCached("/api/text/folders", { ttlMs: 30_000, version: cacheVersion + ":folders" });
      // Handle both response formats: { success: true, data: [...] } or direct array
      if (res) {
        setFolders(res.success ? res.data : res);
      }
    } catch (e) {
      console.log(e);
    }
  }, [cacheVersion]);

  // Handle copy to clipboard
  const HandleCopy = async (textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success("📋 Text copied to clipboard!");
    } catch (err) {
      console.log("Copy failed:", err);
      toast.error("❌ Failed to copy text.");
    }
  };

  useEffect(() => {
    fetchTexts();
    fetchFolders();
  }, [selectedFolderId, fetchTexts, fetchFolders]);

  // Save new text
  const handleForm = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", content: "" });

    try {
      // Optimistic add
      const tempId = `temp-${Date.now()}`;
      const newItem = {
        id: tempId,
        title: title || "",
        text,
        folderId: selectedFolderId || "",
        dateUploaded: new Date().toISOString(),
      };
      const isVisible = !selectedFolderId || newItem.folderId === selectedFolderId;
      if (isVisible) {
        setSavedTexts((prev) => [newItem, ...prev]);
      }
      // bump folder count locally if applicable
      if (selectedFolderId) {
        setFolders((prev) => prev.map((f) => (f.id === selectedFolderId ? { ...f, textsCount: (f.textsCount || 0) + 1 } : f)));
      }

      const res = await axios.post("/api/text", { title, text, folderId: selectedFolderId || undefined });
      if (res.data.success) {
        const created = res.data.data;
        // replace temp with real
        setSavedTexts((prev) => prev.map((it) => (it.id === tempId ? created : it)));
        // Update client cache for current filter
        try {
          const url = selectedFolderId ? `/api/text?folderId=${encodeURIComponent(selectedFolderId)}` : "/api/text";
          const key = `GET:${url}#${String(cacheVersion)}:texts`;
          const list = (isVisible ? [created, ...savedTexts.filter((s) => s.id !== tempId)] : savedTexts).slice();
          cacheSet(key, list, 30_000);
        } catch {}

        setMessage({ type: "success", content: "✅ Text saved successfully!" });
        toast.success("Text saved successfully!");
        setText("");
        setTitle("");
        // Invalidate server caches (no UI refetch)
        cacheInvalidate("GET:/api/text");
        cacheInvalidate("GET:/api/text?folderId=");
      } else {
        // rollback optimistic add
        setSavedTexts((prev) => prev.filter((it) => it.id !== tempId));
        if (selectedFolderId) {
          setFolders((prev) => prev.map((f) => (f.id === selectedFolderId ? { ...f, textsCount: Math.max((f.textsCount || 1) - 1, 0) } : f)));
        }
        setMessage({ type: "error", content: `❌ ${res.data.message}` });
      }
    } catch (error) {
      console.log(error);
      setMessage({ type: "error", content: "❌ Failed to save text." });
      // rollback optimistic on network error
      // try to remove any temp we added at the head
      setSavedTexts((prev) => prev.filter((it) => !String(it.id).startsWith("temp-")));
      if (selectedFolderId) {
        setFolders((prev) => prev.map((f) => (f.id === selectedFolderId ? { ...f, textsCount: Math.max((f.textsCount || 1) - 1, 0) } : f)));
      }
    } finally {
      setLoading(false);
    }
  };

  // Update text
  const handleUpdate = async (id, title, text, folderId) => {
    const prevSaved = savedTexts;
    const prevFolders = folders;
    const prevItem = savedTexts.find((it) => it.id === id);
    const prevFolderId = prevItem?.folderId || "";

    // optimistic update in list
    setSavedTexts((prev) => {
      let next = prev.map((it) => (it.id === id ? { ...it, title: title || "", text, folderId: folderId || "" } : it));
      if (selectedFolderId) {
        const updated = next.find((it) => it.id === id);
        if (updated && updated.folderId !== selectedFolderId) {
          next = next.filter((it) => it.id !== id);
        }
      }
      return next;
    });
    // adjust folder counts
    if ((folderId || "") !== prevFolderId) {
      setFolders((prev) =>
        prev.map((f) =>
          f.id === prevFolderId
            ? { ...f, textsCount: Math.max((f.textsCount || 1) - 1, 0) }
            : f.id === (folderId || "")
            ? { ...f, textsCount: (f.textsCount || 0) + 1 }
            : f
        )
      );
    }

    try {
      const res = await axios.put("/api/text", { id, title, text, folderId });
      if (res.data.success) {
        setMessage({ type: "success", content: "✅ Text updated successfully!" });
        toast.success("Text updated successfully!");
        // Update client cache for current view
        try {
          const url = selectedFolderId ? `/api/text?folderId=${encodeURIComponent(selectedFolderId)}` : "/api/text";
          const key = `GET:${url}#${String(cacheVersion)}:texts`;
          cacheSet(key, savedTexts, 30_000);
        } catch {}
        cacheInvalidate("GET:/api/text");
        cacheInvalidate("GET:/api/text?folderId=");
      } else {
        setMessage({ type: "error", content: `❌ ${res.data.message}` });
        setSavedTexts(prevSaved);
        setFolders(prevFolders);
      }
    } catch (error) {
      console.log(error);
      setMessage({ type: "error", content: "❌ Failed to update text." });
      setSavedTexts(prevSaved);
      setFolders(prevFolders);
    }
  };

  // Delete text
  const handleDelete = async (id) => {
    const prevSaved = savedTexts;
    const prevFolders = folders;
    const item = savedTexts.find((it) => it.id === id);
    // optimistic remove from list
    setSavedTexts((prev) => prev.filter((it) => it.id !== id));
    if (item?.folderId) {
      setFolders((prev) => prev.map((f) => (f.id === item.folderId ? { ...f, textsCount: Math.max((f.textsCount || 1) - 1, 0) } : f)));
    }
    try {
      const res = await axios.delete("/api/text", { data: { id } });
      if (res.data.success) {
        setMessage({ type: "success", content: "🗑️ Text deleted successfully!" });
        toast.success("Text deleted successfully!");
        // Update client cache for current view
        try {
          const url = selectedFolderId ? `/api/text?folderId=${encodeURIComponent(selectedFolderId)}` : "/api/text";
          const key = `GET:${url}#${String(cacheVersion)}:texts`;
          cacheSet(key, savedTexts.filter((it) => it.id !== id), 30_000);
        } catch {}
        cacheInvalidate("GET:/api/text");
        cacheInvalidate("GET:/api/text?folderId=");
      } else {
        setMessage({ type: "error", content: `❌ ${res.data.message}` });
        setSavedTexts(prevSaved);
        setFolders(prevFolders);
      }
    } catch (error) {
      console.log(error);
      setMessage({ type: "error", content: "❌ Failed to delete text." });
      setSavedTexts(prevSaved);
      setFolders(prevFolders);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
        {/* Compact Folder Management */}
        <div className="mb-6 bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Folder Filter */}
            <div className="flex-1">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                <FiFileText size={14} />
                Filter by Folder
              </label>
              <select
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                         hover:border-gray-400 appearance-none cursor-pointer"
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
              >
                <option value="">📁 All texts</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📂 {f.name} {typeof f.textsCount === 'number' ? `(${f.textsCount})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Admin Folder Management */}
            {session?.user?.email === "nittishbaboria123@gmail.com" && (
              <div className="flex-1">
                <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                  <FiEdit size={14} />
                  Manage Folders
                </label>
                <div className="flex gap-2">
                  <input
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm
                             placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                             hover:border-gray-400"
                    placeholder="Folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                  />
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg
                             disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={!newFolderName.trim()}
                    onClick={async () => {
                      const name = newFolderName.trim();
                      if (!name) return;
                      // optimistic add folder
                      const tempId = `temp-folder-${Date.now()}`;
                      const tempFolder = { id: tempId, name, createdAt: new Date().toISOString(), textsCount: 0 };
                      setFolders((prev) => [tempFolder, ...prev]);
                      try {
                        const res = await axios.post("/api/text/folders", { name });
                        if (res.data.success) {
                          const real = res.data.data;
                          setFolders((prev) => prev.map((f) => (f.id === tempId ? { ...real, textsCount: 0 } : f)));
                          setNewFolderName("");
                          cacheInvalidate("GET:/api/text/folders");
                          toast.success("📁 Folder created successfully!");
                        } else {
                          // rollback
                          setFolders((prev) => prev.filter((f) => f.id !== tempId));
                          toast.error(res.data.message || "Failed to create folder");
                        }
                      } catch (e) {
                        setFolders((prev) => prev.filter((f) => f.id !== tempId));
                        toast.error("Failed to create folder");
                      }
                    }}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    disabled={!selectedFolderId}
                    className="px-3 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 
                             rounded-lg text-sm font-medium transition-all duration-200 shadow-md hover:shadow-lg
                             disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={async () => {
                      if (!selectedFolderId) return;
                      if (!confirm("Are you sure you want to delete this folder?")) return;
                      // optimistic remove
                      const targetId = selectedFolderId;
                      const prev = folders;
                      setFolders((p) => p.filter((f) => f.id !== targetId));
                      setSelectedFolderId("");
                      try {
                        const res = await axios.delete("/api/text/folders", { data: { id: targetId } });
                        if (res.data.success) {
                          cacheInvalidate("GET:/api/text/folders");
                          toast.success("🗑️ Folder deleted successfully!");
                        } else {
                          setFolders(prev);
                          toast.error(res.data.message || "Failed to delete folder");
                        }
                      } catch (e) {
                        setFolders(prev);
                        toast.error("Failed to delete folder");
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Compact Text Input Section */}
          <section className="xl:col-span-2 order-1">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-lg">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <div className="p-1.5 rounded-lg bg-blue-100">
                  <MdNoteAdd size={18} className="text-blue-600" />
                </div>
                Create New Text
              </h2>

              <form 
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleForm(e);
                  }
                }}
                onSubmit={handleForm}
                className="space-y-4"
              >
                <div className="space-y-3">
                  {/* Title Input */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Title (Optional)</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Give your text a memorable title..."
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 
                               text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                               hover:border-gray-400"
                    />
                  </div>

                  {/* Folder Selection */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Folder</label>
                    <select
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                               hover:border-gray-400 appearance-none cursor-pointer"
                      value={selectedFolderId}
                      onChange={(e) => setSelectedFolderId(e.target.value)}
                    >
                      <option value="">📁 No folder</option>
                      {folders.map((f) => (
                        <option key={f.id} value={f.id}>📂 {f.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Text Area */}
                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
                    <textarea
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 
                               text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200
                               hover:border-gray-400 resize-none"
                      placeholder="Start writing your text here..."
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      required
                      rows={6}
                    />
                    {/* Character Counter */}
                    <div className="absolute bottom-2 right-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {text.length}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg 
                           transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <FiSave size={16} />
                      Save Text
                    </span>
                  )}
                </button>
              </form>

              {/* Status Message */}
              {message.content && (
                <div
                  className={`mt-4 p-3 rounded-lg text-center font-medium text-sm ${
                    message.type === "success"
                      ? "bg-green-50 text-green-800 border border-green-200"
                      : "bg-red-50 text-red-800 border border-red-200"
                  }`}
                >
                  {message.content}
                </div>
              )}
            </div>
          </section>

          {/* Compact Saved Texts Section */}
          <section className="xl:col-span-3 order-2">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold flex items-center gap-2 text-gray-900">
                  <div className="rounded-lg bg-purple-100">
                    <FiFileText size={18} />
                  </div>
                  Your Saved Texts
                </h2>
                <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                  {savedTexts.length} {savedTexts.length === 1 ? 'text' : 'texts'}
                </div>
              </div>

              {/* Text List */}
              <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-purple-400 hover:scrollbar-thumb-purple-500">
                {savedTexts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4 opacity-50">📝</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No texts yet</h3>
                    <p className="text-gray-500 text-sm">
                      Start by creating your first text snippet
                    </p>
                  </div>
                ) : (
                  <div>
                    {savedTexts.map((item, index) => (
                      <TextItem
                        key={item.id}
                        item={item}
                        onCopy={HandleCopy}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                        folders={folders}
                        index={index}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Text;

const TextItem = ({ item, onCopy, onDelete, onUpdate, index, folders = [] }) => {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(item.title || "");
  const [editedText, setEditedText] = useState(item.text);
  const [editedFolderId, setEditedFolderId] = useState(item.folderId || "");

  const getTextLines = (text) => text.split("\n").length;
  const getTextLength = (text) => text.length;

  const shouldShowExpand = !isEditing && (getTextLength(item.text) > 200 || getTextLines(item.text) > 4);

  const handleToggleExpand = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onCopy(item.text);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this text?")) {
      onDelete(item.id);
    }
  };

  const handleEdit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsEditing(false);
    setEditedTitle(item.title || "");
    setEditedText(item.text);
    setEditedFolderId(item.folderId || "");
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onUpdate(item.id, editedTitle, editedText, editedFolderId || null);
    setIsEditing(false);
  };

  return (
    <div className="group relative">
      <div className="bg-white hover:bg-gray-50 p-3 m-3 rounded-xl border border-gray-200 
                     hover:border-purple-300 transition-all duration-300 shadow-md hover:shadow-lg">
        {/* Header Section */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div 
              className="flex justify-center items-center w-6 h-6 rounded-full flex-shrink-0 text-white font-semibold text-xs bg-gradient-to-br from-purple-500 to-pink-500"
            >
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSave(e);
                      }
                    }}
                    placeholder="Enter title..."
                    className="w-full bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-sm 
                             font-semibold text-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <select
                    className="w-full px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900
                             focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    value={editedFolderId}
                    onChange={(e) => setEditedFolderId(e.target.value)}
                  >
                    <option value="">📁 No folder</option>
                    {folders.map(f => (
                      <option key={f.id} value={f.id}>📂 {f.name}</option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  {item.title && (
                    <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
                      {item.title}
                    </h3>
                  )}
                  
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <FiClock size={11} />
                      {formatDate(item.dateUploaded)}
                    </span>
                    
                    {item.folderId && (
                      <span 
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-100 text-purple-700"
                      >
                        📂 {folders.find(f => f.id === item.folderId)?.name || 'Unknown'}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {isEditing ? (
              <>
                <button 
                  type="button" 
                  onClick={handleSave} 
                  className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors" 
                  title="Save changes"
                >
                  <FiSave size={12} />
                </button>
                <button 
                  type="button" 
                  onClick={handleCancel} 
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors" 
                  title="Cancel edit"
                >
                  <FiX size={12} />
                </button>
              </>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={handleCopy} 
                  className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors" 
                  title="Copy text"
                >
                  <FiCopy size={12} />
                </button>
                {session?.user?.email === "nittishbaboria123@gmail.com" && (
                  <>
                    <button 
                      type="button" 
                      onClick={handleEdit} 
                      className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 transition-colors" 
                      title="Edit text"
                    >
                      <FiEdit size={12} />
                    </button>
                    <button 
                      type="button" 
                      onClick={handleDelete} 
                      className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 transition-colors" 
                      title="Delete text"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  </>
                )}
                {shouldShowExpand && (
                  <button 
                    type="button" 
                    onClick={handleToggleExpand} 
                    className="p-1.5 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors" 
                    title={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <FiEyeOff size={12} /> : <FiEye size={12} />}
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Content Section */}
        <div className="text-gray-900 bg-gray-50 p-2.5 rounded-lg relative overflow-hidden border border-gray-200">
          {isEditing ? (
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  handleSave(e);
                }
              }}
              className="w-full h-32 bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-xs text-gray-900 
                       resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          ) : (
            <>
              <div
                className="whitespace-pre-wrap break-words transition-all duration-300 text-xs leading-relaxed"
                style={{
                  display: !isExpanded && shouldShowExpand ? "-webkit-box" : "block",
                  WebkitLineClamp: !isExpanded && shouldShowExpand ? 4 : "unset",
                  WebkitBoxOrient: !isExpanded && shouldShowExpand ? "vertical" : "unset",
                  overflow: !isExpanded && shouldShowExpand ? "hidden" : "visible",
                  wordBreak: "break-word",
                  hyphens: "auto",
                  lineHeight: "1.6",
                }}
              >
                {item.text}
              </div>
              {!isExpanded && shouldShowExpand && (
                <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-white/10 to-transparent pointer-events-none rounded-b-lg" />
              )}
            </>
          )}
        </div>

        {/* Expand/Collapse Button */}
        {shouldShowExpand && (
          <div className="flex justify-center mt-3">
            <button
              type="button"
              onClick={handleToggleExpand}
              className="flex items-center gap-1.5 text-xs font-medium 
                       transition-colors duration-200 px-3 py-1.5 rounded-lg
                       bg-pink-100 hover:bg-pink-200 text-pink-700 border border-pink-200 hover:border-pink-300"
            >
              {isExpanded ? (
                <>
                  <MdExpandLess size={14} />
                  <span>Show less</span>
                </>
              ) : (
                <>
                  <MdExpandMore size={14} />
                  <span>Show more ({item.text.split(" ").length} words)</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
