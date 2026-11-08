/**
 * Local Development API Server
 * Port: 8080
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

let documents = [
  {
    id: 1,
    title: "kyc_verification_audit_report",
    originalFilename: "kyc_verification_audit_report.pdf",
    contentType: "application/pdf",
    fileSize: 18432,
    pageCount: 1,
    chunkCount: 3,
    summary: "ENTERPRISE KYC & IDENTITY AUDIT REPORT for Rahul Verma (ID: KYC-2026-98421). Status: APPROVED (LOW RISK). OCR match score 99.4%, PAN verified via NSDL, Aadhaar verified via UIDAI OTP, Face match score 94.8%.",
    status: "READY",
    uploadTime: new Date().toISOString()
  },
  {
    id: 2,
    title: "enterprise_service_sla_contract",
    originalFilename: "enterprise_service_sla_contract.pdf",
    contentType: "application/pdf",
    fileSize: 24780,
    pageCount: 2,
    chunkCount: 5,
    summary: "MASTER CLOUD SERVICES AGREEMENT & SLA between Acme Global Logistics and CloudCore Technologies. Annual contract fee USD 84,000. Service guarantee warrants 99.95% monthly uptime. Data encrypted via AES-256 and TLS 1.3.",
    status: "READY",
    uploadTime: new Date(Date.now() - 3600000).toISOString()
  }
];

let chunks = {
  1: [
    { id: 101, chunkIndex: 0, pageNumber: 1, content: "ENTERPRISE KYC & IDENTITY AUDIT REPORT. Applicant Name: Rahul Verma | Application ID: KYC-2026-98421. Verification Date: November 08, 2026 | Status: APPROVED (LOW RISK).", characterCount: 172 },
    { id: 102, chunkIndex: 1, pageNumber: 1, content: "Document OCR & Tamper Analysis: Aadhaar and PAN Card analyzed via Automated Optical Character Recognition (OCR). PAN Number ABCDE1234F (99.8% NSDL Verified). Aadhaar UID XXXX-XXXX-4589 (98.5% UIDAI Valid). Face match score 94.8% PASS.", characterCount: 240 },
    { id: 103, chunkIndex: 2, pageNumber: 1, content: "Risk Evaluation & Anti-Money Laundering (AML): PEP Screening Negative. OFAC and Interpol Sanctions clean. Credit bureau score 782 (Excellent). Composite Risk Score 0.08. Approved by Lead Compliance Officer Sarah Jenkins.", characterCount: 235 }
  ],
  2: [
    { id: 201, chunkIndex: 0, pageNumber: 1, content: "MASTER CLOUD SERVICES AGREEMENT & SLA. Effective Date: January 01, 2026 | Contract Reference: MSA-CLOUD-990. Client: Acme Global Logistics Inc. | Provider: CloudCore Technologies LLC.", characterCount: 185 },
    { id: 202, chunkIndex: 1, pageNumber: 1, content: "Section 1: Scope of Service & Pricing: Provider shall deliver high-availability AI document indexing services. Annual contract fee is USD 84,000, invoiced quarterly in installments of USD 21,000 (Net 30 days).", characterCount: 215 },
    { id: 203, chunkIndex: 2, pageNumber: 2, content: "Section 2: Service Level Guarantee (Uptime SLA): Provider warrants 99.95% monthly uptime. If uptime drops below 99.9%, Client is entitled to a 10% credit. If uptime drops below 99.0%, Client receives a 25% penalty credit.", characterCount: 228 },
    { id: 204, chunkIndex: 3, pageNumber: 2, content: "Section 3: Data Protection: All stored documents and vector chunks shall be encrypted at rest using AES-256 and in transit using TLS 1.3.", characterCount: 138 }
  ]
};

let chatHistories = {
  1: [
    {
      id: 1,
      documentId: 1,
      question: "What is Rahul Verma's PAN verification status and face match score?",
      answer: "Based on **kyc_verification_audit_report** (**Page 1**):\n\n• **PAN Number:** ABCDE1234F is **MATCHED** with 99.8% confidence (NSDL Verified).\n• **Face Match Score:** Aadhaar photo vs biometric selfie is **94.8%** (PASS - Verified).\n• **Overall Risk:** Approved with a composite risk score of **0.08** (Low Risk).\n\n*(Extracted via RAG vector-ranking from Page 1)*",
      citations: [
        { chunkIndex: 1, pageNumber: 1, snippet: "PAN Number ABCDE1234F (99.8% NSDL Verified). Aadhaar UID XXXX-XXXX-4589 (98.5% UIDAI Valid). Face match score 94.8% PASS.", score: 18.5 }
      ],
      timestamp: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  2: []
};

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = req.url.split('?')[0];

  // 1. Auth: Login
  if (req.method === 'POST' && url === '/api/auth/login') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body); } catch(e) {}
      const username = data.username || 'demo_user';
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        token: "mock-jwt-token-" + Date.now(),
        type: "Bearer",
        id: 1,
        username: username,
        email: username + "@example.com",
        role: "ROLE_USER"
      }));
    });
    return;
  }

  // 2. Auth: Register
  if (req.method === 'POST' && url === '/api/auth/register') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body); } catch(e) {}
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        token: "mock-jwt-token-" + Date.now(),
        type: "Bearer",
        id: 1,
        username: data.username || 'demo_user',
        email: data.email || 'demo@example.com',
        role: "ROLE_USER"
      }));
    });
    return;
  }

  // 3. Documents: List
  if (req.method === 'GET' && url === '/api/documents') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(documents));
    return;
  }

  // 4. Documents: Upload
  if (req.method === 'POST' && url === '/api/documents/upload') {
    const newDoc = {
      id: documents.length + 1,
      title: "uploaded_compliance_doc_" + (documents.length + 1),
      originalFilename: "uploaded_compliance_doc.pdf",
      contentType: "application/pdf",
      fileSize: 22400,
      pageCount: 2,
      chunkCount: 4,
      summary: "Newly ingested document. Semantic chunks indexed and ready for contextual querying.",
      status: "READY",
      uploadTime: new Date().toISOString()
    };
    documents.unshift(newDoc);
    chunks[newDoc.id] = [
      { id: newDoc.id * 100 + 1, chunkIndex: 0, pageNumber: 1, content: "Section 1: General provisions and document scope.", characterCount: 52 },
      { id: newDoc.id * 100 + 2, chunkIndex: 1, pageNumber: 1, content: "Section 2: Extracted verification criteria and details.", characterCount: 55 }
    ];
    chatHistories[newDoc.id] = [];

    res.writeHead(201, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(newDoc));
    return;
  }

  // 5. Documents: Get Chunks
  const chunksMatch = url.match(/^\/api\/documents\/(\d+)\/chunks$/);
  if (req.method === 'GET' && chunksMatch) {
    const docId = parseInt(chunksMatch[1]);
    const docChunks = chunks[docId] || [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(docChunks));
    return;
  }

  // 6. Documents: Download
  const downloadMatch = url.match(/^\/api\/documents\/(\d+)\/download$/);
  if (req.method === 'GET' && downloadMatch) {
    const docId = parseInt(downloadMatch[1]);
    const samplePath = docId === 1 
      ? path.join(__dirname, '../sample-docs/kyc_verification_audit_report.pdf')
      : path.join(__dirname, '../sample-docs/enterprise_service_sla_contract.pdf');

    if (fs.existsSync(samplePath)) {
      res.writeHead(200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="document.pdf"'
      });
      fs.createReadStream(samplePath).pipe(res);
    } else {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end("%PDF-1.4 Mock PDF Content");
    }
    return;
  }

  // 7. Documents: Delete
  const deleteMatch = url.match(/^\/api\/documents\/(\d+)$/);
  if (req.method === 'DELETE' && deleteMatch) {
    const docId = parseInt(deleteMatch[1]);
    documents = documents.filter(d => d.id !== docId);
    delete chunks[docId];
    delete chatHistories[docId];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: "Document deleted successfully" }));
    return;
  }

  // 8. Chat: History
  const historyMatch = url.match(/^\/api\/chat\/history\/(\d+)$/);
  if (req.method === 'GET' && historyMatch) {
    const docId = parseInt(historyMatch[1]);
    const history = chatHistories[docId] || [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(history));
    return;
  }

  // 9. Chat: Clear History
  if (req.method === 'DELETE' && historyMatch) {
    const docId = parseInt(historyMatch[1]);
    chatHistories[docId] = [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, message: "Chat history cleared" }));
    return;
  }

  // 10. Chat: Ask
  if (req.method === 'POST' && url === '/api/chat/ask') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      let data = {};
      try { data = JSON.parse(body); } catch(e) {}
      const docId = data.documentId || 1;
      const question = data.question || '';
      const doc = documents.find(d => d.id === docId) || documents[0];

      let answer = '';
      let citations = [];
      const lowerQ = question.toLowerCase();

      if (docId === 1) {
        if (lowerQ.includes('pan') || lowerQ.includes('face') || lowerQ.includes('score')) {
          answer = "Based on **kyc_verification_audit_report** (**Page 1**):\n\n• **PAN Number:** ABCDE1234F is **MATCHED** with 99.8% confidence (NSDL Verified).\n• **Face Match Score:** Aadhaar photo vs biometric selfie is **94.8%** (PASS - Verified).\n• **Composite Risk Score:** 0.08 (Low Risk status approved by Sarah Jenkins).\n\n*Source: Page 1*";
          citations = [{ chunkIndex: 1, pageNumber: 1, snippet: "PAN Number ABCDE1234F (99.8% NSDL Verified). Face match score 94.8% PASS - Verified.", score: 18.5 }];
        } else if (lowerQ.includes('aadhaar') || lowerQ.includes('uid')) {
          answer = "According to **kyc_verification_audit_report** (**Page 1**), the Aadhaar UID is **XXXX-XXXX-4589** with 98.5% confidence (UIDAI OTP Valid). No digital tampering was detected via Error Level Analysis (ELA).\n\n*Source: Page 1*";
          citations = [{ chunkIndex: 1, pageNumber: 1, snippet: "Aadhaar UID XXXX-XXXX-4589 (98.5% MATCHED - UIDAI OTP Valid). Extracted name matching score is 99.4%.", score: 16.2 }];
        } else {
          answer = `Based on **${doc.title}** (**Page 1**):\n\n• **Applicant:** Rahul Verma (KYC-2026-98421)\n• **Verification Status:** Approved (Low Risk)\n• **AML Screening:** Clean against OFAC & Interpol watchlists, credit score 782.\n\n*Source: Page 1*`;
          citations = [{ chunkIndex: 0, pageNumber: 1, snippet: doc.summary, score: 12.0 }];
        }
      } else {
        if (lowerQ.includes('uptime') || lowerQ.includes('sla') || lowerQ.includes('penalty')) {
          answer = "Based on **enterprise_service_sla_contract** (**Page 2**):\n\n• **Guaranteed Uptime:** 99.95% monthly uptime.\n• **Penalty Tier 1:** If uptime drops below 99.9%, Client receives a **10% credit**.\n• **Penalty Tier 2:** If uptime drops below 99.0%, Client receives a **25% penalty credit** against the next invoice.\n\n*Source: Page 2*";
          citations = [{ chunkIndex: 2, pageNumber: 2, snippet: "Section 2: Service Level Guarantee (Uptime SLA): Provider warrants 99.95% monthly uptime. If uptime drops below 99.9%, 10% credit; below 99.0%, 25% credit.", score: 19.1 }];
        } else if (lowerQ.includes('price') || lowerQ.includes('cost') || lowerQ.includes('amount') || lowerQ.includes('fee')) {
          answer = "According to **enterprise_service_sla_contract** (**Page 1**):\n\n• **Annual Fee:** Fixed at **USD 84,000**.\n• **Payment Schedule:** Invoiced quarterly in four installments of **USD 21,000**.\n• **Terms:** Net 30 days from invoice generation.\n\n*Source: Page 1*";
          citations = [{ chunkIndex: 1, pageNumber: 1, snippet: "Section 1: Scope of Service & Pricing: The annual contract fee is fixed at USD 84,000, invoiced quarterly in four installments of USD 21,000 (Net 30 days).", score: 17.8 }];
        } else {
          answer = `Based on **${doc.title}**:\n\n• Contract reference: MSA-CLOUD-990 between Acme Global Logistics & CloudCore Technologies.\n• Data encrypted at rest via AES-256 and transit via TLS 1.3.\n• Termination: 60 days written notice or 15 days on material breach.`;
          citations = [{ chunkIndex: 0, pageNumber: 1, snippet: doc.summary, score: 11.5 }];
        }
      }

      const responseObj = {
        id: Date.now(),
        documentId: docId,
        question: question,
        answer: answer,
        citations: citations,
        timestamp: new Date().toISOString()
      };

      if (!chatHistories[docId]) chatHistories[docId] = [];
      chatHistories[docId].push(responseObj);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(responseObj));
    });
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: "Endpoint not found" }));
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`  AI Document Q&A Mock API Server Started on Port ${PORT}`);
  console.log(`  Targeting Angular Dev Server at http://localhost:4200`);
  console.log(`=======================================================`);
});

