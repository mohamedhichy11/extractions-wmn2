import { NextRequest, NextResponse } from 'next/server';
import Imap from 'imap';
import { simpleParser } from 'mailparser';

interface EmailData {
  uid: string;
  subject: string;
  from: string;
  fromEmail: string;
  fromDomain: string;
  fromName: string;
  to: string;
  date: Date;
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

interface RequestBody {
  email: string;
  appPassword: string;
  mailbox: 'inbox' | 'spam';
  sortOrder?: 'ASC' | 'DESC';
  startFrom?: number;
  limit?: number;
  search?: string;
  fromDomain?: string;
  fromEmail?: string;
  to?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { 
      email, 
      appPassword, 
      mailbox = 'inbox', 
      sortOrder = 'DESC', 
      startFrom = 1,
      limit = 10,
      search = '',
      fromDomain = '',
      fromEmail = '',
      to = ''
    } = body;

    if (!email || !appPassword) {
      return NextResponse.json(
        { error: 'Email and app password are required' },
        { status: 400 }
      );
    }

    const emails = await fetchEmails(
      email, 
      appPassword, 
      mailbox, 
      sortOrder, 
      startFrom, 
      limit,
      search,
      fromDomain,
      fromEmail,
      to
    );
    
    return NextResponse.json({ 
      emails,
      total: emails.length,
      mailbox
    });
  } catch (error: any) {
    console.error('Error fetching emails:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch emails' },
      { status: 500 }
    );
  }
}

function extractFromInfo(fromHeader: string): { email: string; domain: string; name: string } {
  try {
    let name = '';
    let email = '';
    
    // Extract name and email from "Name <email@domain.com>" format
    const nameEmailMatch = fromHeader.match(/^(.+?)\s*<([^>]+)>$/);
    if (nameEmailMatch) {
      name = nameEmailMatch[1].replace(/['"]/g, '').trim();
      email = nameEmailMatch[2].trim();
    } else {
      // Try to extract just email
      const emailMatch = fromHeader.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      email = emailMatch ? emailMatch[0] : fromHeader;
    }
    
    const domain = email.split('@')[1] || '';
    
    return { 
      email: email.toLowerCase(), 
      domain: domain.toLowerCase(),
      name: name || email.split('@')[0] || ''
    };
  } catch {
    return { email: '', domain: '', name: '' };
  }
}

function extractIPFromHeaders(headers: any): string {
  console.log('🔍 ====== Starting IP Extraction ======');
  console.log('📋 All Headers:', JSON.stringify(headers, null, 2));
  
  try {
    // قائمة الحقول التي قد تحتوي على IP
    const headerFields = [
      'x-originating-ip',
      'x-sender-ip',
      'received',
      'x-mailgun-sending-ip',
      'x-postmark-spamcheck',
      'x-spamcop-source-ip',
      'x-remote-ip',
      'x-sender',
      'x-sender-ip-address'
    ];

    // تحقق من الحقول المباشرة
    for (const field of headerFields) {
      const headerValue = headers[field];
      console.log(`🔎 Checking field '${field}':`, headerValue);
      
      if (headerValue) {
        const headerStr = Array.isArray(headerValue) 
          ? headerValue.join(' ') 
          : headerValue.toString();
        
        console.log(`📝 Field '${field}' value:`, headerStr.substring(0, 200));
        
        // ابحث عن IPv4
        const ipv4Match = headerStr.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
        if (ipv4Match) {
          console.log(`✅ Found potential IPv4 in '${field}':`, ipv4Match[0]);
          if (isValidIP(ipv4Match[0])) {
            console.log(`✅ Valid IP found:`, ipv4Match[0]);
            return ipv4Match[0];
          }
        }
      }
    }

    // استخرج من حقل Received (الأهم)
    console.log('🔄 Checking Received headers specifically...');
    const receivedHeaders = headers['received'];
    
    if (receivedHeaders) {
      const receivedArray = Array.isArray(receivedHeaders) 
        ? receivedHeaders 
        : [receivedHeaders];
      
      console.log(`📨 Found ${receivedArray.length} Received header(s)`);
      
      // افحص كل received header
      for (let i = 0; i < receivedArray.length; i++) {
        const received = receivedArray[i];
        const receivedStr = received.toString();
        
        console.log(`📬 Received[${i}]:`, receivedStr.substring(0, 300));
        
        // أنماط شائعة في Received headers
        const patterns = [
          { name: 'Pattern 1', regex: /from\s+.*?\[([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\]/i },
          { name: 'Pattern 2', regex: /\(.*?\[([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\].*?\)/i },
          { name: 'Pattern 3', regex: /from\s+.*?\(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\)/i },
          { name: 'Pattern 4', regex: /\[([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\]/ },
          { name: 'Pattern 5', regex: /\b([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\b/ }
        ];

        for (const pattern of patterns) {
          const match = receivedStr.match(pattern.regex);
          if (match && match[1]) {
            console.log(`🎯 ${pattern.name} matched IP:`, match[1]);
            if (isValidIP(match[1])) {
              // تحقق إذا كان IP خاص
              if (isPrivateIP(match[1])) {
                console.log(`⚠️ Skipping private IP:`, match[1]);
                continue;
              }
              console.log(`✅ Valid public IP found:`, match[1]);
              return match[1];
            } else {
              console.log(`❌ Invalid IP format:`, match[1]);
            }
          }
        }
      }
    } else {
      console.log('❌ No Received headers found');
    }

    console.log('⚠️ No IP found, returning Unknown');
    return 'Unknown';
  } catch (error) {
    console.error('❌ Error extracting IP:', error);
    return 'Unknown';
  }
}

function isValidIP(ip: string): boolean {
  console.log(`🔍 Validating IP: ${ip}`);
  
  // Basic IPv4 validation
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip)) {
    const parts = ip.split('.').map(Number);
    const isValid = parts.every(part => part >= 0 && part <= 255);
    console.log(`✓ IPv4 validation result: ${isValid}`);
    return isValid;
  }
  
  // Basic IPv6 validation (simplified)
  if (/^[A-F0-9:]+$/i.test(ip)) {
    console.log(`✓ IPv6 format detected`);
    return true;
  }
  
  console.log(`✗ Invalid IP format`);
  return false;
}

function isPrivateIP(ip: string): boolean {
  const parts = ip.split('.').map(Number);
  
  // 10.0.0.0/8
  if (parts[0] === 10) return true;
  
  // 172.16.0.0/12
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  
  // 192.168.0.0/16
  if (parts[0] === 192 && parts[1] === 168) return true;
  
  // 127.0.0.0/8 (localhost)
  if (parts[0] === 127) return true;
  
  return false;
}

function extractToInfo(toHeader: string): string[] {
  try {
    if (!toHeader) return [];
    
    // Extract all email addresses from To field
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const matches = toHeader.match(emailPattern);
    
    return matches ? matches.map(email => email.toLowerCase()) : [];
  } catch {
    return [];
  }
}

function getHeaderValue(headers: any, key: string): string {
  try {
    const value = headers[key];
    if (!value) return '';
    if (Array.isArray(value)) return value[0] || '';
    return value.toString();
  } catch {
    return '';
  }
}

function extractAuthenticationResults(headers: any): { spf: string; dkim: string; dmarc: string } {
  try {
    // Get authentication-results header
    const authResults = getHeaderValue(headers, 'authentication-results');
    
    let spfStatus = 'none';
    let dkimStatus = 'none';
    let dmarcStatus = 'none';
    
    if (authResults) {
      console.log('🔐 Authentication Results:', authResults);
      
      // Extract SPF status
      const spfMatch = authResults.match(/spf=([a-z]+)/i);
      if (spfMatch) spfStatus = spfMatch[1].toLowerCase();
      
      // Extract DKIM status
      const dkimMatch = authResults.match(/dkim=([a-z]+)/i);
      if (dkimMatch) dkimStatus = dkimMatch[1].toLowerCase();
      
      // Extract DMARC status
      const dmarcMatch = authResults.match(/dmarc=([a-z]+)/i);
      if (dmarcMatch) dmarcStatus = dmarcMatch[1].toLowerCase();
    }
    
    // Also check received-spf header
    const receivedSpf = getHeaderValue(headers, 'received-spf');
    if (receivedSpf && spfStatus === 'none') {
      if (receivedSpf.toLowerCase().includes('pass')) spfStatus = 'pass';
      else if (receivedSpf.toLowerCase().includes('fail')) spfStatus = 'fail';
      else if (receivedSpf.toLowerCase().includes('softfail')) spfStatus = 'softfail';
      else if (receivedSpf.toLowerCase().includes('neutral')) spfStatus = 'neutral';
    }
    
    console.log(`✅ SPF: ${spfStatus}, DKIM: ${dkimStatus}, DMARC: ${dmarcStatus}`);
    
    return { spf: spfStatus, dkim: dkimStatus, dmarc: dmarcStatus };
  } catch (error) {
    console.error('Error extracting authentication results:', error);
    return { spf: 'none', dkim: 'none', dmarc: 'none' };
  }
}

async function fetchEmails(
  email: string,
  appPassword: string,
  mailbox: 'inbox' | 'spam',
  sortOrder: 'ASC' | 'DESC',
  startFrom: number,
  limit: number,
  search: string,
  fromDomain: string,
  fromEmail: string,
  to: string
): Promise<EmailData[]> {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email,
      password: appPassword,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000
    });

    const emails: EmailData[] = [];

    imap.once('ready', () => {
      // Gmail uses special names for mailboxes
      const gmailMailbox = mailbox === 'spam' ? '[Gmail]/Spam' : 'INBOX';
      
      imap.openBox(gmailMailbox, false, (err, box) => {
        if (err) {
          reject(new Error(`Failed to open mailbox: ${err.message}`));
          return;
        }

        const totalMessages = box.messages.total;
        if (totalMessages === 0) {
          imap.end();
          resolve([]);
          return;
        }

        // Calculate message sequence numbers
        let startSeq = Math.max(1, startFrom);
        let endSeq = Math.min(totalMessages, startFrom + limit - 1);

        // For DESC order (newest first), we need to reverse
        if (sortOrder === 'DESC') {
          startSeq = Math.max(1, totalMessages - startFrom - limit + 2);
          endSeq = totalMessages - startFrom + 1;
        }

        // Ensure valid range
        startSeq = Math.max(1, Math.min(startSeq, totalMessages));
        endSeq = Math.max(startSeq, Math.min(endSeq, totalMessages));

        const fetchOptions = {
          bodies: ['HEADER', 'TEXT'],
          struct: true
        };

        const fetch = imap.seq.fetch(`${startSeq}:${endSeq}`, fetchOptions);

        let processedCount = 0;
        const totalToProcess = endSeq - startSeq + 1;

        fetch.on('message', (msg) => {
          let emailBuffer = '';
          let headers: any = null;
          let emailData: Partial<EmailData> = {};

          msg.on('body', (stream, info) => {
            let buffer = '';
            stream.on('data', (chunk) => {
              buffer += chunk.toString('utf8');
            });
            stream.once('end', () => {
              if (info.which === 'HEADER') {
                try {
                  headers = Imap.parseHeader(buffer);
                } catch (e) {
                  console.error('Error parsing headers:', e);
                }
              }
              emailBuffer += buffer;
            });
          });

          msg.once('attributes', (attrs) => {
            emailData.uid = attrs.uid.toString();
            emailData.date = attrs.date;
          });

          msg.once('end', async () => {
            try {
              if (!headers) {
                throw new Error('No headers found');
              }

              console.log('\n\n========================================');
              console.log('📧 Processing Email UID:', emailData.uid);
              console.log('========================================\n');

              // Parse email data
              const fromHeader = getHeaderValue(headers, 'from');
              const toHeader = headers.to ? headers.to.join(', ') : '';
              const subject = getHeaderValue(headers, 'subject') || '(No Subject)';
              
              console.log('📨 Subject:', subject);
              console.log('📤 From:', fromHeader);
              
              const { email: fromEmailAddr, domain: fromDomainAddr, name: fromNameStr } = extractFromInfo(fromHeader);
              const toEmails = extractToInfo(toHeader);
              
              // Extract IP address
              const ip = extractIPFromHeaders(headers);
              
              // Extract authentication status (SPF, DKIM, DMARC)
              const authStatus = extractAuthenticationResults(headers);
              
              // Extract additional header fields
              const feedbackId = getHeaderValue(headers, 'feedback-id');
              const listId = getHeaderValue(headers, 'list-id');
              const contentType = getHeaderValue(headers, 'content-type');
              const messageId = getHeaderValue(headers, 'message-id');
              const received = getHeaderValue(headers, 'received');
              const sender = getHeaderValue(headers, 'sender');
              const listUnsubscribe = getHeaderValue(headers, 'list-unsubscribe');
              const mimeVersion = getHeaderValue(headers, 'mime-version');
              
              console.log('🌐 Final IP Result:', ip);
              console.log('🔐 Auth Status:', authStatus);
              console.log('========================================\n\n');
              
              // Get preview text
              let preview = '';
              try {
                const parsed = await simpleParser(emailBuffer);
                preview = parsed.text?.substring(0, 200) || (parsed.html || "").replace(/<[^>]*>/g, "").replace(/<[^>]*>/g, '').substring(0, 200) || '';
              } catch (parseError) {
                preview = 'Unable to parse email content';
              }

              // Apply filters
              let shouldInclude = true;
              
              if (search) {
                const searchLower = search.toLowerCase();
                shouldInclude = 
                  subject.toLowerCase().includes(searchLower) ||
                  fromHeader.toLowerCase().includes(searchLower) ||
                  fromEmailAddr.toLowerCase().includes(searchLower) ||
                  preview.toLowerCase().includes(searchLower);
              }
              
              if (fromDomain && fromDomainAddr.toLowerCase() !== fromDomain.toLowerCase()) {
                shouldInclude = false;
              }
              
              if (fromEmail && fromEmailAddr.toLowerCase() !== fromEmail.toLowerCase()) {
                shouldInclude = false;
              }
              
              if (to && !toEmails.some(e => e.includes(to.toLowerCase()))) {
                shouldInclude = false;
              }

              if (shouldInclude) {
                emails.push({
                  uid: emailData.uid!,
                  subject,
                  from: fromHeader,
                  fromEmail: fromEmailAddr,
                  fromDomain: fromDomainAddr,
                  fromName: fromNameStr,
                  to: toHeader,
                  date: emailData.date!,
                  preview,
                  mailbox,
                  ip,
                  spfStatus: authStatus.spf,
                  dkimStatus: authStatus.dkim,
                  dmarcStatus: authStatus.dmarc,
                  feedbackId,
                  listId,
                  contentType,
                  messageId,
                  received,
                  sender,
                  listUnsubscribe,
                  mimeVersion
                } as EmailData);
              }

              processedCount++;
              
              // When all messages are processed
              if (processedCount === totalToProcess) {
                imap.end();
                
                // Sort emails based on requested order
                if (sortOrder === 'ASC') {
                  emails.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                } else {
                  emails.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                }
                
                resolve(emails);
              }
            } catch (parseError) {
              console.error('Error processing email:', parseError);
              processedCount++;
              
              if (processedCount === totalToProcess) {
                imap.end();
                resolve(emails);
              }
            }
          });
        });

        fetch.once('error', (err) => {
          reject(new Error(`IMAP fetch error: ${err.message}`));
        });

        fetch.once('end', () => {
          // In case we didn't get all messages
          if (processedCount < totalToProcess) {
            setTimeout(() => {
              imap.end();
              resolve(emails);
            }, 5000);
          }
        });
      });
    });

    imap.once('error', (err: Error) => {
      reject(new Error(`IMAP connection error: ${err.message}`));
    });

    imap.once('end', () => {
      console.log('IMAP connection ended');
    });

    imap.connect();
  });
}
