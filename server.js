const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs').promises;
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const path = require('path');

const app = express();
let port = 3001;  // Initial port

// All middleware setup
app.use(cors());
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 },
}));
app.use(express.json());
app.use(express.static('public'));

const apiKey = "AIzaSyCGuyyrxMbaTHrHntV537ZrZt6U_X0X4zI";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 0.7,
  topP: 0.8,
  topK: 40,
  maxOutputTokens: 8192,
};

async function readWordDocument(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error("Error reading the document: " + error.message);
  }
}

async function checkForLegalDocumentCharacteristics(text) {
  const legalKeywords = [
    "agreement", "contract", "parties", "hereby", "whereas",
    "terms and conditions", "shall", "liability", "jurisdiction",
    "governing law", "witness", "notary", "covenant", "warranty",
    "indemnification", "execution date", "signature", "sworn",
    "affidavit", "deed", "power of attorney"
  ];

  const keywordCount = legalKeywords.reduce((count, keyword) => {
    return count + (text.toLowerCase().includes(keyword.toLowerCase()) ? 1 : 0);
  }, 0);

  const hasSignatureBlock = /signature|authorized.*signature|sign.*above/i.test(text);
  const hasDateBlock = /date[d]?:|dated this|execution date/i.test(text);
  const hasNotaryBlock = /notary|sworn|subscribed and sworn|acknowledged before me/i.test(text);
  const hasPartyDefinitions = /party of the first part|party of the second part|hereinafter|undersigned/i.test(text);

  return {
    isLegalDocument: keywordCount >= 3 && (hasSignatureBlock || hasDateBlock || hasPartyDefinitions),
    isNotarized: hasNotaryBlock,
    keywordCount,
    hasSignatureBlock,
    hasDateBlock,
    hasNotaryBlock,
    hasPartyDefinitions
  };
}

async function verifyDocument(documentContent) {
  try {
    const documentAnalysis = await checkForLegalDocumentCharacteristics(documentContent);
    
    if (!documentAnalysis.isLegalDocument) {
      return {
        verified: false,
        message: "Document rejected: Not a legal document. This appears to be general text or technical documentation.",
        details: "The document lacks essential legal document characteristics such as signature blocks, party definitions, or sufficient legal terminology."
      };
    }

    if (!documentAnalysis.isNotarized) {
      return {
        verified: false,
        message: "Document rejected: Not notarized.",
        details: "The document lacks notary acknowledgment or certification. Please ensure the document is properly notarized."
      };
    }

    const predefinedPrompt = `
    Please verify this legal document for compliance and notary standards. 
    Focus on:
    1. Presence and completeness of notary acknowledgment
    2. Legal formatting and structure
    3. Required signature blocks
    4. Date and witness information
    5. Any missing crucial legal elements
    
    Document Content:
    ${documentContent}
    
    Provide a detailed analysis of compliance and validity.
    `;

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(predefinedPrompt);
    const aiAnalysis = result.response.text();

    return {
      verified: true,
      message: "Document verified successfully.",
      details: aiAnalysis,
      analysis: documentAnalysis
    };
  } catch (error) {
    throw new Error("Error during document verification: " + error.message);
  }
}

app.post('/api/verify', async (req, res) => {
  try {
    if (!req.files || !req.files.file) {
      return res.status(400).json({ 
        success: false, 
        error: "No file uploaded"
      });
    }

    const file = req.files.file;
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = path.join(__dirname, 'uploads', fileName);

    await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });

    await file.mv(filePath);

    const documentContent = await readWordDocument(filePath);
    const verificationResult = await verifyDocument(documentContent);

    await fs.unlink(filePath);

    const response = {
      success: verificationResult.verified,
      fileName: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadTime: new Date().toLocaleTimeString(),
      status: verificationResult.verified ? "Verified" : "Rejected",
      details: verificationResult.details,
      message: verificationResult.message
    };

    res.json(response);

  } catch (error) {
    console.error('Error processing document:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Function to try different ports
function startServer(initialPort) {
  const server = app.listen(initialPort)
    .on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`Port ${initialPort} is busy, trying ${initialPort + 1}...`);
        startServer(initialPort + 1);
      } else {
        console.error('Server error:', err);
      }
    })
    .on('listening', () => {
      port = server.address().port;
      console.log(`Server is running on http://localhost:${port}`);
    });
}

// Kill any existing process on port 3001 (Windows only)
const { exec } = require('child_process');
exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
  if (stdout) {
    const pid = stdout.split(/\s+/)[4];
    exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
      if (error) {
        console.log("No process was killed. Starting server...");
      } else {
        console.log(`Killed process ${pid}`);
      }
      startServer(port);
    });
  } else {
    startServer(port);
  }
});
