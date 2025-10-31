// components/Modal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Download } from "lucide-react";
import { useState } from "react";

export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
    xl: "max-w-6xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-hidden`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                {children}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Reusable form components
export const FormInput = ({ label, type = "text", required = false, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5DEE92] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      {...props}
    />
  </div>
);

export const FormSelect = ({ label, options, required = false, ...props }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      required={required}
      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#5DEE92] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
      {...props}
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

export const FileUpload = ({ label, accept, multiple = false, onFilesSelected }) => {
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    onFilesSelected(files);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-[#5DEE92] transition-colors">
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <Upload size={24} className="text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Click to upload or drag and drop
          </span>
          <span className="text-xs text-gray-500">
            {accept?.includes('*') ? 'Any file type' : accept}
          </span>
        </label>
      </div>
    </div>
  );
};

export const BulkImportModal = ({ isOpen, onClose, title, onFileUpload, acceptedFormats, templateDownload }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file) => {
    // Validate file type
    const fileExtension = file.name.split('.').pop().toLowerCase();
    const allowedExtensions = acceptedFormats.map(format => format.replace('.', ''));
    
    if (!allowedExtensions.includes(fileExtension)) {
      alert(`Please upload a file with one of these formats: ${acceptedFormats.join(', ')}`);
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploadStatus('uploading');
    
    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploadStatus('success');
          setTimeout(() => {
            onClose();
            setUploadProgress(0);
            setUploadStatus('idle');
            setSelectedFile(null);
          }, 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // In real implementation, you would upload to your backend
    // await onFileUpload(selectedFile);
  };

  const downloadTemplate = () => {
    // Create and download template file
    const templateData = templateDownload();
    const blob = new Blob([templateData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'action_items_template.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="p-6 space-y-6">
        {/* Download Template Section */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
            Download Template
          </h4>
          <p className="text-sm text-green-700 dark:text-green-300 mb-3">
            Download our template file to ensure proper formatting for bulk import.
          </p>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 bg-[#5de992] text-black px-4 py-2 rounded-lg hover:bg-green-600 transition-colors text-sm cursor-pointer"
          >
            <Download size={16} />
            Download CSV Template
          </button>
        </div>

        {/* Upload Section */}
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-[#5DEE92] bg-green-50 dark:bg-green-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-[#5DEE92]'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept={acceptedFormats.join(',')}
            onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
            className="hidden"
            id="bulk-upload"
          />
          
          {!selectedFile ? (
            <>
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <label htmlFor="bulk-upload" className="cursor-pointer">
                <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Drag and drop your file here
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  or <span className="text-[#5DEE92] font-medium">browse files</span>
                </p>
              </label>
              <p className="text-xs text-gray-400">
                Supported formats: {acceptedFormats.join(', ')}
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <FileText size={48} className="mx-auto text-green-500" />
              <div>
                <p className="font-semibold text-gray-700 dark:text-gray-300">
                  {selectedFile.name}
                </p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              
              {uploadStatus === 'uploading' && (
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-[#5DEE92] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}
              
              {uploadStatus === 'success' && (
                <div className="text-green-600 font-semibold">
                  ✓ Upload successful!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Supported Fields Info */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Supported Fields
          </h4>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Asset Name, Asset Type, Asset ID</li>
            <li>• Description, Location, Status</li>
            <li>• Purchase Date, Warranty Information</li>
            <li>• And all other configuration fields</li>
          </ul>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center p-6 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onClose}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
        >
          Cancel
        </button>
        
        <div className="flex gap-3">
          {selectedFile && (
            <button
              onClick={() => setSelectedFile(null)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Change File
            </button>
          )}
          
          <motion.button
            whileHover={{ scale: selectedFile ? 1.05 : 1 }}
            whileTap={{ scale: selectedFile ? 0.95 : 1 }}
            onClick={handleUpload}
            disabled={!selectedFile || uploadStatus === 'uploading'}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              selectedFile && uploadStatus !== 'uploading'
                ? 'bg-[#5DEE92] text-black hover:bg-green-500'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            {uploadStatus === 'uploading' ? 'Uploading...' : 'Upload File'}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};