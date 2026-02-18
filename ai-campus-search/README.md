# AI Campus Search - Unified Semantic Knowledge Search System

A full-stack AI-powered semantic search and recommendation system for smart campuses built with Node.js, Express, MongoDB, OpenAI API, and vanilla JavaScript.

## Features

- JWT-based authentication system
- File upload support (PDF, DOCX, TXT)
- Semantic search using OpenAI embeddings
- AI-generated summaries of search results
- Personalized recommendations
- Admin dashboard for content management
- Neon-themed modern UI with glassmorphism effects

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas
- **AI Integration**: OpenAI API (embeddings and GPT-4o-mini)
- **Frontend**: HTML, CSS (neon theme), Vanilla JavaScript
- **Authentication**: JWT tokens
- **File Processing**: pdf-parse, mammoth

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- OpenAI API key

### Getting Started

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-campus-search
   ```

2. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```

3. Create a `.env` file in the `backend` directory with your credentials:
   ```env
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_secret_key
   OPENAI_API_KEY=your_openai_api_key
   PORT=5000
   ```

4. Obtain your credentials:
   - **MongoDB Atlas**: Create an account at [mongodb.com](https://www.mongodb.com/) and create a cluster. Get your connection string from the Atlas dashboard.
   - **OpenAI API Key**: Create an account at [platform.openai.com](https://platform.openai.com/) and generate an API key in the dashboard.

5. Start the backend server:
   ```bash
   node server.js
   ```

6. The application will be running on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### File Upload
- `POST /api/upload` - Upload and process documents (requires authentication)

### Search
- `POST /api/search` - Perform semantic search (requires authentication)

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/documents` - Get all documents (admin only)
- `GET /api/admin/stats` - Get system statistics (admin only)
- `DELETE /api/admin/document/:id` - Delete a document (admin only)

## Usage

1. Register an account or login
2. Upload documents to the knowledge base
3. Use the search bar to query the knowledge base using natural language
4. View AI-generated summaries of search results
5. Access personalized recommendations based on your interests

## Bonus Features

- Trending topics section
- Smart auto-generated tags
- Role-based search results
- Dark/light mode toggle
- Responsive design for all devices

## Project Structure

```
ai-campus-search/
├── backend/
│   ├── server.js
│   ├── models/
│   │    ├── User.js
│   │    └── Document.js
│   ├── middleware/
│   │    └── auth.js
│   ├── routes/
│   │    ├── auth.js
│   │    ├── upload.js
│   │    ├── search.js
│   │    └── admin.js
│   ├── utils/
│   │    ├── embedding.js
│   │    └── similarity.js
│   └── .env
└── frontend/
    ├── index.html
    ├── login.html
    ├── register.html
    ├── dashboard.html
    ├── admin.html
    ├── css/
    │     └── style.css
    └── js/
          ├── auth.js
          └── dashboard.js
```

## Demo Script

1. Navigate to `http://localhost:5000`
2. Click "Get Started" and register a new account
3. Upload a sample PDF, DOCX, or TXT file
4. Try searching for concepts related to your uploaded content
5. View the AI-generated summary of search results
6. For admin users, access the admin dashboard to manage content

## Development

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is licensed under the MIT License.