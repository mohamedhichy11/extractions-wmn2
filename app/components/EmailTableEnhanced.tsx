'use client';

interface Email {
  uid: string;
  subject: string;
  from: string;
  fromEmail: string;
  fromDomain: string;
  fromName: string;
  to: string;
  date: string;
  preview: string;
  mailbox: string;
  ip: string;
  spfStatus?: string;
  dkimStatus?: string;
  dmarcStatus?: string;
  feedbackId?: string;
  listId?: string;
  contentType?: string;
  messageId?: string;
  received?: string;
  sender?: string;
  listUnsubscribe?: string;
  mimeVersion?: string;
}

interface ColumnConfig {
  id: string;
  label: string;
  enabled: boolean;
}

interface EmailTableProps {
  emails: Email[];
  sortOrder: 'ASC' | 'DESC';
  onSort: () => void;
  selectedEmails: Set<string>;
  onSelectEmail: (uid: string) => void;
  visibleColumns: ColumnConfig[];
  darkMode?: boolean;
}

export default function EmailTableEnhanced({ 
  emails, 
  sortOrder, 
  onSort,
  selectedEmails,
  onSelectEmail,
  visibleColumns,
  darkMode = false
}: EmailTableProps) {
  if (emails.length === 0) {
    return (
      <div className="text-center py-12">
        <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>No emails found</p>
      </div>
    );
  }

  const isColumnVisible = (columnId: string) => {
    const column = visibleColumns.find(col => col.id === columnId);
    return column ? column.enabled : false;
  };

  return (
    <div className={`overflow-x-auto rounded-xl border shadow-sm transition-colors duration-300 ${
      darkMode ? 'border-gray-700' : 'border-gray-200'
    }`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr className={`transition-colors duration-300 ${
            darkMode 
              ? 'bg-gradient-to-r from-gray-800 to-gray-700' 
              : 'bg-gradient-to-r from-slate-50 to-slate-100'
          }`}>
            {isColumnVisible('checkbox') && (
              <th className="px-4 py-4 w-12">
                <div className="flex items-center justify-center">
                  <div className={`w-5 h-5 rounded border-2 ${
                    darkMode ? 'border-gray-500' : 'border-slate-300'
                  }`}></div>
                </div>
              </th>
            )}
            
            {isColumnVisible('ip') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-green-900/50' : 'bg-green-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>IP Address</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('domain') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>Domain</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('fromDomain') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-orange-900/50' : 'bg-orange-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-orange-400' : 'text-orange-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>From Domain</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('fromEmail') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>From Email</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('fromName') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-cyan-900/50' : 'bg-cyan-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-cyan-400' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>From Name</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('to') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-teal-900/50' : 'bg-teal-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-teal-400' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>To</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('spfStatus') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-green-900/50' : 'bg-green-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>SPF Status</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('dkimStatus') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-blue-900/50' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>DKIM Status</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('dmarcStatus') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-purple-900/50' : 'bg-purple-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>DMARC Status</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('feedbackId') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-amber-900/50' : 'bg-amber-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>Feedback-ID</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('listId') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-lime-900/50' : 'bg-lime-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-lime-400' : 'text-lime-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>List-ID</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('contentType') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-emerald-900/50' : 'bg-emerald-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>Content-Type</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('messageId') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-sky-900/50' : 'bg-sky-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-sky-400' : 'text-sky-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>Message-ID</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('received') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-rose-900/50' : 'bg-rose-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-rose-400' : 'text-rose-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>Received</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('sender') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-violet-900/50' : 'bg-violet-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-violet-400' : 'text-violet-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>Sender</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('listUnsubscribe') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-fuchsia-900/50' : 'bg-fuchsia-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-fuchsia-400' : 'text-fuchsia-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>List-Unsubscribe</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('mimeVersion') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-stone-700' : 'bg-stone-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-stone-400' : 'text-stone-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>MIME-Version</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('subject') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-yellow-900/50' : 'bg-yellow-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>Subject</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('preview') && (
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    darkMode ? 'bg-pink-900/50' : 'bg-pink-100'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-pink-400' : 'text-pink-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>Preview</span>
                </div>
              </th>
            )}
            
            {isColumnVisible('date') && (
              <th 
                className={`px-6 py-4 text-left cursor-pointer transition-colors group ${
                  darkMode ? 'hover:bg-gray-700' : 'hover:bg-slate-200'
                }`}
                onClick={onSort}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    darkMode 
                      ? 'bg-indigo-900/50 group-hover:bg-indigo-800/50' 
                      : 'bg-indigo-100 group-hover:bg-indigo-200'
                  }`}>
                    <svg className={`w-4 h-4 ${darkMode ? 'text-indigo-400' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                    darkMode ? 'text-gray-300' : 'text-slate-700'
                  }`}>
                    Date
                    <span className="text-sm transition-transform group-hover:scale-125">
                      {sortOrder === 'ASC' ? '↑' : '↓'}
                    </span>
                  </span>
                </div>
              </th>
            )}
          </tr>
        </thead>
        <tbody className={`divide-y transition-colors duration-300 ${
          darkMode ? 'bg-gray-800 divide-gray-700' : 'bg-white divide-gray-100'
        }`}>
          {emails.map((email, index) => (
            <tr 
              key={email.uid} 
              className={`transition-all duration-150 cursor-pointer ${
                selectedEmails.has(email.uid) 
                  ? darkMode
                    ? 'bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border-l-4 border-l-blue-500 shadow-sm' 
                    : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500 shadow-sm'
                  : darkMode
                  ? 'hover:bg-gray-700 hover:shadow-sm'
                  : 'hover:bg-slate-50 hover:shadow-sm'
              }`}
              onClick={() => onSelectEmail(email.uid)}
            >
              {isColumnVisible('checkbox') && (
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedEmails.has(email.uid)}
                      onChange={() => {}}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEmail(email.uid);
                      }}
                      className={`w-5 h-5 rounded-md border-2 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer transition-all ${
                        darkMode 
                          ? 'border-gray-500 hover:border-blue-400 bg-gray-700' 
                          : 'border-slate-300 hover:border-blue-400'
                      }`}
                    />
                  </div>
                </td>
              )}
              
              {isColumnVisible('ip') && (
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-mono font-semibold shadow-sm ${
                    email.ip === 'N/A' || email.ip === 'Unknown'
                      ? darkMode
                        ? 'bg-gray-700 text-gray-400 border border-gray-600'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                      : darkMode
                      ? 'bg-gradient-to-r from-green-900/50 to-emerald-900/50 text-green-300 border border-green-700'
                      : 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200'
                  }`}>
                    {email.ip === 'N/A' || email.ip === 'Unknown' ? (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        N/A
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                        {email.ip}
                      </span>
                    )}
                  </div>
                </td>
              )}
              
              {isColumnVisible('domain') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        darkMode 
                          ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/50' 
                          : 'bg-gradient-to-br from-purple-100 to-purple-200'
                      }`}>
                        <span className={`text-xs font-bold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>
                          {email.fromDomain.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span className={`text-sm font-medium truncate max-w-[120px] ${
                        darkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {email.fromDomain}
                      </span>
                    </div>
                    <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 whitespace-nowrap ${
                      darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                    }`}>
                      {email.fromDomain}
                      <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                        darkMode ? 'bg-gray-900' : 'bg-slate-900'
                      }`}></div>
                    </div>
                  </div>
                </td>
              )}
              
              {isColumnVisible('fromDomain') && (
                <td className="px-6 py-4">
                  <div className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                    {email.fromDomain}
                  </div>
                </td>
              )}
              
              {isColumnVisible('fromEmail') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        darkMode 
                          ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50' 
                          : 'bg-gradient-to-br from-blue-100 to-blue-200'
                      }`}>
                        <svg className={`w-4 h-4 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <span className={`text-sm font-medium truncate max-w-[150px] ${
                        darkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {email.fromEmail}
                      </span>
                    </div>
                    <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 whitespace-nowrap ${
                      darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                    }`}>
                      {email.fromEmail}
                      <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                        darkMode ? 'bg-gray-900' : 'bg-slate-900'
                      }`}></div>
                    </div>
                  </div>
                </td>
              )}
              
              {isColumnVisible('fromName') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        darkMode 
                          ? 'bg-gradient-to-br from-cyan-900/50 to-cyan-800/50' 
                          : 'bg-gradient-to-br from-cyan-100 to-cyan-200'
                      }`}>
                        <svg className={`w-4 h-4 ${darkMode ? 'text-cyan-300' : 'text-cyan-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-medium truncate max-w-[150px] ${
                        darkMode ? 'text-gray-200' : 'text-gray-900'
                      }`}>
                        {email.fromName || 'N/A'}
                      </span>
                    </div>
                    <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 whitespace-nowrap ${
                      darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                    }`}>
                      {email.fromName || 'N/A'}
                      <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                        darkMode ? 'bg-gray-900' : 'bg-slate-900'
                      }`}></div>
                    </div>
                  </div>
                </td>
              )}
              
              {isColumnVisible('to') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        darkMode 
                          ? 'bg-gradient-to-br from-teal-900/50 to-teal-800/50' 
                          : 'bg-gradient-to-br from-teal-100 to-teal-200'
                      }`}>
                        <svg className={`w-4 h-4 ${darkMode ? 'text-teal-300' : 'text-teal-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className={`text-sm truncate max-w-[180px] ${
                        darkMode ? 'text-gray-300' : 'text-slate-600'
                      }`}>
                        {email.to}
                      </span>
                    </div>
                    <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 max-w-xs break-words ${
                      darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                    }`}>
                      {email.to}
                      <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                        darkMode ? 'bg-gray-900' : 'bg-slate-900'
                      }`}></div>
                    </div>
                  </div>
                </td>
              )}
              
              {isColumnVisible('spfStatus') && (
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    email.spfStatus === 'pass' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : email.spfStatus === 'fail'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : email.spfStatus === 'softfail'
                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                      : email.spfStatus === 'neutral'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 border border-gray-600'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}>
                    {email.spfStatus?.toUpperCase() || 'NONE'}
                  </span>
                </td>
              )}
              
              {isColumnVisible('dkimStatus') && (
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    email.dkimStatus === 'pass' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : email.dkimStatus === 'fail'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : email.dkimStatus === 'neutral'
                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 border border-gray-600'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}>
                    {email.dkimStatus?.toUpperCase() || 'NONE'}
                  </span>
                </td>
              )}
              
              {isColumnVisible('dmarcStatus') && (
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    email.dmarcStatus === 'pass' 
                      ? 'bg-green-100 text-green-800 border border-green-300' 
                      : email.dmarcStatus === 'fail'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : email.dmarcStatus === 'quarantine'
                      ? 'bg-orange-100 text-orange-800 border border-orange-300'
                      : email.dmarcStatus === 'reject'
                      ? 'bg-red-100 text-red-800 border border-red-300'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 border border-gray-600'
                      : 'bg-gray-100 text-gray-600 border border-gray-300'
                  }`}>
                    {email.dmarcStatus?.toUpperCase() || 'NONE'}
                  </span>
                </td>
              )}
              
              {isColumnVisible('feedbackId') && (
                <td className="px-6 py-4">
                  <span className={`text-sm truncate max-w-[150px] block ${
                    darkMode ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {email.feedbackId || 'N/A'}
                  </span>
                </td>
              )}
              
              {isColumnVisible('listId') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <span className={`text-sm truncate max-w-[150px] block ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {email.listId || 'N/A'}
                    </span>
                    {email.listId && (
                      <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 max-w-xs break-words ${
                        darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {email.listId}
                        <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                          darkMode ? 'bg-gray-900' : 'bg-slate-900'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </td>
              )}
              
              {isColumnVisible('contentType') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <span className={`text-sm truncate max-w-[150px] block ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {email.contentType || 'N/A'}
                    </span>
                    {email.contentType && (
                      <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 max-w-xs break-words ${
                        darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {email.contentType}
                        <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                          darkMode ? 'bg-gray-900' : 'bg-slate-900'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </td>
              )}
              
              {isColumnVisible('messageId') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <span className={`text-xs font-mono truncate max-w-[200px] block ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {email.messageId || 'N/A'}
                    </span>
                    {email.messageId && (
                      <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 max-w-md break-words font-mono ${
                        darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {email.messageId}
                        <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                          darkMode ? 'bg-gray-900' : 'bg-slate-900'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </td>
              )}
              
              {isColumnVisible('received') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <span className={`text-xs truncate max-w-[200px] block ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {email.received ? email.received.substring(0, 50) + '...' : 'N/A'}
                    </span>
                    {email.received && (
                      <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 max-w-md break-words ${
                        darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {email.received}
                        <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                          darkMode ? 'bg-gray-900' : 'bg-slate-900'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </td>
              )}
              
              {isColumnVisible('sender') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <span className={`text-sm truncate max-w-[150px] block ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {email.sender || 'N/A'}
                    </span>
                    {email.sender && (
                      <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 whitespace-nowrap ${
                        darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {email.sender}
                        <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                          darkMode ? 'bg-gray-900' : 'bg-slate-900'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </td>
              )}
              
              {isColumnVisible('listUnsubscribe') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <span className={`text-xs truncate max-w-[150px] block ${
                      darkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {email.listUnsubscribe ? email.listUnsubscribe.substring(0, 30) + '...' : 'N/A'}
                    </span>
                    {email.listUnsubscribe && (
                      <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 max-w-md break-words ${
                        darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                      }`}>
                        {email.listUnsubscribe}
                        <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                          darkMode ? 'bg-gray-900' : 'bg-slate-900'
                        }`}></div>
                      </div>
                    )}
                  </div>
                </td>
              )}
              
              {isColumnVisible('mimeVersion') && (
                <td className="px-6 py-4">
                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    {email.mimeVersion || 'N/A'}
                  </span>
                </td>
              )}
              
              {isColumnVisible('subject') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <span className={`text-sm font-medium truncate max-w-[200px] block ${
                      darkMode ? 'text-gray-200' : 'text-gray-900'
                    }`}>
                      {email.subject}
                    </span>
                    <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 max-w-md ${
                      darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                    }`}>
                      {email.subject}
                      <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                        darkMode ? 'bg-gray-900' : 'bg-slate-900'
                      }`}></div>
                    </div>
                  </div>
                </td>
              )}
              
              {isColumnVisible('preview') && (
                <td className="px-6 py-4">
                  <div className="group relative">
                    <span className={`text-sm truncate max-w-[250px] block ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {email.preview}
                    </span>
                    <div className={`hidden group-hover:block absolute z-20 text-xs px-3 py-2 rounded-lg shadow-xl -top-2 left-0 max-w-md ${
                      darkMode ? 'bg-gray-900 text-white' : 'bg-slate-900 text-white'
                    }`}>
                      {email.preview}
                      <div className={`absolute -bottom-1 left-4 w-2 h-2 transform rotate-45 ${
                        darkMode ? 'bg-gray-900' : 'bg-slate-900'
                      }`}></div>
                    </div>
                  </div>
                </td>
              )}
              
              {isColumnVisible('date') && (
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      darkMode 
                        ? 'bg-gradient-to-br from-indigo-900/50 to-indigo-800/50' 
                        : 'bg-gradient-to-br from-indigo-100 to-indigo-200'
                    }`}>
                      <svg className={`w-4 h-4 ${darkMode ? 'text-indigo-300' : 'text-indigo-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className={`text-sm font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                      {email.date}
                    </span>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}