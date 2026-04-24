import { NextRequest, NextResponse } from 'next/server';
import Imap from 'imap';

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
  returnPath?: string;
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
      email, appPassword,
      mailbox = 'inbox', sortOrder = 'DESC',
      startFrom = 1, limit = 10,
      search = '', fromDomain = '', fromEmail = '', to = ''
    } = body;

    if (!email || !appPassword) {
      return NextResponse.json({ error: 'Email and app password are required' }, { status: 400 });
    }

    const emails = await fetchEmails(email, appPassword, mailbox, sortOrder, startFrom, limit, search, fromDomain, fromEmail, to);
    return NextResponse.json({ emails, total: emails.length, mailbox });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch emails' }, { status: 500 });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getHeaderValue(headers: any, key: string): string {
  try {
    const value = headers[key];
    if (!value) return '';
    if (Array.isArray(value)) return value[0] || '';
    return value.toString();
  } catch { return ''; }
}

function extractFromInfo(fromHeader: string): { email: string; domain: string; name: string } {
  try {
    let name = '', emailAddr = '';
    const m = fromHeader.match(/^(.+?)\s*<([^>]+)>$/);
    if (m) { name = m[1].replace(/['"]/g, '').trim(); emailAddr = m[2].trim(); }
    else {
      const em = fromHeader.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
      emailAddr = em ? em[0] : fromHeader;
    }
    const domain = emailAddr.split('@')[1] || '';
    return { email: emailAddr.toLowerCase(), domain: domain.toLowerCase(), name: name || emailAddr.split('@')[0] || '' };
  } catch { return { email: '', domain: '', name: '' }; }
}

function extractReturnPath(h: string): string {
  try {
    if (!h) return '';
    const m = h.match(/<([^>]+)>/);
    if (m?.[1]) return m[1].toLowerCase().trim();
    const em = h.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    return em ? em[0].toLowerCase().trim() : h.trim();
  } catch { return ''; }
}

function extractToInfo(toHeader: string): string[] {
  try {
    if (!toHeader) return [];
    const m = toHeader.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g);
    return m ? m.map(e => e.toLowerCase()) : [];
  } catch { return []; }
}

function isValidIP(ip: string): boolean {
  if (/^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/.test(ip))
    return ip.split('.').map(Number).every(p => p >= 0 && p <= 255);
  return /^[A-F0-9:]+$/i.test(ip);
}

function isPrivateIP(ip: string): boolean {
  const p = ip.split('.').map(Number);
  return p[0] === 10 || (p[0] === 172 && p[1] >= 16 && p[1] <= 31) || (p[0] === 192 && p[1] === 168) || p[0] === 127;
}

function extractIPFromHeaders(headers: any): string {
  try {
    for (const field of ['x-originating-ip','x-sender-ip','x-mailgun-sending-ip','x-remote-ip','x-sender-ip-address']) {
      const val = headers[field];
      if (val) {
        const str = Array.isArray(val) ? val[0] : val.toString();
        const m = str.match(/\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}\b/);
        if (m && isValidIP(m[0]) && !isPrivateIP(m[0])) return m[0];
      }
    }
    const received = headers['received'];
    if (received) {
      const arr = Array.isArray(received) ? received : [received];
      const patterns = [
        /from\s+.*?\[([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\]/i,
        /\(.*?\[([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\].*?\)/i,
        /from\s+.*?\(([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\)/i,
        /\[([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\]/,
        /\b([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})\b/,
      ];
      for (const r of arr) {
        const str = r.toString();
        for (const pat of patterns) {
          const m = str.match(pat);
          if (m?.[1] && isValidIP(m[1]) && !isPrivateIP(m[1])) return m[1];
        }
      }
    }
    return 'Unknown';
  } catch { return 'Unknown'; }
}

function extractAuthenticationResults(headers: any): { spf: string; dkim: string; dmarc: string } {
  try {
    const auth = getHeaderValue(headers, 'authentication-results');
    let spf = auth.match(/spf=([a-z]+)/i)?.[1]?.toLowerCase()  ?? 'none';
    const dkim= auth.match(/dkim=([a-z]+)/i)?.[1]?.toLowerCase() ?? 'none';
    const dmarc=auth.match(/dmarc=([a-z]+)/i)?.[1]?.toLowerCase() ?? 'none';
    if (spf === 'none') {
      const rspf = getHeaderValue(headers, 'received-spf').toLowerCase();
      if (rspf.includes('pass')) spf = 'pass';
      else if (rspf.includes('softfail')) spf = 'softfail';
      else if (rspf.includes('fail')) spf = 'fail';
      else if (rspf.includes('neutral')) spf = 'neutral';
    }
    return { spf, dkim, dmarc };
  } catch { return { spf: 'none', dkim: 'none', dmarc: 'none' }; }
}

// ─── Core fetch ─────────────────────────────────────────────────────────────

async function fetchEmails(
  email: string, appPassword: string,
  mailbox: 'inbox' | 'spam', sortOrder: 'ASC' | 'DESC',
  startFrom: number, limit: number,
  search: string, fromDomain: string, fromEmail: string, to: string
): Promise<EmailData[]> {
  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email, password: appPassword,
      host: 'imap.gmail.com', port: 993,
      tls: true, tlsOptions: { rejectUnauthorized: false },
      authTimeout: 10000, keepalive: false,
    });

    const results: EmailData[] = [];

    imap.once('ready', () => {
      const gmailMailbox = mailbox === 'spam' ? '[Gmail]/Spam' : 'INBOX';

      // Read-only: faster, won't mark messages as seen
      imap.openBox(gmailMailbox, true, (err, box) => {
        if (err) { reject(new Error(`Failed to open mailbox: ${err.message}`)); return; }

        const total = box.messages.total;
        if (total === 0) { imap.end(); resolve([]); return; }

        let startSeq: number, endSeq: number;
        if (sortOrder === 'DESC') {
          startSeq = Math.max(1, total - startFrom - limit + 2);
          endSeq   = total - startFrom + 1;
        } else {
          startSeq = Math.max(1, startFrom);
          endSeq   = Math.min(total, startFrom + limit - 1);
        }
        startSeq = Math.max(1, Math.min(startSeq, total));
        endSeq   = Math.max(startSeq, Math.min(endSeq, total));

        // Fetch ONLY the specific header fields we need — no body download
        const fields = 'FROM TO SUBJECT DATE RECEIVED RETURN-PATH AUTHENTICATION-RESULTS RECEIVED-SPF X-ORIGINATING-IP X-SENDER-IP X-MAILGUN-SENDING-IP FEEDBACK-ID LIST-ID CONTENT-TYPE MESSAGE-ID SENDER LIST-UNSUBSCRIBE MIME-VERSION';
        const fetch = imap.seq.fetch(`${startSeq}:${endSeq}`, {
          bodies: [`HEADER.FIELDS (${fields})`],
          struct: false,
        });

        let processedCount = 0;
        const totalToProcess = endSeq - startSeq + 1;

        const finish = () => {
          if (sortOrder === 'ASC')
            results.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          else
            results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          resolve(results);
        };

        fetch.on('message', (msg) => {
          let headers: any = null;
          let uid = '';
          let date: Date = new Date();

          msg.on('body', (stream) => {
            let buf = '';
            stream.on('data', (chunk) => { buf += chunk.toString('utf8'); });
            stream.once('end', () => {
              try { headers = Imap.parseHeader(buf); } catch { /* skip */ }
            });
          });

          msg.once('attributes', (attrs) => {
            uid  = attrs.uid.toString();
            date = attrs.date ?? new Date();
          });

          msg.once('end', () => {
            try {
              if (headers) {
                const fromHeader  = getHeaderValue(headers, 'from');
                const toHeader    = Array.isArray(headers.to) ? headers.to.join(', ') : (headers.to || '');
                const subject     = getHeaderValue(headers, 'subject') || '(No Subject)';
                const returnPath  = extractReturnPath(getHeaderValue(headers, 'return-path'));
                const { email: fromEmailAddr, domain: fromDomainAddr, name: fromNameStr } = extractFromInfo(fromHeader);
                const toEmails    = extractToInfo(toHeader);
                const ip          = extractIPFromHeaders(headers);
                const auth        = extractAuthenticationResults(headers);

                let include = true;
                if (search) {
                  const s = search.toLowerCase();
                  include = subject.toLowerCase().includes(s)
                    || fromHeader.toLowerCase().includes(s)
                    || fromEmailAddr.toLowerCase().includes(s)
                    || returnPath.toLowerCase().includes(s);
                }
                if (include && fromDomain && fromDomainAddr.toLowerCase() !== fromDomain.toLowerCase()) include = false;
                if (include && fromEmail  && fromEmailAddr.toLowerCase()  !== fromEmail.toLowerCase())  include = false;
                if (include && to && !toEmails.some(e => e.includes(to.toLowerCase()))) include = false;

                if (include) {
                  results.push({
                    uid, subject, from: fromHeader,
                    fromEmail: fromEmailAddr, fromDomain: fromDomainAddr, fromName: fromNameStr,
                    to: toHeader, date, preview: '', mailbox, ip,
                    spfStatus: auth.spf, dkimStatus: auth.dkim, dmarcStatus: auth.dmarc,
                    feedbackId:    getHeaderValue(headers, 'feedback-id'),
                    listId:        getHeaderValue(headers, 'list-id'),
                    contentType:   getHeaderValue(headers, 'content-type'),
                    messageId:     getHeaderValue(headers, 'message-id'),
                    received:      getHeaderValue(headers, 'received'),
                    sender:        getHeaderValue(headers, 'sender'),
                    listUnsubscribe: getHeaderValue(headers, 'list-unsubscribe'),
                    mimeVersion:   getHeaderValue(headers, 'mime-version'),
                    returnPath,
                  });
                }
              }
            } catch { /* skip bad email */ }

            processedCount++;
            if (processedCount === totalToProcess) { imap.end(); finish(); }
          });
        });

        fetch.once('error', (err) => reject(new Error(`IMAP fetch error: ${err.message}`)));
        fetch.once('end', () => {
          if (processedCount < totalToProcess)
            setTimeout(() => { imap.end(); finish(); }, 3000);
        });
      });
    });

    imap.once('error', (err: Error) => reject(new Error(`IMAP connection error: ${err.message}`)));
    imap.connect();
  });
}
