import { useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, X } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ToastProps {
  message: string;
  type: 'error' | 'success' | 'warning';
  onClose: () => void;
  duration?: number;
}

export const Toast = ({ message, type, onClose, duration = 5000 }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />;
      case 'error':
        return <XCircle className="h-5 w-5" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success':
        return 'Success';
      case 'error':
        return 'Error';
      case 'warning':
        return 'Warning';
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-200';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300 max-w-md">
      <Alert className={getStyles()}>
        <div className="flex items-start gap-3">
          {getIcon()}
          <div className="flex-1">
            <AlertTitle className="font-semibold mb-1">{getTitle()}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </div>
          <button
            onClick={onClose}
            className="opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </Alert>
    </div>
  );
};

// in this now the issue aare in , when the product is showen unknow , 
//  then it should not show any sustanibity score basically i should not show the
//   result card only . ans it should show the error component saying proper reason
//    fro that . and one more is in the result card showing the altrenative prduct 
//    links by using eindow oprn it now oprning the
//  links only rather ask the ai only to give some alternative product link it will
//   give the excat link and render in frontend  error message if it toas t also it
//    will be good