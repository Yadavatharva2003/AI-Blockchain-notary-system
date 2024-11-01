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

// Enhanced error detection patterns with more flexibility
const errorPatterns = {
  spellingErrors: {
    common: /(?:\b\w{2,}\b)(?=.*\1)/gi,  // Repeated words
    obvious: /[a-z]+[A-Z][a-z]+/g,  // Incorrect capitalization
  },
  formatErrors: {
    dates: /\b\d{1,2}\/\d{1,2}\/(?:\d{2}|\d{3}|\d{5})\b/g,  // Invalid date formats
    inconsistentSpacing: /\s{3,}|\t{2,}/g,  // More tolerant spacing check
  },
  criticalErrors: {
    missingNotary: /notary.*(?:completely missing|entirely absent)/i,
    missingSignature: /signature.*(?:completely missing|entirely absent)/i,
    missingSeals: /seal.*(?:completely missing|entirely absent)/i,
    dataErrors: /critical.*(?:error|discrepancy).*(?:data|information)/i,
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
  // Expande legal terms dictionary
  const legalTerms = new Set([
    'hereby', 'whereas', 'aforementioned', 'therein', 'pursuant',
    'hereinafter', 'notary', 'jurisdiction', 'affidavit',
    'testator', 'executor', 'grantor', 'grantee', 'covenant',
    'deed', 'mortgage', 'lien', 'easement', 'tenant'
    // Add more legal terms as needed
  ]);

  const words = text.split(/\s+/);
  const potentialErrors = [];

  for (const word of words) {
    const cleanWord = word.replace(/[^a-zA-Z]/g, '');
    if (cleanWord.length < 5) continue;
    if (legalTerms.has(cleanWord.toLowerCase())) continue;

    // Make pattern matching less strict
    if (/[aeiou]{4,}|[bcdfghjklmnpqrstvwxyz]{5,}/.test(cleanWord) ||
        /([a-zA-Z])\1{3,}/.test(cleanWord)) {
      potentialErrors.push(word);
    }
  }

  return potentialErrors;
}

function detectFormatErrors(text) {
  const errors = [];

  // Check for invalid date formats
  const dates = text.match(errorPatterns.formatErrors.dates);
  if (dates) {
    errors.push(...dates);
  }

  // Check for inconsistent spacing
  const spacingErrors = text.match(errorPatterns.formatErrors.inconsistentSpacing);
  if (spacingErrors) {
    errors.push(...spacingErrors);
  }

  return errors;
}

function detectCriticalErrors(text) {
  const errors = [];

  // Check for missing notary
  if (errorPatterns.criticalErrors.missingNotary.test(text)) {
    errors.push("Missing notary");
  }

  // Check for missing signature
  if (errorPatterns.criticalErrors.missingSignature.test(text)) {
    errors.push("Missing signature");
  }

  // Check for missing seals
  if (errorPatterns.criticalErrors.missingSeals.test(text)) {
    errors.push("Missing seals");
  }

  // Check for data errors
  if (errorPatterns.criticalErrors.dataErrors.test(text)) {
    errors.push("Data errors");
  }

  return errors;
}

function validateNotaryElements(text) {
  const notaryChecks = {
    hasNotarySignature: /notary|signature/i.test(text),
    hasNotarySeal: /seal|stamp/i.test(text),
    hasProperDate: /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/i.test(text),
    hasWitnesses: /witness|attestation/i.test(text)
  };

  return {
    isValid: Object.values(notaryChecks).some(Boolean), // Change from every to some
    checks: notaryChecks
  };
}

async function checkForLegalDocumentCharacteristics(text) {
  const spellingErrors = detectSpellingErrors(text);
  const formatErrors = detectFormatErrors(text);
  const criticalErrors = detectCriticalErrors(text);
  const notaryValidation = validateNotaryElements(text);

  return {
    spellingErrors,
    formatErrors,
    criticalErrors,
    notaryValidation
  };
}

async function verifyDocument(documentContent) {
  try {
    const documentAnalysis = await checkForLegalDocumentCharacteristics(documentContent);
    
    // Only reject for critical errors
    const hasCriticalErrors = documentAnalysis.criticalErrors && 
                             documentAnalysis.criticalErrors.length > 0;

    if (hasCriticalErrors) {
      return {
        verified: false,
        message: "Document rejected: Critical issues detected",
        details: {
          criticalErrors: documentAnalysis.criticalErrors,
          notaryStatus: documentAnalysis.notaryValidation
        }
      };
    }

    // Treat spelling and format errors as warnings
    const warnings = [];
    if (documentAnalysis.spellingErrors) warnings.push("Potential spelling issues found");
    if (documentAnalysis.formatErrors) warnings.push("Minor format issues detected");

    return {
      verified: true,
      message: warnings.length > 0 ? 
               "Document verified with warnings" : 
               "Document verified successfully",
      details: {
        warnings: warnings.length > 0 ? warnings : null,
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
    console.log('Processing file:', file.name); // Add logging

    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = path.join(__dirname, 'uploads', fileName);

    await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
    await file.mv(filePath);

    const documentContent = await readWordDocument(filePath);
    console.log('Document content length:', documentContent.length); // Add logging
    console.log('Document content preview:', documentContent.substring(0, 200)); // Add logging

    const verificationResult = await verifyDocument(documentContent);
    console.log('Verification result:', JSON.stringify(verificationResult, null, 2)); // Add logging

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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});