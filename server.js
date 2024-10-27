const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs').promises;
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors');
const path = require('path');

const app = express();
let port = 3001;

// Middleware setup
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

// Enhanced error detection patterns
const errorPatterns = {
  spellingErrors: {
    common: /(?:\b\w{2,}\b)(?=.*\1)/gi,  // Repeated words
    obvious: /[a-z]+[A-Z][a-z]+/g,  // Incorrect capitalization
  },
  formatErrors: {
    dates: /\b\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{3}|\d{5})\b/g,  // Invalid date formats
    inconsistentSpacing: /\s{2,}|\t/g,  // Inconsistent spacing
  },
  criticalErrors: {
    missingNotary: /notary.*(?:missing|absent|illegible)/i,
    missingSignature: /signature.*(?:missing|absent|illegible)/i,
    missingSeals: /seal.*(?:missing|absent|illegible)/i,
    dataErrors: /(?:error|discrepanc|incorrect).*(?:data|information|detail)/i,
  }
};

async function readWordDocument(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error("Error reading the document: " + error.message);
  }
}

function detectSpellingErrors(text) {
  // Dictionary of common legal terms to exclude from spell check
  const legalTerms = new Set([
    'hereby', 'whereas', 'aforementioned', 'therein', 'pursuant',
    'hereinafter', 'notary', 'jurisdiction', 'affidavit'
  ]);

  // Split text into words
  const words = text.split(/\s+/);
  const potentialErrors = [];

  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    if (cleanWord.length < 3) continue;
    if (legalTerms.has(cleanWord.toLowerCase())) continue;

    // Check for obvious misspellings (missing vowels, repeated consonants, etc.)
    if (/[aeiou]{3,}|[bcdfghjklmnpqrstvwxyz]{4,}/.test(cleanWord) ||
        /([a-zA-Z])\1{2,}/.test(cleanWord)) {
      potentialErrors.push(word);
    }
  }

  return potentialErrors;
}

function validateNotaryElements(text) {
  const notaryChecks = {
    hasNotarySignature: /notary\s+(?:public\s+)?signature:?\s*\w+/i.test(text) &&
                       !/(missing|absent|illegible)\s+(?:notary\s+)?signature/i.test(text),
    hasNotarySeal: /notary\s+(?:public\s+)?seal:?\s*(?:present|affixed)/i.test(text) &&
                   !/(missing|absent|illegible)\s+(?:notary\s+)?seal/i.test(text),
    hasProperDate: /(?:date|dated):\s*\d{2}\/\d{2}\/\d{4}/i.test(text),
    hasWitnesses: /witness(?:ed)?\s+by:?\s*[A-Z][a-zA-Z\s]+/i.test(text)
  };

  return {
    isValid: Object.values(notaryChecks).every(Boolean),
    checks: notaryChecks
  };
}

async function checkForLegalDocumentCharacteristics(text) {
  const spellingErrors = detectSpellingErrors(text);
  const notaryValidation = validateNotaryElements(text);
  
  // Check for critical errors
  const criticalErrorsFound = Object.entries(errorPatterns.criticalErrors)
    .reduce((errors, [type, pattern]) => {
      if (pattern.test(text)) {
        errors.push(type);
      }
      return errors;
    }, []);

  // Enhanced format checking
  const formatErrors = Object.entries(errorPatterns.formatErrors)
    .reduce((errors, [type, pattern]) => {
      if (pattern.test(text)) {
        errors.push(type);
      }
      return errors;
    }, []);

  return {
    isLegalDocument: notaryValidation.checks.hasNotarySignature && 
                     notaryValidation.checks.hasNotarySeal,
    isNotarized: notaryValidation.isValid,
    spellingErrors: spellingErrors.length > 0 ? spellingErrors : null,
    formatErrors: formatErrors.length > 0 ? formatErrors : null,
    criticalErrors: criticalErrorsFound.length > 0 ? criticalErrorsFound : null,
    notaryValidation
  };
}

async function verifyDocument(documentContent) {
  try {
    const documentAnalysis = await checkForLegalDocumentCharacteristics(documentContent);
    
    // Enhanced verification logic
    const hasErrors = documentAnalysis.spellingErrors || 
                     documentAnalysis.formatErrors || 
                     documentAnalysis.criticalErrors;

    if (hasErrors) {
      return {
        verified: false,
        message: "Document rejected: Quality issues detected",
        details: {
          spellingErrors: documentAnalysis.spellingErrors,
          formatErrors: documentAnalysis.formatErrors,
          criticalErrors: documentAnalysis.criticalErrors,
          notaryStatus: documentAnalysis.notaryValidation
        }
      };
    }

    if (!documentAnalysis.isLegalDocument || !documentAnalysis.isNotarized) {
      return {
        verified: false,
        message: "Document rejected: Missing critical legal or notary elements",
        details: {
          notaryStatus: documentAnalysis.notaryValidation,
          legalDocumentStatus: documentAnalysis.isLegalDocument
        }
      };
    }

    // AI Analysis for additional verification
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
      details: {
        aiAnalysis,
        documentAnalysis
      }
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

// Server startup code remains the same...
// Health check endpoint
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

  // Add error handling for uncaught exceptions
  server.on('error', (error) => {
    console.error('Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.log(`Port ${port} is busy, trying ${port + 1}...`);
      startServer(port + 1);
    }
  });

  // Graceful shutdown handler
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  return server;
}

// Kill any existing process on port 3001 (Windows only)
const { exec } = require('child_process');

async function killExistingProcess() {
  return new Promise((resolve, reject) => {
    exec(`netstat -ano | findstr :${port}`, (error, stdout, stderr) => {
      if (stdout) {
        const pidMatch = stdout.match(/\s+(\d+)\s*$/m);
        if (pidMatch && pidMatch[1]) {
          const pid = pidMatch[1];
          exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
            if (error) {
              console.log("No process was killed or error occurred. Starting server...");
              resolve();
            } else {
              console.log(`Killed process ${pid}`);
              // Add a small delay to ensure the port is released
              setTimeout(resolve, 1000);
            }
          });
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  });
}

// Initialize server with error handling
async function initializeServer() {
  try {
    await killExistingProcess();
    
    // Add a small delay before starting the server
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const server = startServer(port);
    
    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      console.error('Uncaught Exception:', error);
      server.close(() => {
        process.exit(1);
      });
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      server.close(() => {
        process.exit(1);
      });
    });

  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

// Start the server
initializeServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});