📝 OpenSign – PDF E-Signature Platform

OpenSign is a powerful full-stack web application that allows users to upload PDF documents, drag-and-drop interactive fields (Signature, Text, Date), and digitally sign documents directly in the browser. It serves as a lightweight, open-source alternative to platforms like DocuSign.

✨ Features
📄 PDF Upload & Rendering

High-fidelity PDF rendering using react-pdf-viewer.

🖱️ Drag-and-Drop Editor

Place Signature, Text, and Date fields anywhere.

Move fields using a dedicated drag handle.

Resize fields to fit specific document areas.

Delete unwanted fields.

✍️ Digital Signature Pad

Smooth drawing with pressure sensitivity.

Auto-trims whitespace for perfect centering.

⌨️ Interactive Input

Type directly into text fields or pick dates before saving.

🔥 PDF Generation ("The Burn")

Backend converts browser pixels → PDF points.

Embeds images (signatures) & text (Helvetica font) permanently into the final PDF.

🛠️ Tech Stack
Frontend

React (Vite)

@react-pdf-viewer/core

react-rnd

react-signature-canvas

Axios

Backend

Node.js & Express

pdf-lib

Multer (file uploads)

MongoDB (optional)

🚀 Getting Started
Prerequisites

Node.js (v14+)

MongoDB (optional)

1. Backend Setup
# Navigate to backend directory
cd backend

# Install dependencies
npm install express mongoose multer pdf-lib cors dotenv

# Start the server
node index.js


Server runs at: http://localhost:4000

2. Frontend Setup
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev


🔌 API Endpoints
POST /api/upload-pdf

Uploads a raw PDF to the server.

Payload: FormData (file)

Response:

{ "id": "doc_id", "originalHash": "..." }

POST /api/sign-pdf

Processes the document and burns fields onto it.

Payload:

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
      "value": "John Doe"
    }
  ]
}


Response:

{ "signedPdfUrl": "http://localhost:4000/files/..." }

🛡️ Usage Guide
1. Upload

Select a PDF using the sidebar file input.

2. Add Fields

Choose Signature / Text / Date → click on the PDF to place it.

3. Edit Fields

Move: Drag via the blue handle

Resize: Pull corners

Type: Click inside Text/Date fields

Sign: Open the signature pad to draw

4. Save

Click Download Signed PDF.
The backend burns all fields into the PDF and opens the final document.

🤝 Contributing

Contributions are welcome!
Fork the repo → make changes → submit a pull request.

