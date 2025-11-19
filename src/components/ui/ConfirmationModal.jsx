import { X, AlertTriangle, Info, CheckCircle, HelpCircle } from 'lucide-react';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // 'warning', 'danger', 'info', 'success'
  isLoading = false,
  confirmColor = "red",
  children
}) => {
  if (!isOpen) return null;

  // Icon and color configuration based on type
  const typeConfig = {
    warning: {
      icon: AlertTriangle,
      iconColor: "text-yellow-600",
      bgColor: "bg-yellow-100",
      confirmButtonColor: "bg-yellow-500 hover:bg-yellow-600"
    },
    danger: {
      icon: AlertTriangle,
      iconColor: "text-red-600",
      bgColor: "bg-red-100",
      confirmButtonColor: "bg-red-500 hover:bg-red-600"
    },
    info: {
      icon: Info,
      iconColor: "text-blue-600",
      bgColor: "bg-blue-100",
      confirmButtonColor: "bg-blue-500 hover:bg-blue-600"
    },
    success: {
      icon: CheckCircle,
      iconColor: "text-green-600",
      bgColor: "bg-green-100",
      confirmButtonColor: "bg-green-500 hover:bg-green-600"
    },
    default: {
      icon: HelpCircle,
      iconColor: "text-gray-600",
      bgColor: "bg-gray-100",
      confirmButtonColor: "bg-gray-500 hover:bg-gray-600"
    }
  };

  const config = typeConfig[type] || typeConfig.default;
  const IconComponent = config.icon;

  // Override confirm button color if provided
  const getConfirmButtonColor = () => {
    if (confirmColor === "red") return "bg-red-500 hover:bg-red-600";
    if (confirmColor === "green") return "bg-green-500 hover:bg-green-600";
    if (confirmColor === "blue") return "bg-blue-500 hover:bg-blue-600";
    if (confirmColor === "yellow") return "bg-yellow-500 hover:bg-yellow-600";
    return config.confirmButtonColor;
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[0.5px] flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 dark:text-white rounded-lg shadow-lg w-full max-w-md p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 cursor-pointer disabled:opacity-50"
        >
          <X size={20} />
        </button>

        {/* Header with Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 ${config.bgColor} rounded-full flex items-center justify-center`}>
            <IconComponent className={`w-5 h-5 ${config.iconColor}`} />
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        {/* Message */}
        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">
            {message}
          </p>
          {children && <div className="mt-3">{children}</div>}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg py-2 px-4 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 ${getConfirmButtonColor()} text-white rounded-lg py-2 px-4 font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </div>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;