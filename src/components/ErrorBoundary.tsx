import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo);
  }

  private handleReset = () => {
    window.location.reload();
  };

  private handleClearAndReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = window.location.pathname;
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4 font-sans" dir="rtl">
          <div className="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h1 className="text-xl font-bold text-slate-100">
              هەڵەیەک ڕوویدا لە بارکردنی سیستەم
            </h1>
            
            <p className="text-sm text-slate-400 leading-relaxed">
              سیستەم تووشی هەڵەیەکی کاتی بووە. دەتوانیت لاپەڕەکە نوێ بکەیتەوە یان کاشی وێبگەڕەکەت پاک بکەیتەوە بۆ دەستپێکردنەوەی خێرا.
            </p>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-950/70 rounded-xl text-xs text-rose-400 font-mono text-left max-h-24 overflow-y-auto border border-slate-800" dir="ltr">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>نوێکردنەوەی لاپەڕە</span>
              </button>
              
              <button
                onClick={this.handleClearAndReset}
                className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors cursor-pointer"
                title="پاککردنەوەی کاش"
              >
                <Trash2 className="w-4 h-4" />
                <span>پاککردنەوەی کاش</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
