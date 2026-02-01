'use client';

import { useState, useRef, useEffect } from 'react';
import EmailTable from './EmailTableEnhanced';

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

export default function EmailClientEnhanced() {
  const [email, setEmail] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [mailbox, setMailbox] = useState<'inbox' | 'spam'>('inbox');
  const [startFrom, setStartFrom] = useState(1);
  const [limit, setLimit] = useState(10);
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFromDomain, setFilterFromDomain] = useState('');
  const [filterFromEmail, setFilterFromEmail] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set());
  const [copyStatus, setCopyStatus] = useState('');
  const [totalEmails, setTotalEmails] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const columnSelectorRef = useRef<HTMLDivElement>(null);

  // Column configuration
  const [columns, setColumns] = useState<ColumnConfig[]>([
    { id: 'checkbox', label: 'Select', enabled: true },
    { id: 'ip', label: 'IP Address', enabled: true },
    { id: 'domain', label: 'Domain', enabled: true },
    { id: 'fromDomain', label: 'From Domain', enabled: true },
    { id: 'fromName', label: 'From Name', enabled: false },
    { id: 'fromEmail', label: 'From Email', enabled: true },
    { id: 'to', label: 'To', enabled: true },
    { id: 'spfStatus', label: 'SPF Status', enabled: false },
    { id: 'dkimStatus', label: 'DKIM Status', enabled: false },
    { id: 'dmarcStatus', label: 'DMARC Status', enabled: false },
    { id: 'feedbackId', label: 'Feedback-ID', enabled: false },
    { id: 'listId', label: 'List-ID', enabled: false },
    { id: 'contentType', label: 'Content-Type', enabled: false },
    { id: 'messageId', label: 'Message-ID', enabled: false },
    { id: 'received', label: 'Received', enabled: false },
    { id: 'sender', label: 'Sender', enabled: false },
    { id: 'listUnsubscribe', label: 'List-Unsubscribe', enabled: false },
    { id: 'mimeVersion', label: 'MIME-Version', enabled: false },
    { id: 'date', label: 'Date', enabled: true },
    { id: 'subject', label: 'Subject', enabled: false },
    { id: 'preview', label: 'Preview', enabled: false },
  ]);

  // Load dark mode preference
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode) {
      setDarkMode(JSON.parse(savedDarkMode));
    }
  }, []);

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Close column selector when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (columnSelectorRef.current && !columnSelectorRef.current.contains(event.target as Node)) {
        setShowColumnSelector(false);
      }
    }

    if (showColumnSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showColumnSelector]);

  // Load saved credentials from localStorage
  useEffect(() => {
    const savedEmail = localStorage.getItem('gmail_email');
    const savedPassword = localStorage.getItem('gmail_password');
    if (savedEmail) setEmail(savedEmail);
    if (savedPassword) setAppPassword(savedPassword);

    // Load saved column preferences
    const savedColumns = localStorage.getItem('email_columns');
    if (savedColumns) {
      try {
        setColumns(JSON.parse(savedColumns));
      } catch (e) {
        console.error('Error loading column preferences:', e);
      }
    }
  }, []);

  // Save column preferences
  useEffect(() => {
    localStorage.setItem('email_columns', JSON.stringify(columns));
  }, [columns]);

  const toggleColumn = (columnId: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, enabled: !col.enabled } : col
    ));
  };

  const handleFetchEmails = async () => {
    if (!email || !appPassword) {
      setError('Please enter both email and app password');
      return;
    }

    localStorage.setItem('gmail_email', email);
    localStorage.setItem('gmail_password', appPassword);

    setLoading(true);
    setError('');
    setCopyStatus('');
    setSelectedEmails(new Set());

    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          appPassword: appPassword.trim(),
          mailbox,
          sortOrder,
          startFrom: Math.max(1, parseInt(startFrom as any) || 1),
          limit: Math.min(100, Math.max(1, parseInt(limit as any) || 10)),
          search: searchTerm.trim(),
          fromDomain: filterFromDomain.trim(),
          fromEmail: filterFromEmail.trim(),
          to: filterTo.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch emails');
      }

      const formattedEmails = data.emails.map((email: any) => {
        const date = new Date(email.date);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        return {
          ...email,
          date: isToday 
            ? date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            : date.toLocaleString('en-US', {
                month: '2-digit',
                day: '2-digit',
                year: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              }),
          fromEmail: email.fromEmail || 'unknown',
          fromDomain: email.fromDomain || 'unknown',
          ip: email.ip === 'Unknown' ? 'N/A' : email.ip
        };
      });

      setEmails(formattedEmails);
      setTotalEmails(data.total || formattedEmails.length);
    } catch (err: any) {
      if (err.message.includes('Invalid credentials')) {
        setError('Invalid email or password. Please check your credentials and ensure you\'re using an app password.');
      } else if (err.message.includes('spam')) {
        setError('Unable to access spam folder. Make sure your Gmail account has spam emails or try using inbox instead.');
      } else {
        setError(err.message || 'Failed to fetch emails. Please check your internet connection and try again.');
      }
      console.error('Error fetching emails:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSortByDate = () => {
    const newSortOrder = sortOrder === 'ASC' ? 'DESC' : 'ASC';
    setSortOrder(newSortOrder);
    
    if (emails.length > 0) {
      const sortedEmails = [...emails].sort((a, b) => {
        const dateA = new Date(a.date.includes('/') ? a.date : new Date().toDateString() + ' ' + a.date).getTime();
        const dateB = new Date(b.date.includes('/') ? b.date : new Date().toDateString() + ' ' + b.date).getTime();
        return newSortOrder === 'ASC' ? dateA - dateB : dateB - dateA;
      });
      setEmails(sortedEmails);
    }
  };

  const copyToClipboard = (content: string, type: string) => {
    if (!content.trim()) {
      setCopyStatus(`No ${type.toLowerCase()} to copy`);
      setTimeout(() => setCopyStatus(''), 3000);
      return;
    }

    navigator.clipboard.writeText(content)
      .then(() => {
        setCopyStatus(`✅ Copied ${type} to clipboard!`);
        setTimeout(() => setCopyStatus(''), 3000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        setCopyStatus('❌ Failed to copy!');
      });
  };

  const handleCopyIPs = () => {
    const ips = emails
      .map(e => e.ip)
      .filter(ip => ip && ip !== 'N/A' && ip !== 'Unknown')
      .join('\n');
    copyToClipboard(ips, 'IPs');
  };

  const handleCopyDomains = () => {
    const domains = emails
      .map(e => e.fromDomain)
      .filter(d => d && d !== 'unknown')
      .join('\n');
    copyToClipboard(domains, 'Domains');
  };

  const handleCopyFromDomain = () => {
    const fromDomains = emails
      .map(e => e.fromDomain)
      .filter(d => d && d !== 'unknown')
      .join('\n');
    copyToClipboard(fromDomains, 'From Domains');
  };

  const handleCopyByDomain = () => {
    if (!filterFromDomain) {
      setCopyStatus('Please enter a domain in "From Domain" field first');
      setTimeout(() => setCopyStatus(''), 3000);
      return;
    }
    
    const data = emails
      .filter(e => e.fromDomain.toLowerCase() === filterFromDomain.toLowerCase())
      .map(e => `${e.ip} - ${e.fromEmail} - ${e.date}`)
      .join('\n');
    copyToClipboard(data || `No emails from domain: ${filterFromDomain}`, 'Domain Data');
  };

  const handleCopyByIP = () => {
    const selectedIPs = Array.from(selectedEmails)
      .map(uid => {
        const email = emails.find(e => e.uid === uid);
        return email ? email.ip : '';
      })
      .filter(ip => ip && ip !== 'N/A' && ip !== 'Unknown')
      .join('\n');
    copyToClipboard(selectedIPs || 'Select emails first to copy IPs', 'Selected IPs');
  };

  const toggleEmailSelection = (uid: string) => {
    const newSelected = new Set(selectedEmails);
    if (newSelected.has(uid)) {
      newSelected.delete(uid);
    } else {
      newSelected.add(uid);
    }
    setSelectedEmails(newSelected);
  };

  const selectAllEmails = () => {
    if (selectedEmails.size === emails.length) {
      setSelectedEmails(new Set());
    } else {
      setSelectedEmails(new Set(emails.map(e => e.uid)));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterFromDomain('');
    setFilterFromEmail('');
    setFilterTo('');
  };

  // Stats calculation
  const stats = {
    total: totalEmails,
    selected: selectedEmails.size,
    unique_ips: new Set(emails.map(e => e.ip).filter(ip => ip && ip !== 'N/A')).size,
    unique_domains: new Set(emails.map(e => e.fromDomain).filter(d => d && d !== 'unknown')).size,
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Top Navigation Bar */}
      <nav className={`sticky top-0 z-50 shadow-lg transition-all duration-300 ${
        darkMode 
          ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700' 
          : 'bg-gradient-to-r from-white via-gray-50 to-white border-b border-gray-200'
      }`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className={`p-2 rounded-lg transition-all duration-300 lg:hidden ${
                  darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    WMN2 Dashboard
                  </h1>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Gmail Management System</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  darkMode 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 focus:ring-indigo-500' 
                    : 'bg-gradient-to-r from-gray-200 to-gray-300 focus:ring-blue-500'
                }`}
              >
                <div className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-300 transform ${
                  darkMode ? 'translate-x-7 bg-gray-900' : 'translate-x-0 bg-white'
                } flex items-center justify-center shadow-lg`}>
                  {darkMode ? (
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </button>

              {totalEmails > 0 && (
                <div className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>
                    {totalEmails} emails
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className={`${sidebarCollapsed ? 'hidden lg:block lg:w-20' : 'w-64'} transition-all duration-300 flex-shrink-0 min-h-screen ${
          darkMode ? 'bg-gray-900 border-r border-gray-800' : 'bg-white border-r border-gray-200'
        }`}>
          <div className="p-4 space-y-6">
            {/* Stats Cards */}
            <div className="space-y-3">
              <div className={`${sidebarCollapsed ? 'hidden' : 'block'}`}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Statistics</h3>
              </div>
              
              <div className={`rounded-xl p-4 border transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700' 
                  : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={sidebarCollapsed ? 'mx-auto' : ''}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-700'}`}>{stats.total}</div>
                    {!sidebarCollapsed && <div className={`text-xs mt-1 ${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>Total Emails</div>}
                  </div>
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-700' 
                  : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={sidebarCollapsed ? 'mx-auto' : ''}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-700'}`}>{stats.selected}</div>
                    {!sidebarCollapsed && <div className={`text-xs mt-1 ${darkMode ? 'text-green-300' : 'text-green-600'}`}>Selected</div>}
                  </div>
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700' 
                  : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={sidebarCollapsed ? 'mx-auto' : ''}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-700'}`}>{stats.unique_ips}</div>
                    {!sidebarCollapsed && <div className={`text-xs mt-1 ${darkMode ? 'text-purple-300' : 'text-purple-600'}`}>Unique IPs</div>}
                  </div>
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className={`rounded-xl p-4 border transition-all duration-300 hover:scale-105 ${
                darkMode 
                  ? 'bg-gradient-to-br from-orange-900/50 to-orange-800/50 border-orange-700' 
                  : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={sidebarCollapsed ? 'mx-auto' : ''}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-orange-400' : 'text-orange-700'}`}>{stats.unique_domains}</div>
                    {!sidebarCollapsed && <div className={`text-xs mt-1 ${darkMode ? 'text-orange-300' : 'text-orange-600'}`}>Domains</div>}
                  </div>
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            {!sidebarCollapsed && (
              <div className={`pt-4 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                <h3 className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>Mailboxes</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setMailbox('inbox');
                      if (email && appPassword) setTimeout(() => handleFetchEmails(), 100);
                    }}
                    className={`w-full flex items-center gap-3 mb-4 px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      mailbox === 'inbox'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/50'
                        : darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <span className="font-medium">Inbox</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      setMailbox('spam');
                      if (email && appPassword) setTimeout(() => handleFetchEmails(), 100);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 ${
                      mailbox === 'spam'
                        ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/50'
                        : darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="font-medium">Spam</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <div className="max-w-10xl mx-auto space-y-6">
            {/* Configuration Card */}
            <div className={`rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 ${
              darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              <div className="bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configuration
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Credentials */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@gmail.com"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 shadow-sm ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                        } border focus:ring-2`}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      App Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className={`w-5 h-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type="password"
                        value={appPassword}
                        onChange={(e) => setAppPassword(e.target.value)}
                        placeholder="••••••••••••••••"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl transition-all duration-300 shadow-sm ${
                          darkMode 
                            ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' 
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                        } border focus:ring-2`}
                      />
                    </div>
                    <p className={`mt-2 text-xs flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      Generate from{" "}
                      <a 
                        href="https://myaccount.google.com/apppasswords" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 font-medium underline"
                      >
                        Google Settings
                      </a>
                    </p>
                  </div>
                </div>

                {/* Filters & Column Selector */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Filters & Search</label>
                    <div className="flex items-center gap-2">
                      {/* Column Selector Dropdown */}
                      <div className="relative" ref={columnSelectorRef}>
                        <button
                          onClick={() => setShowColumnSelector(!showColumnSelector)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 border ${
                            darkMode 
                              ? 'bg-indigo-900/50 text-indigo-300 hover:bg-indigo-800/50 border-indigo-700' 
                              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200'
                          }`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                          </svg>
                          Columns
                          <svg className={`w-4 h-4 transition-transform ${showColumnSelector ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {showColumnSelector && (
                          <div className={`absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border py-3 z-50 ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          }`}>
                            <div className={`px-4 py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                              <h3 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Select Columns</h3>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                              {columns.map((column) => (
                                <button
                                  key={column.id}
                                  onClick={() => toggleColumn(column.id)}
                                  className={`w-full px-4 py-2.5 flex items-center justify-between transition-colors text-left ${
                                    darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{column.label}</span>
                                  <div className={`w-11 h-6 rounded-full transition-colors ${column.enabled ? 'bg-blue-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'}`}>
                                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${column.enabled ? 'translate-x-6' : 'translate-x-0.5'} mt-0.5`}></div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={clearFilters}
                        className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                          darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Clear All
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="🔍 Search emails..."
                      className={`px-4 py-3 rounded-xl transition-all duration-300 shadow-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                      } border focus:ring-2`}
                    />
                    <input
                      type="text"
                      value={filterFromDomain}
                      onChange={(e) => setFilterFromDomain(e.target.value)}
                      placeholder="From Domain (gmail.com)"
                      className={`px-4 py-3 rounded-xl transition-all duration-300 shadow-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                      } border focus:ring-2`}
                    />
                    <input
                      type="text"
                      value={filterFromEmail}
                      onChange={(e) => setFilterFromEmail(e.target.value)}
                      placeholder="From Email"
                      className={`px-4 py-3 rounded-xl transition-all duration-300 shadow-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                      } border focus:ring-2`}
                    />
                    <input
                      type="text"
                      value={filterTo}
                      onChange={(e) => setFilterTo(e.target.value)}
                      placeholder="To Email"
                      className={`px-4 py-3 rounded-xl transition-all duration-300 shadow-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                      } border focus:ring-2`}
                    />
                  </div>
                </div>

                {/* Pagination Controls */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Start From</label>
                    <input
                      type="number"
                      value={startFrom}
                      onChange={(e) => setStartFrom(parseInt(e.target.value) || 1)}
                      min="1"
                      className={`w-full px-4 py-3 rounded-xl transition-all duration-300 shadow-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                      } border focus:ring-2`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Limit</label>
                    <input
                      type="number"
                      value={limit}
                      onChange={(e) => setLimit(parseInt(e.target.value) || 10)}
                      min="1"
                      max="100"
                      className={`w-full px-4 py-3 rounded-xl transition-all duration-300 shadow-sm ${
                        darkMode 
                          ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                          : 'bg-white border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-transparent'
                      } border focus:ring-2`}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className={`flex flex-wrap gap-3 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <button
                    onClick={handleFetchEmails}
                    disabled={loading || !email || !appPassword}
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        <span>Fetch Emails</span>
                      </>
                    )}
                  </button>

                  <div className="flex flex-wrap gap-2 ml-auto">
                    <button onClick={handleCopyIPs} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow transform hover:scale-105 ${
                      darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-slate-700 text-white hover:bg-slate-800'
                    }`}>
                      Copy IPs
                    </button>
                    <button onClick={handleCopyDomains} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 shadow transform hover:scale-105 ${
                      darkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-slate-700 text-white hover:bg-slate-800'
                    }`}>
                      Copy Domains
                    </button>
                    <button onClick={handleCopyByDomain} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-300 shadow transform hover:scale-105">
                      By Domain
                    </button>
                    <button onClick={handleCopyByIP} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all duration-300 shadow transform hover:scale-105">
                      By IP
                    </button>
                  </div>
                </div>

                {/* Status Messages */}
                {copyStatus && (
                  <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 border transition-all duration-300 ${
                    copyStatus.includes('✅') 
                      ? darkMode
                        ? 'bg-green-900/50 text-green-300 border-green-700'
                        : 'bg-green-50 text-green-700 border-green-200'
                      : copyStatus.includes('❌')
                      ? darkMode
                        ? 'bg-red-900/50 text-red-300 border-red-700'
                        : 'bg-red-50 text-red-700 border-red-200'
                      : darkMode
                      ? 'bg-blue-900/50 text-blue-300 border-blue-700'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    <div className="text-lg">
                      {copyStatus.includes('✅') ? '✅' : copyStatus.includes('❌') ? '❌' : 'ℹ️'}
                    </div>
                    <span>{copyStatus}</span>
                  </div>
                )}

                {error && (
                  <div className={`p-4 border rounded-xl transition-all duration-300 ${
                    darkMode ? 'bg-red-900/50 border-red-700' : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-start gap-3">
                      <div className="text-red-500 text-xl">⚠️</div>
                      <div className="flex-1">
                        <p className={`font-semibold ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{error}</p>
                        {error.includes('Invalid credentials') && (
                          <ul className={`mt-3 text-sm space-y-1 list-disc list-inside ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                            <li>Enable 2-Step Verification in Google Account</li>
                            <li>Generate App Password from Settings</li>
                            <li>Use 16-character password (no spaces)</li>
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Email Table */}
            {emails.length > 0 && (
              <div className={`rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 px-6 py-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        {mailbox === 'inbox' ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        )}
                        {mailbox === 'inbox' ? 'Inbox' : 'Spam'}
                      </h2>
                      <p className="text-sm text-slate-300 mt-1">
                        Showing {startFrom} - {Math.min(startFrom + limit - 1, totalEmails)} of {totalEmails} emails
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={selectAllEmails}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
                          selectedEmails.size === emails.length
                            ? 'bg-white text-slate-700 shadow-lg'
                            : 'bg-slate-600 text-white hover:bg-slate-500'
                        }`}
                      >
                        {selectedEmails.size === emails.length ? '✗ Deselect All' : '✓ Select All'}
                      </button>
                      
                      <button
                        onClick={handleSortByDate}
                        className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium hover:bg-slate-500 transition-all duration-300 flex items-center gap-2 transform hover:scale-105"
                      >
                        <span>Sort by Date</span>
                        <span className="text-lg">{sortOrder === 'ASC' ? '↑' : '↓'}</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <EmailTable 
                    emails={emails} 
                    sortOrder={sortOrder} 
                    onSort={handleSortByDate}
                    selectedEmails={selectedEmails}
                    onSelectEmail={toggleEmailSelection}
                    visibleColumns={columns}
                    darkMode={darkMode}
                  />
                  
                  {/* Pagination */}
                  {totalEmails > limit && (
                    <div className={`mt-6 flex justify-between items-center pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                      <button
                        onClick={() => {
                          const newStart = Math.max(1, startFrom - limit);
                          setStartFrom(newStart);
                          handleFetchEmails();
                        }}
                        disabled={startFrom <= 1}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 ${
                          darkMode 
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Previous
                      </button>
                      
                      <span className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Page {Math.ceil(startFrom / limit)} of {Math.ceil(totalEmails / limit)}
                      </span>
                      
                      <button
                        onClick={() => {
                          const newStart = startFrom + limit;
                          setStartFrom(newStart);
                          handleFetchEmails();
                        }}
                        disabled={startFrom + limit > totalEmails}
                        className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform hover:scale-105 ${
                          darkMode 
                            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Next
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading && emails.length === 0 && email && appPassword && (
              <div className={`rounded-2xl shadow-xl border overflow-hidden transition-all duration-300 ${
                darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              }`}>
                <div className="text-center py-16 px-6">
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${
                    darkMode ? 'bg-gradient-to-br from-blue-900/50 to-indigo-900/50' : 'bg-gradient-to-br from-blue-100 to-indigo-100'
                  }`}>
                    <svg className={`w-10 h-10 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>No emails found</h3>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                    Try adjusting your filters or fetching from a different mailbox
                  </p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
    <footer
  className={`mt-8 py-6 border-t transition-all duration-300 ${
    darkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
  }`}
>
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div className="flex flex-col md:flex-row justify-between items-center gap-4">

      {/* Developer */}
      <div className="text-center">
        <p className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Developed by
        </p>

        <div className="flex items-center gap-2 mt-1 justify-center">
          <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center animate-pulse">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>

          <p className="text-lg font-bold bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">
            Mohamed Hichy
          </p>
        </div>

        {/* Telegram link */}
        <a
          href="https://t.me/Hichy33"
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-2 inline-flex items-center gap-2 text-sm font-medium transition-colors ${
            darkMode
              ? 'text-cyan-400 hover:text-cyan-300'
              : 'text-cyan-600 hover:text-cyan-500'
          }`}
        >
          <svg
            className="w-4 h-4"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M9.04 15.84 8.9 19.8c.51 0 .73-.22 1-.48l2.4-2.28 4.97 3.64c.91.5 1.56.24 1.8-.84l3.26-15.3c.33-1.54-.56-2.14-1.45-1.8L1.63 9.58c-1.5.58-1.48 1.42-.27 1.8l4.6 1.44L17.8 5.3c.56-.37 1.07-.17.65.2" />
          </svg>
          @Hichy33
        </a>
      </div>

      {/* Copyright */}
      <div className={`text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <p>© {new Date().getFullYear()} WMN2. All rights reserved.</p>
        <p className="mt-1">Advanced Email Analytics Platform</p>
      </div>

    </div>
  </div>
</footer>

    </div>
  );
}