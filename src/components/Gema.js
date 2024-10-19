const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require('fs');
const mammoth = require('mammoth'); // Use mammoth for reading docx files

const apiKey = "AIzaSyBFBy0V5eetX-2mRYAwFh0FYCItaTP6wvc";  // <-- Insert your API key here
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
});

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 64,
  maxOutputTokens: 8192,  // Increased token size for a larger output
  responseMimeType: "text/plain",
};

// Predefined text to be sent with the document
const predefinedPrompt = `
Verify the notarized document in the attached Word document. Look for the following types of errors and provide a detailed response with steps to overcome each error:

Legal Document Type: Ensure that the document is the correct type for the action being performed (e.g., deed for property transfer). Flag if the document type is inappropriate.

Consideration Mentioned: Verify if the document specifies consideration (if required) or states it as a gift, as applicable for the transaction type.

Complete Legal Property Description: Check if the property description is legally sufficient (using metes and bounds or another precise format). Flag incomplete or vague descriptions.

Correct Use of Terminology: Ensure legal terms (e.g., Grantor, Declarant, etc.) are used consistently and correctly throughout the document.

Witness Requirements: Verify if witnesses are legally required for the document type and jurisdiction. Flag unnecessary or missing witness sections.

Notary Section Completeness: Ensure that the notary section includes all necessary details, such as the notary commission number, expiration date, and seal. Flag any missing elements.

Effective Date of Transfer: Verify that the transfer date is clearly specified and aligns with local recording requirements. Flag vague or legally unsound statements about the transfer’s effectiveness.

Jurat or Acknowledgment Statement: Ensure that the notary’s section includes either a jurat or acknowledgment, as appropriate for the document type. Flag if missing or incorrect.

Provide a list of identified errors and specific steps to correct each issue.
`;

// Function to read Word document using mammoth and extract text
async function readWordDocument(filePath) {
  try {
    const result = await mammoth.extractRawText({ path: filePath });
    return result.value; // The extracted text
  } catch (error) {
    console.error("Error reading the Word document:", error);
  }
}

// Main function to run the AI model and verify the notarized document
async function run(documentPath) {
  try {
    // Read the document content
    const documentContent = await readWordDocument(documentPath);

    // Combine predefined prompt and document content
    const inputPrompt = predefinedPrompt + "\n\nDocument Content:\n" + documentContent;

    // Create a chat session with the AI model
    const chatSession = model.startChat({
      generationConfig,
      history: [],
    });

    // Send the input prompt to the model
    const result = await chatSession.sendMessage(inputPrompt);

    // Output the AI's response
    console.log(result.response.text());
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

// Provide the file path of the Word document to be verified
const documentPath = "C:/Users/thawa/Documents/Sample Notary/NOTARIZED DECLARATION SAMPLE.docx";

// Run the verification process
run(documentPath);
