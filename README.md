📝 OpenSign - PDF E-Signature Platform
OpenSign is a powerful, full-stack web application that allows users to upload PDF documents, drag-and-drop interactive fields (Signatures, Text, Dates), and digitally sign documents directly in the browser. It serves as a lightweight, open-source alternative to platforms like DocuSign.


✨ Features
📄 PDF Upload & Rendering: High-fidelity PDF rendering using react-pdf-viewer.

🖱️ Drag-and-Drop Editor:

Place Signature, Text, and Date fields anywhere on the page.

Move fields using a dedicated drag handle.

Resize fields to fit specific document areas.

Delete unwanted fields.

✍️ Digital Signature Pad:

Draw signatures smoothly with pressure sensitivity.

Auto-trims whitespace for perfect centering.

⌨️ Interactive Input: Type directly into text fields or pick dates before saving.

🔥 PDF Generation (The "Burn"):

The backend calculates exact coordinates (converting browser pixels to PDF points).

Embeds images (signatures) and text (Helvetica font) permanently into the final PDF.

🛠️ Tech Stack
Frontend
React (Vite)

@react-pdf-viewer/core - For rendering PDF pages.

react-rnd - For draggable and resizable components.

react-signature-canvas - For capturing drawing input.

Axios - For API communication.

Backend
Node.js & Express - REST API.

pdf-lib - The core engine for modifying and saving PDFs.

Multer - For handling file uploads.

MongoDB (Optional/Model dependent) - For storing document metadata.

🚀 Getting Started
Follow these steps to run the project locally.

Prerequisites
Node.js (v14 or higher)

MongoDB (if using database persistence)

1. Backend Setup
# Navigate to backend directory
cd backend

# Install dependencies
npm install express mongoose multer pdf-lib cors dotenv

# Start the server
node index.js
The server will run on http://localhost:4000

2. Frontend Setup
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
The frontend will run on http://localhost:5173

📂 Project Structure
text
├── backend/
│   ├── uploads/            # Stores raw and signed PDFs
│   ├── models/             # Mongoose schemas (Document, AuditLog)
│   ├── routes/             # API endpoints
│   └── index.js            # Server entry point
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── PDFViewer.jsx      # Core logic for PDF + Overlay layer
    │   │   └── SignatureModal.jsx # Canvas for drawing signatures
    │   └── App.jsx                # Main layout and state management
    
🔌 API Endpoints
POST /api/upload-pdf
Uploads a raw PDF file to the server.

Payload: FormData containing the file.

Response: { id: "doc_id", originalHash: "..." }

POST /api/sign-pdf
Processes the document and burns fields onto it.

Payload:

json
{
  "documentId": "12345",
  "fields": [
    {
      "pageIndex": 0,
      "xPdf": 100,
      "yPdf": 200,
      "widthPdf": 150,
      "heightPdf": 50,
      "type": "signature",
      "value": "data:image/png;base64,..."
    },
    {
       "type": "text",
       "value": "John Doe",
       ...
    }
  ]
}
Response: { signedPdfUrl: "http://localhost:4000/files/..." }

🛡️ Usage Guide
Upload: Click the file input in the sidebar to select a PDF.

Add Fields:

Select "Signature", "Text", or "Date" from the dropdown.

Click anywhere on the PDF page to drop the field.

Edit Fields:

Move: Click the field to select it, then drag the Blue Handle on top.

Resize: Drag the corners of the box.

Type: Click inside Text/Date boxes to enter values.

Sign: Click the "Sign" button on a signature box to open the drawing pad.

Save: Click "Download Signed PDF" in the sidebar. The backend will process the file and open the final result in a new tab.

🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

📄 License
This project is licensed under the MIT License.