"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { fetchCached, cacheInvalidate } from "@/lib/cache";
import { MdCloudUpload, MdLock, MdDescription, MdAccessTime, MdRefresh } from "react-icons/md";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { FiUpload, FiFile, FiShield, FiTrash2, FiSearch, FiX, FiImage, FiPause, FiPlay, FiEdit, FiSave, FiFolder, FiGrid, FiList, FiPlus } from "react-icons/fi";
import { useSession } from "next-auth/react";
import PageHeader from "../../components/drive/PageHeader";
import SectionCard from "../../components/drive/SectionCard";

// Upload status constants
const UPLOAD_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
  RETRYING: 'retrying'
};

export default function GoogleDrive() {
  const {data:session} = useSession();
  const isAdmin = session?.user?.email === 'nittishbaboria123@gmail.com';
  const [files, setFiles] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [accessPassword, setAccessPassword] = useState("");
  const [accessingFile, setAccessingFile] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [deletingFileId, setDeletingFileId] = useState(null);
  const [editingFile, setEditingFile] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingFolders, setIsLoadingFolders] = useState(true);
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [deletingFolder, setDeletingFolder] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [cacheVersion, setCacheVersion] = useState(0);
  const headerFileInputRef = useRef(null);
  const [selectedFileIds, setSelectedFileIds] = useState(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Upload queue and progress tracking
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const uploadRefs = useRef({});
  const chunkSize = 1024 * 1024; // 1MB chunks

  useEffect(() => {
    const fetchFolders = async () => {
      setIsLoadingFolders(true);
      try {
        const res = await fetchCached("/api/googleDrive/folders", { ttlMs: 30_000, version: cacheVersion });
        // Handle both response formats: { success: true, data: [...] } or direct array
        const foldersData = res?.success ? res.data : (res?.data || res || []);
        setFolders(foldersData);
      } catch (e) {
        toast.error("Failed to fetch folders.");
      } finally {
        setIsLoadingFolders(false);
      }
    };

    const fetchFiles = async (folderId = null) => {
      setIsLoading(true);
      try {
        const url = folderId ? `/api/googleDrive?folderId=${folderId}` : "/api/googleDrive";
        const response = await fetchCached(url, { ttlMs: 30_000, version: cacheVersion });
        // Handle both response formats: { success: true, data: [...] } or direct array
        const filesData = response?.success ? response.data : (response?.data || response || []);
        setAllFiles(filesData);
        setFilteredFiles(filesData);
      } catch (error) {
        toast.error("Failed to fetch documents.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFolders();
    fetchFiles();
  }, [cacheVersion]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const url = selectedFolder ? `/api/googleDrive?folderId=${selectedFolder}` : "/api/googleDrive";
        const response = await fetchCached(url, { ttlMs: 30_000, version: cacheVersion });
        // Handle both response formats: { success: true, data: [...] } or direct array
        const filesData = response?.success ? response.data : (response?.data || response || []);
        setAllFiles(filesData);
        setFilteredFiles(filesData);
      } catch (e) {
        toast.error("Failed to fetch documents.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [selectedFolder, cacheVersion]);

  useEffect(() => {
    setFilteredFiles(
      allFiles.filter((file) => file.title.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [searchTerm, allFiles]);

  // Generate unique upload ID
  const generateUploadId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

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

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format upload speed
  const formatSpeed = (bytesPerSecond) => {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Calculate time remaining
  const formatTimeRemaining = (seconds) => {
    if (!seconds || seconds === Infinity) return 'Calculating...';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    if (seconds < 3600) return `${Math.round(seconds / 60)}m ${Math.round(seconds % 60)}s`;
    return `${Math.round(seconds / 3600)}h ${Math.round((seconds % 3600) / 60)}m`;
  };

  // Enhanced file handling for multiple files
  const handleFileChange = useCallback((selectedFiles) => {
    const fileArray = Array.from(selectedFiles);
    const newUploads = fileArray.map(file => ({
      id: generateUploadId(),
      file,
      title: file.name.substring(0, file.name.lastIndexOf('.')) || file.name,
      password: '',
      status: UPLOAD_STATUS.PENDING,
      progress: 0,
      speed: 0,
      timeRemaining: 0,
      uploadedChunks: 0,
      totalChunks: Math.ceil(file.size / chunkSize),
      retryCount: 0,
      startTime: null,
      uploadedBytes: 0,
    }));

    setUploadQueue(prev => [...prev, ...newUploads]);
    toast.success(`${fileArray.length} file(s) added to upload queue`);
  }, [chunkSize]);

  // Handle input change for multiple files
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileChange(e.target.files);
    }
  };

  // Selection helpers
  const toggleSelectFile = useCallback((id) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllVisible = () => {
    setSelectedFileIds(new Set(filteredFiles.map(f => f.id)));
  };

  const clearSelection = () => setSelectedFileIds(new Set());

  const bulkDeleteSelected = async () => {
    const ids = Array.from(selectedFileIds);
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} file(s)? This cannot be undone.`)) return;

    setIsBulkDeleting(true);
    const loading = toast.loading('Deleting selected files...');
    try {
      const results = await Promise.allSettled(
        ids.map(id => axios.delete('/api/googleDrive', { data: { id } }))
      );

      const successIds = ids.filter((_, idx) => results[idx].status === 'fulfilled');
      const failCount = ids.length - successIds.length;

      if (successIds.length) {
        setAllFiles(prev => prev.filter(f => !successIds.includes(f.id)));
        setFilteredFiles(prev => prev.filter(f => !successIds.includes(f.id)));
        setSelectedFileIds(prev => {
          const next = new Set(prev);
          successIds.forEach(id => next.delete(id));
          return next;
        });
      }

      toast.dismiss(loading);
      if (successIds.length) toast.success(`Deleted ${successIds.length} file(s)`);
      if (failCount) toast.error(`${failCount} file(s) failed to delete`);
    } catch (e) {
      toast.dismiss(loading);
      toast.error('Bulk delete failed');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const createFolder = async () => {
    const name = prompt("Folder name");
    if (!name) return;
    setCreatingFolder(true);
    try {
      const res = await axios.post("/api/googleDrive/folders", { name, createDrive: true });
      cacheInvalidate("GET:/api/googleDrive/folders");
      setFolders((prev) => [res.data.data, ...prev]);
      toast.success("Folder created");
    } catch (e) {
      toast.error("Failed to create folder");
    } finally {
      setCreatingFolder(false);
    }
  };

  const deleteFolder = async () => {
    if (!selectedFolder) return;
    const folder = folders.find(f => f.id === selectedFolder);
    const name = folder?.name || 'this folder';
    if (!window.confirm(`Delete ${name}?\nThis cannot be undone.`)) return;

    setDeletingFolder(true);
    const loading = toast.loading('Deleting folder...');
    try {
      await axios.delete('/api/googleDrive/folders', { data: { id: selectedFolder } });
      cacheInvalidate("GET:/api/googleDrive/folders");
      setFolders(prev => prev.filter(f => f.id !== selectedFolder));
      setSelectedFolder(null);
      toast.dismiss(loading);
      toast.success('Folder deleted');
    } catch (e) {
      toast.dismiss(loading);
      const msg = e?.response?.data?.message || 'Failed to delete folder';
      toast.error(msg);
    } finally {
      setDeletingFolder(false);
    }
  };

  // Drag and drop handlers
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileChange(files);
    }
  }, [handleFileChange]);

  // Upload functionality (keeping all existing logic but UI compact)
  const uploadFile = async (uploadItem) => {
    const { id, file, title, password } = uploadItem;
    try {
      setUploadQueue(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          status: UPLOAD_STATUS.UPLOADING, 
          startTime: item.startTime || Date.now() 
        } : item
      ));

      const totalChunks = Math.ceil(file.size / chunkSize);
      const currentItem = uploadQueue.find(item => item.id === id);
      let uploadedChunks = currentItem?.uploadedChunks || 0;

      uploadRefs.current[id] = new AbortController();

      for (let chunkIndex = uploadedChunks; chunkIndex < totalChunks; chunkIndex++) {
        const latestItem = uploadQueue.find(item => item.id === id);
        if (latestItem?.status === UPLOAD_STATUS.PAUSED) return;

        const start = chunkIndex * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);

        const formData = new FormData();
        formData.append("chunk", chunk);
        formData.append("chunkIndex", chunkIndex.toString());
        formData.append("totalChunks", totalChunks.toString());
        formData.append("fileName", file.name);
        formData.append("uploadId", id);
        formData.append("title", title);
        formData.append("password", password);
        formData.append("fileType", file.type);
        formData.append("resumeFromChunk", uploadedChunks.toString());

        if (selectedFolder) {
          formData.append("folderId", selectedFolder);
        }

        const chunkStartTime = Date.now();
        try {
          const response = await axios.post("/api/googleDrive", formData, {
            headers: { "Content-Type": "multipart/form-data" },
            signal: uploadRefs.current[id]?.signal,
          });

          const chunkEndTime = Date.now();
          const chunkTime = (chunkEndTime - chunkStartTime) / 1000;
          const chunkSpeed = chunk.size / chunkTime;
          const uploadedBytes = (chunkIndex + 1) * chunkSize;
          const remainingBytes = file.size - uploadedBytes;
          const timeRemaining = remainingBytes / chunkSpeed;

          setUploadQueue(prev => prev.map(item => 
            item.id === id ? {
              ...item,
              progress: Math.min(((chunkIndex + 1) / totalChunks) * 100, 100),
              uploadedChunks: chunkIndex + 1,
              speed: chunkSpeed,
              timeRemaining: timeRemaining > 0 ? timeRemaining : 0,
              uploadedBytes: Math.min(uploadedBytes, file.size)
            } : item
          ));

          if (response.data.completed) {
            setUploadQueue(prev => prev.map(item => 
              item.id === id ? { ...item, status: UPLOAD_STATUS.COMPLETED, progress: 100 } : item
            ));

            const newFile = response.data.data;
            newFile.isProtected = !!password;
            if (!selectedFolder || newFile.folderId === selectedFolder) {
              setAllFiles(prev => [...prev, newFile]);
            }
            toast.success(`${title} uploaded successfully!`);
            setCacheVersion((v) => v + 1);
            break;
          }
        } catch (chunkError) {
          if (chunkError.name === 'AbortError') return;
          throw chunkError;
        }
      }
    } catch (error) {
      if(error.message == 'canceled'){
        toast(`Upload paused ${uploadItem.title}`, { icon: '✔️' });
        setUploadQueue(prev => prev.map(item => 
          item.id === id ? { ...item, status: UPLOAD_STATUS.FAILED } : item
        ));
      } else {
        setUploadQueue(prev => prev.map(item => 
          item.id === id ? { ...item, status: UPLOAD_STATUS.FAILED } : item
        ));
        toast.error(`Failed to upload ${uploadItem.title}`);
      }
    } finally {
      delete uploadRefs.current[id];
    }
  };

  const startUploads = async () => {
    setIsUploading(true);
    const pendingUploads = uploadQueue.filter(item => 
      item.status === UPLOAD_STATUS.PENDING || item.status === UPLOAD_STATUS.FAILED
    );
    
    for (const uploadItem of pendingUploads) {
      if (uploadItem.status !== UPLOAD_STATUS.PAUSED) {
        await uploadFile(uploadItem);
      }
    }
    setIsUploading(false);
  };

  const pauseUpload = (id) => {
    if (uploadRefs.current[id]) {
      uploadRefs.current[id].abort();
      delete uploadRefs.current[id];
    }
    setUploadQueue(prev => prev.map(item => 
      item.id === id ? { ...item, status: UPLOAD_STATUS.PAUSED } : item
    ));
    toast.success('Upload paused');
  };

  const resumeUpload = (id) => {
    const uploadItem = uploadQueue.find(item => item.id === id);
    if (uploadItem) {
      setUploadQueue(prev => prev.map(item => 
        item.id === id ? { ...item, status: UPLOAD_STATUS.UPLOADING } : item
      ));
      uploadFile(uploadItem);
      toast.success('Upload resumed');
    }
  };

  const retryUpload = (id) => {
    setUploadQueue(prev => prev.map(item => 
      item.id === id ? {
        ...item,
        status: UPLOAD_STATUS.PENDING,
        progress: 0,
        uploadedChunks: 0,
        uploadedBytes: 0,
        retryCount: item.retryCount + 1
      } : item
    ));

    const uploadItem = uploadQueue.find(item => item.id === id);
    if (uploadItem) {
      uploadFile({ ...uploadItem, uploadedChunks: 0, progress: 0, uploadedBytes: 0 });
    }
  };

  const removeFromQueue = (id) => {
    if (uploadRefs.current[id]) {
      uploadRefs.current[id].abort();
      delete uploadRefs.current[id];
    }
    setUploadQueue(prev => prev.filter(item => item.id !== id));
  };

  const updateUploadItem = (id, field, value) => {
    setUploadQueue(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  // Convert MIME type to short file extension
  const getFileTypeShort = (mimeType) => {
    if (!mimeType) return 'FILE';
    const type = mimeType.toLowerCase();
    const parts = mimeType.split('/');
    const subtype = parts[1]?.toLowerCase() || '';
    
    // Office documents
    if (type.includes('vnd.openxmlformats-officedocument.wordprocessingml.document') || 
        type.includes('msword') || type.includes('word')) return 'DOCX';
    if (type.includes('vnd.openxmlformats-officedocument.spreadsheetml.sheet') || 
        type.includes('excel') || type.includes('spreadsheet')) return 'XLSX';
    if (type.includes('vnd.openxmlformats-officedocument.presentationml.presentation') || 
        type.includes('powerpoint') || type.includes('presentation')) return 'PPTX';
    if (type.includes('vnd.ms-excel')) return 'XLS';
    if (type.includes('vnd.ms-powerpoint')) return 'PPT';
    if (type.includes('vnd.ms-word')) return 'DOC';
    
    // Common types
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image/jpeg') || type.includes('image/jpg')) return 'JPG';
    if (type.includes('image/png')) return 'PNG';
    if (type.includes('image/gif')) return 'GIF';
    if (type.includes('image/webp')) return 'WEBP';
    if (type.includes('image/svg')) return 'SVG';
    if (type.includes('text/plain')) return 'TXT';
    if (type.includes('text/html')) return 'HTML';
    if (type.includes('text/css')) return 'CSS';
    if (type.includes('text/javascript') || type.includes('application/javascript')) return 'JS';
    if (type.includes('application/json')) return 'JSON';
    if (type.includes('video/mp4')) return 'MP4';
    if (type.includes('video/quicktime')) return 'MOV';
    if (type.includes('audio/mpeg') || type.includes('audio/mp3')) return 'MP3';
    if (type.includes('audio/wav')) return 'WAV';
    if (type.includes('application/zip')) return 'ZIP';
    if (type.includes('application/x-rar')) return 'RAR';
    if (type.includes('application/x-7z')) return '7Z';
    
    // Try to extract extension from subtype
    if (subtype.includes('.')) {
      const ext = subtype.split('.').pop();
      if (ext && ext.length <= 5) return ext.toUpperCase();
    }
    
    // Fallback: use first part of subtype if it's reasonable
    if (subtype && subtype.length <= 10 && !subtype.includes('.')) {
      return subtype.toUpperCase();
    }
    
    // Last resort: truncate long subtypes
    if (subtype.length > 10) {
      return subtype.substring(0, 10).toUpperCase() + '...';
    }
    
    return subtype.toUpperCase() || 'FILE';
  };

  // Get file icon
  const getFileIcon = (file) => {
    if (!file || !file.type) return '📁';
    const type = file.type.toLowerCase();
    if (type.includes('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('text/')) return '📝';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    if (type.includes('video/')) return '🎥';
    if (type.includes('audio/')) return '🎵';
    if (type.includes('zip') || type.includes('rar') || type.includes('archive')) return '🗜️';
    if (type.includes('code') || type.includes('javascript') || type.includes('python')) return '💻';
    return '📁';
  };

  const getFileTypeIcon = (type) => {
    if (type?.includes('image')) return FiImage;
    return FiFile;
  };

  const handleDelete = async (id) => {
    if (deletingFileId) return;
    setDeletingFileId(id);
    const loading = toast.loading("Deleting File...");
    try {
  // Optimistic: remove first
  setAllFiles(prev => prev.filter((file) => file.id !== id));
  setFilteredFiles(prev => prev.filter((file) => file.id !== id));
  await axios.delete("/api/googleDrive", { data: { id } });
  cacheInvalidate("GET:/api/googleDrive");
  if (selectedFolder) cacheInvalidate(`GET:/api/googleDrive?folderId=${selectedFolder}`);
  toast.dismiss(loading);
  toast.success("File deleted successfully.");
    } catch (error) {
      toast.dismiss(loading);
      toast.error("Failed to delete file.");
    } finally {
      setDeletingFileId(null);
    }
  };

  const handleUpdateTitle = async (id, title) => {
    const loading = toast.loading("Updating title...");
    try {
  // Optimistic title update
  setAllFiles(prev => prev.map((file) => (file.id === id ? { ...file, title } : file)));
  setFilteredFiles(prev => prev.map((file) => (file.id === id ? { ...file, title } : file)));
  await axios.put("/api/googleDrive", { id, title });
  cacheInvalidate("GET:/api/googleDrive");
  if (selectedFolder) cacheInvalidate(`GET:/api/googleDrive?folderId=${selectedFolder}`);
  toast.dismiss(loading);
  toast.success("Title updated successfully.");
  setEditingFile(null);
    } catch (error) {
      toast.dismiss(loading);
      toast.error("Failed to update title.");
    }
  };

  const openFile = async (file) => {
    if (file.isProtected) {
      setAccessingFile(file);
    } else {
      window.open(file.pdf, "_blank", "noreferrer");
    }
  };

  const verifyPasswordAndOpen = async () => {
    if (!accessPassword || !accessingFile) return;
    const loading = toast.loading("Verifying password...");
    try {
      const res = await axios.put("/api/googleDrive", {
        id: accessingFile.id,
        password: accessPassword,
      });
      toast.dismiss(loading);
      toast.success("Access granted!");
      setAccessingFile(null);
      setAccessPassword("");
      window.open(res.data.fileUrl, "_blank", "noreferrer");
    } catch (err) {
      toast.dismiss(loading);
      toast.error("Incorrect password.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="px-3 sm:px-4 lg:px-6 py-6 max-w-7xl mx-auto">
        {/* Compact Header */}
        <PageHeader 
          title="Drive" 
          subtitle={selectedFolder ? (folders.find(f=>f.id===selectedFolder)?.name || 'Folder') : 'All files'}
          actions={
            <>
              <div className="relative w-full sm:w-48">
                <FiSearch className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Search files..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-2 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1.5 rounded-lg border ${viewMode==='grid' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  title="Grid view"
                >
                  <FiGrid size={14} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1.5 rounded-lg border ${viewMode==='list' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                  title="List view"
                >
                  <FiList size={14} />
                </button>
                {session?.user?.email == "nittishbaboria123@gmail.com" && (
                  <button
                    onClick={createFolder}
                    disabled={creatingFolder}
                    className="px-2.5 py-1.5 rounded-lg disabled:opacity-50 bg-purple-600 hover:bg-purple-700 text-white text-sm border border-purple-600 transition-colors"
                  >
                    <span className="inline-flex items-center gap-1"><FiPlus size={14} /> New</span>
                  </button>
                )}
                <input
                  ref={headerFileInputRef}
                  type="file"
                  className="hidden"
                  multiple
                  onChange={handleInputChange}
                />
                <button
                  onClick={() => headerFileInputRef.current?.click()}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm border border-blue-600 transition-colors"
                >
                  <span className="inline-flex items-center gap-1"><MdCloudUpload size={14} /> Upload</span>
                </button>
              </div>
            </>
          }
        />

        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Compact Folders Sidebar */}
          <aside className="xl:col-span-1 order-1">
            <SectionCard>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900">
                  <FiFolder size={16} />
                  Folders
                </h2>
                {session?.user?.email == "nittishbaboria123@gmail.com" && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={createFolder}
                      disabled={creatingFolder}
                      className="px-2 py-1 disabled:opacity-50 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-all"
                    >
                      {creatingFolder ? '...' : 'New'}
                    </button>
                    <button
                      onClick={deleteFolder}
                      disabled={!selectedFolder || deletingFolder}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all border ${!selectedFolder || deletingFolder ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400 border-gray-300' : 'bg-red-600 hover:bg-red-700 text-white border-red-600'}`}
                    >
                      {deletingFolder ? '...' : 'Del'}
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-1.5 sm:h-full h-48 overflow-y-auto">
                <button
                  onClick={() => setSelectedFolder(null)}
                  className={`w-full text-left px-2.5 py-1.5 rounded bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-900 ${selectedFolder === null ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-sm"><FiFolder size={14} /> All files</span>
                  </div>
                </button>
                {isLoadingFolders ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="h-8 rounded bg-gray-200 animate-pulse" />
                  ))
                ) : folders.length ? (
                  folders.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFolder(f.id)}
                      className={`w-full text-left px-2.5 py-1.5 rounded bg-white border border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-900 ${selectedFolder === f.id ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm"><FiFolder size={14} /> {f.name}</span>
                        <span className="text-xs text-gray-600">{f.filesCount ?? 0}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-xs text-gray-600">No folders yet</div>
                )}
              </div>
            </SectionCard>
          </aside>

          {/* Compact Upload Section */}
          <section className="xl:col-span-1 order-2">
            <SectionCard>
              <h2 className="text-base font-semibold mb-3 flex items-center gap-2 text-gray-900">
                <MdCloudUpload size={16} />
                Upload Files
              </h2>
              
              {/* Compact Upload Area */}
              <div 
                className="relative w-full"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  onChange={handleInputChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept="*/*"
                  multiple
                />
                <div 
                  className={`w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-600 transition-all duration-200 relative ${isDragOver ? 'scale-105 border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                  <FiUpload 
                    size={20} 
                    className={`mb-1 transition-colors ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`}
                  />
                  <span className="text-xs text-center px-2 font-medium">
                    {isDragOver ? 'Drop files here' : 'Drag & drop or click'}
                  </span>
                </div>
              </div>

              {/* Compact Upload Queue Controls */}
              {uploadQueue.length > 0 && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Queue ({uploadQueue.length})</span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={startUploads}
                        disabled={isUploading}
                        className="px-2 py-1 disabled:opacity-50 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs font-medium transition-colors"
                        onMouseEnter={(e) => {
                          if (!e.currentTarget.disabled) {
                            e.currentTarget.style.backgroundColor = 'var(--theme-secondary)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'var(--theme-primary)';
                        }}
                      >
                        {isUploading ? '...' : 'Start'}
                      </button>
                      <button
                        onClick={() => setUploadQueue([])}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
                      >
                        Clear
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Compact Upload Queue */}
            {uploadQueue.length > 0 && (
              <SectionCard className="mt-3">
                <h3 className="text-sm font-semibold mb-2" style={{ color: 'var(--theme-primary)' }}>Upload Queue</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {uploadQueue.map((uploadItem) => (
                    <div key={uploadItem.id} className="bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm">{getFileIcon(uploadItem.file)}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-gray-900 truncate">
                              {uploadItem.file.name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{formatFileSize(uploadItem.file.size)}</span>
                              <span 
                                className="px-1 py-0.5 rounded text-xs"
                                style={
                                  uploadItem.status === UPLOAD_STATUS.COMPLETED 
                                    ? { backgroundColor: 'rgba(var(--theme-primary-rgb), 0.2)', color: 'var(--theme-primary)' }
                                    : uploadItem.status === UPLOAD_STATUS.UPLOADING
                                    ? { backgroundColor: 'rgba(var(--theme-secondary-rgb), 0.2)', color: 'var(--theme-secondary)' }
                                    : uploadItem.status === UPLOAD_STATUS.PAUSED
                                    ? { backgroundColor: 'rgba(234, 179, 8, 0.2)', color: 'rgb(234, 179, 8)' }
                                    : uploadItem.status === UPLOAD_STATUS.FAILED
                                    ? { backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'rgb(239, 68, 68)' }
                                    : { backgroundColor: 'rgba(156, 163, 175, 0.2)', color: 'rgb(156, 163, 175)' }
                                }
                              >
                                {uploadItem.status}
                              </span>
                              {uploadItem.uploadedBytes > 0 && (
                                <span className="text-xs" style={{ color: 'var(--theme-primary)' }}>
                                  {formatFileSize(uploadItem.uploadedBytes)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* Compact Action buttons */}
                        <div className="flex items-center gap-0.5">
                          {uploadItem.status === UPLOAD_STATUS.UPLOADING && (
                            <button
                              onClick={() => pauseUpload(uploadItem.id)}
                              className="p-1 text-yellow-400 hover:bg-yellow-400/20 rounded transition-colors"
                              title="Pause"
                            >
                              <FiPause size={10} />
                            </button>
                          )}
                          {uploadItem.status === UPLOAD_STATUS.PAUSED && (
                            <button
                              onClick={() => resumeUpload(uploadItem.id)}
                              className="p-1 rounded transition-colors"
                              style={{ color: 'var(--theme-primary)' }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(var(--theme-primary-rgb), 0.2)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              title="Resume"
                            >
                              <FiPlay size={10} />
                            </button>
                          )}
                          {uploadItem.status === UPLOAD_STATUS.FAILED && (
                            <button
                              onClick={() => retryUpload(uploadItem.id)}
                              className="p-1 rounded transition-colors"
                              style={{ color: 'var(--theme-secondary)' }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(var(--theme-secondary-rgb), 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              title="Retry"
                            >
                              <MdRefresh size={10} />
                            </button>
                          )}
                          <button
                            onClick={() => removeFromQueue(uploadItem.id)}
                            className="p-1 text-red-400 hover:bg-red-400/20 rounded transition-colors"
                            title="Remove"
                          >
                            <FiX size={10} />
                          </button>
                        </div>
                      </div>

                      {/* Compact Input Fields */}
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          placeholder="Title"
                          value={uploadItem.title}
                          onChange={(e) => updateUploadItem(uploadItem.id, 'title', e.target.value)}
                          className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={uploadItem.status === UPLOAD_STATUS.UPLOADING}
                        />
                        
                        <div className="flex items-center gap-1.5 p-1.5 bg-white border border-gray-300 rounded">
                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password (optional)"
                            value={uploadItem.password}
                            onChange={(e) => updateUploadItem(uploadItem.id, 'password', e.target.value)}
                            className="flex-1 bg-transparent text-xs text-gray-900 placeholder-gray-500"
                            disabled={uploadItem.status === UPLOAD_STATUS.UPLOADING}
                          />
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              setShowPassword(!showPassword);
                            }}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            {showPassword ? <FaEye size={10} /> : <FaEyeSlash size={10} />}
                          </button>
                        </div>
                      </div>

                      {/* Compact Progress bar */}
                      <div className="mt-1.5">
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{Math.round(uploadItem.progress)}%</span>
                          <span>{uploadItem.uploadedChunks}/{uploadItem.totalChunks}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full transition-all"
                            style={{
                              width: `${uploadItem.progress}%`,
                              ...(uploadItem.status === UPLOAD_STATUS.COMPLETED 
                                ? { backgroundColor: 'var(--theme-primary)' }
                                : uploadItem.status === UPLOAD_STATUS.FAILED 
                                ? { backgroundColor: 'rgb(239, 68, 68)' }
                                : uploadItem.status === UPLOAD_STATUS.PAUSED 
                                ? { backgroundColor: 'rgb(234, 179, 8)' }
                                : { backgroundColor: 'var(--theme-secondary)' })
                            }}
                          ></div>
                        </div>
                      </div>

                      {/* Compact Upload stats */}
                      {(uploadItem.status === UPLOAD_STATUS.UPLOADING || uploadItem.status === UPLOAD_STATUS.PAUSED) && (
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                          <span>{uploadItem.status === UPLOAD_STATUS.UPLOADING ? formatSpeed(uploadItem.speed) : 'Paused'}</span>
                          <span>{uploadItem.status === UPLOAD_STATUS.UPLOADING ? formatTimeRemaining(uploadItem.timeRemaining) : 'Paused'}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </section>

          {/* Compact Files Section */}
          <section className="xl:col-span-2 order-3">
            <SectionCard className="max-h-[75vh]">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold flex items-center gap-2 text-gray-900">
                  <FiFile size={16} />
                  {selectedFolder ? (folders.find(f=>f.id===selectedFolder)?.name || 'Folder') : 'All files'}
                  <span className="text-gray-600 text-xs">({filteredFiles.length})</span>
                </h2>
                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={selectAllVisible}
                      className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 text-xs hover:bg-gray-50"
                      disabled={filteredFiles.length === 0}
                      title="Select all"
                    >
                      All
                    </button>
                    <button
                      onClick={clearSelection}
                      className="px-2 py-1 rounded border border-gray-300 bg-white text-gray-700 text-xs hover:bg-gray-50"
                      disabled={selectedFileIds.size === 0}
                      title="Clear"
                    >
                      Clear
                    </button>
                    <button
                      onClick={bulkDeleteSelected}
                      disabled={selectedFileIds.size === 0 || isBulkDeleting}
                      className={`px-2 py-1 rounded text-xs font-medium transition-all ${selectedFileIds.size === 0 || isBulkDeleting ? 'opacity-50 cursor-not-allowed bg-red-600/60 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                      title="Delete selected"
                    >
                      {isBulkDeleting ? '...' : `Del (${selectedFileIds.size})`}
                    </button>
                  </div>
                )}
              </div>

              <div className={`${viewMode==='grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'space-y-2'} max-h-96 overflow-y-scroll`}>
                {isLoading ? (
                  viewMode==='grid' ? 
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-20 rounded-lg bg-gray-200 animate-pulse border border-gray-300" />
                    )) :
                    Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-12 rounded-lg bg-gray-200 animate-pulse" />
                    ))
                ) : filteredFiles.length > 0 ? (
                  filteredFiles.map((file, index) => {
                    const FileIcon = getFileTypeIcon(file.type);
                    if (viewMode === 'grid') {
                      return (
                        <div
                          key={file.id}
                          className={`group relative rounded-lg border ${(isAdmin && selectedFileIds.has(file.id)) ? 'border-purple-400 ring-2 ring-purple-400 bg-purple-50' : 'border-gray-300'} bg-white hover:bg-gray-50 hover:border-blue-400 shadow-sm transition-colors p-2.5`}
                        >
                          {isAdmin && (
                            <input
                              type="checkbox"
                              checked={selectedFileIds.has(file.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelectFile(file.id);
                              }}
                              className="absolute top-1.5 left-1.5 h-3 w-3 accent-purple-500 cursor-pointer"
                            />
                          )}
                          <div className="absolute top-1.5 right-1.5 text-xs px-1 py-0.5 rounded bg-gray-100 text-gray-700">
                            {index + 1}
                          </div>
                          
                          <div className="flex items-start gap-2.5">
                            <div 
                              className="p-1.5 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                            >
                              <FileIcon size={14} />
                            </div>
                            <div className="min-w-0 flex-1">
                              {editingFile?.id === file.id ? (
                                <input
                                  type="text"
                                  value={editingFile.title}
                                  onChange={(e) => setEditingFile({ ...editingFile, title: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateTitle(file.id, editingFile.title);
                                    }
                                  }}
                                  className="w-full bg-white border border-gray-300 rounded px-1.5 py-1 text-xs font-medium text-gray-900 mb-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                <button className="text-left w-full" onClick={() => openFile(file)}>
                                  <h3 
                                    className="font-medium text-gray-900 hover:text-purple-600 text-sm truncate transition-colors"
                                  >
                                    {file.title}
                                  </h3>
                                </button>
                              )}
                              
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="inline-flex items-center gap-1">
                                  <MdDescription size={9} />
                                  {getFileTypeShort(file.type)}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <MdAccessTime size={9} />
                                  {formatDate(file.dateUploaded)}
                                </span>
                                {file.isProtected && <span className="inline-flex items-center gap-1 text-yellow-600"><MdLock size={9} />🔒</span>}
                              </div>
                            </div>
                          </div>

                          {session?.user?.email === 'nittishbaboria123@gmail.com' && (
                            <div className="mt-2 flex items-center gap-1 justify-end">
                              {editingFile?.id === file.id ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateTitle(file.id, editingFile.title)}
                                    className="px-1.5 py-1 rounded text-xs"
                                    style={{ backgroundColor: 'rgba(var(--theme-primary-rgb), 0.2)', color: 'rgba(var(--theme-primary-rgb), 0.8)' }}
                                  >
                                    <FiSave size={10} />
                                  </button>
                                  <button
                                    onClick={() => setEditingFile(null)}
                                    className="px-1.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs"
                                  >
                                    <FiX size={10} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => setEditingFile({ id: file.id, title: file.title })}
                                    className="px-1.5 py-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 text-xs transition-colors"
                                  >
                                    <FiEdit size={10} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(file.id)}
                                    disabled={deletingFileId === file.id}
                                    className="px-1.5 py-1 rounded bg-red-100 hover:bg-red-200 text-red-700 text-xs"
                                  >
                                    {deletingFileId === file.id ? 
                                      <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div> : 
                                      <FiTrash2 size={10} />
                                    }
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    }

                    // List view - more compact
                    return (
                      <div
                        key={file.id}
                        className={`group bg-white hover:bg-gray-50 p-2.5 rounded-lg border shadow-sm ${(isAdmin && selectedFileIds.has(file.id)) ? 'border-purple-400 ring-2 ring-purple-400 bg-purple-50' : 'border-gray-300 hover:border-blue-400'} transition-colors`}
                        onClick={() => editingFile?.id !== file.id && openFile(file)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            {isAdmin && (
                              <input
                                type="checkbox"
                                checked={selectedFileIds.has(file.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  toggleSelectFile(file.id);
                                }}
                                className="h-3 w-3 accent-purple-500 cursor-pointer"
                              />
                            )}
                            <span className="text-xs text-gray-600 w-5 text-center">{index + 1}</span>
                            <div 
                              className="p-1 rounded flex-shrink-0 bg-gradient-to-r from-blue-500 to-purple-600"
                            >
                              <FileIcon className="text-white" size={12} />
                            </div>
                            <div className="flex-1 min-w-0">
                              {editingFile?.id === file.id ? (
                                <input
                                  type="text"
                                  value={editingFile.title}
                                  onChange={(e) => setEditingFile({ ...editingFile, title: e.target.value })}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      handleUpdateTitle(file.id, editingFile.title);
                                    }
                                  }}
                                  className="w-full bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs font-medium text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                              ) : (
                                <div className="flex items-center gap-1 mb-0.5">
                                  <h3 
                                    className="font-medium text-gray-900 hover:text-purple-600 text-sm truncate transition-colors"
                                  >
                                    {file.title}
                                  </h3>
                                  {file.isProtected && (<MdLock className="text-yellow-600 flex-shrink-0" size={10} />)}
                                </div>
                              )}
                              
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MdDescription size={9} />
                                  {getFileTypeShort(file.type)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MdAccessTime size={9} />
                                  {formatDate(file.dateUploaded)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {session?.user?.email === 'nittishbaboria123@gmail.com' && (
                            <div className="flex items-center gap-1">
                              {editingFile?.id === file.id ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleUpdateTitle(file.id, editingFile.title);
                                    }}
                                    className="p-1 rounded transition-colors"
                                    style={{ color: 'var(--theme-primary)', backgroundColor: 'rgba(var(--theme-primary-rgb), 0.2)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(var(--theme-primary-rgb), 0.3)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(var(--theme-primary-rgb), 0.2)'}
                                  >
                                    <FiSave size={10} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingFile(null);
                                    }}
                                    className="p-1 rounded bg-gray-500/20 hover:bg-gray-500/30 text-gray-400"
                                  >
                                    <FiX size={10} />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setEditingFile({ id: file.id, title: file.title });
                                    }}
                                    className="p-1 rounded bg-blue-100 hover:bg-blue-200 text-blue-700 hover:text-blue-800 transition-colors"
                                  >
                                    <FiEdit size={10} />
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(file.id);
                                    }}
                                    disabled={deletingFileId === file.id}
                                    className="p-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-400"
                                  >
                                    {deletingFileId === file.id ? (
                                      <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                      <FiTrash2 size={10} />
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2">📁</div>
                    <p className="text-gray-600 text-sm mb-1">No files found</p>
                    <p className="text-gray-500 text-xs">Upload your first file to get started</p>
                  </div>
                )}
              </div>
            </SectionCard>
          </section>
        </div>

        {/* Compact Password Modal */}
        {accessingFile && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setAccessPassword("");
                setAccessingFile(null);
              }
            }}
          >
            <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-sm border border-gray-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 bg-gradient-to-r from-blue-500 to-purple-600"
                >
                  <FiShield className="text-white" size={16} />
                </div>
                <h2 className="text-base font-semibold text-gray-900 mb-1">Protected File</h2>
                <p className="text-sm text-gray-600 truncate px-2">"{accessingFile.title}"</p>
              </div>
              <input
                type="password"
                placeholder="Enter password"
                value={accessPassword}
                onChange={(e) => setAccessPassword(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3"
                autoFocus
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    verifyPasswordAndOpen();
                  }
                }}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setAccessPassword("");
                    setAccessingFile(null);
                  }}
                  className="flex-1 p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={verifyPasswordAndOpen}
                  className="flex-1 p-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all text-sm"
                >
                  Access
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
