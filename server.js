const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs').promises;
const mammoth = require('mammoth');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const cors = require('cors'); // Add cors for React frontend
const path = require('path');

const app = express();
const port = 3001;  // Changed to 3001 to avoid conflict with React's dev server

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(fileUpload({
  createParentPath: true,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
}));
app.use(express.json());
app.use(express.static('public'));

const apiKey = "AIzaSyBFBy0V5eetX-2mRYAwFh0FYCItaTP6wvc";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain",
};

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error);

async function readWordDocument(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value;
  } catch (error) {
    throw new Error("Error reading the document: " + error.message);
  }
}

async function verifyDocument(documentContent) {
  try {
    const predefinedPrompt = `
    Please verify this document for legal compliance and notary standards. 
    
    Document Content:
    ${documentContent}
    
    Provide a detailed analysis of each requirement and overall validity.
    `;

    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    const result = await chatSession.sendMessage(predefinedPrompt);
    return result.response.text();
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
    const filePath = path.join(uploadsDir, fileName);

    // Save file
    await file.mv(filePath);

    // Read and verify document
    const documentContent = await readWordDocument(filePath);
    const verificationDetails = await verifyDocument(documentContent);

    // Clean up uploaded file
    await fs.unlink(filePath);

    // Structure the response
    const response = {
      success: true,
      fileName: file.name,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadTime: new Date().toLocaleTimeString(),
      status: verificationDetails.toLowerCase().includes("valid") ? "Verified" : "Rejected",
      details: verificationDetails
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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});