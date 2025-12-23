# AI-Guided Risk Assessment Assistant

A full-stack web application that leverages Google Gemini AI to perform automated STRIDE-based security risk assessments on product requirement documents and system design specifications.

## Features

- **Document Upload**: Upload DOCX format documents (PRDs, system design documents, etc.)
- **STRIDE Security Analysis**: Automatic threat modeling using the STRIDE methodology (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege)
- **AI-Powered Threat Identification**: Uses Google Gemini AI to identify potential security threats and vulnerabilities
- **Interactive Risk Assessment Table**: View detailed risk analysis with feature names, threat types, descriptions, risks, recommendations, and risk levels
- **Comprehensive Reports**: Generate professional security assessment reports in Markdown format
- **Report Download**: Export assessments and reports for documentation and compliance
- **Persistent Storage**: All assessments are stored in a PostgreSQL database for later reference

## Technology Stack

**Frontend**:
- React 18 with TypeScript
- Vite for fast development and building
- TailwindCSS for styling
- Shadcn UI components
- React Query for server state management
- Framer Motion for animations
- React Markdown for report rendering
- Wouter for routing

**Backend**:
- Express.js
- Node.js with TypeScript
- Drizzle ORM for database operations
- PostgreSQL (Neon) for persistent storage
- Multer for file uploads
- Mammoth for DOCX parsing
- Google Gemini AI via Replit AI Integrations

**Infrastructure**:
- Replit for development and deployment
- Replit AI Integrations for Gemini API access (no API key management required)

## Getting Started

### Prerequisites

- Node.js 18+
- A Replit account (for deployment and AI integration)
- A PostgreSQL database (automatically provisioned on Replit)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai-risk-assessment-assistant
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up the database**
   ```bash
   npm run db:push
   ```
   This creates the necessary tables in your PostgreSQL database.

4. **Configure environment variables**
   - The Replit AI Integrations will automatically set `AI_INTEGRATIONS_GEMINI_API_KEY` and `AI_INTEGRATIONS_GEMINI_BASE_URL`
   - Database connection is automatically configured via `DATABASE_URL` on Replit

### Running Locally

```bash
npm run dev
```

The application will start on `http://localhost:5000` with:
- Frontend served via Vite
- Express backend API

## Usage

### 1. Upload a Document

1. Navigate to the home page
2. Click the upload zone and select a DOCX file (PRD or system design document)
3. The document text will be extracted and stored

### 2. Perform Security Assessment

1. Once uploaded, click "Perform Security Assessment"
2. The app sends the document to Google Gemini AI for STRIDE analysis
3. Results appear in an interactive table showing:
   - **Feature Name**: System component or feature
   - **Threat Type**: STRIDE category (Spoofing, Tampering, etc.)
   - **Description**: Detailed threat description
   - **Risk**: Potential impact
   - **Recommendation**: Mitigation strategy
   - **Risk Level**: High, Medium, or Low severity

### 3. Generate a Report

1. After analysis completes, click "Generate Full Report"
2. The app generates a comprehensive Markdown report including:
   - Executive Summary
   - Introduction and Scope
   - Methodology explanation
   - Detailed risk breakdown
   - Conclusions and recommendations
3. View the report in the modal or download it

## API Routes

### Upload Document
- **POST** `/api/assessments/upload`
- **Body**: FormData with `file` field (DOCX)
- **Returns**: Assessment object with ID

### Get Assessment
- **GET** `/api/assessments/:id`
- **Returns**: Full assessment object

### List All Assessments
- **GET** `/api/assessments`
- **Returns**: Array of all assessments

### Perform Risk Analysis
- **POST** `/api/assessments/:id/analyze`
- **Returns**: Array of risk assessment items (STRIDE analysis)

### Generate Report
- **POST** `/api/assessments/:id/report`
- **Returns**: Markdown security report

## Database Schema

### Assessments Table
```sql
CREATE TABLE assessments (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  original_text TEXT NOT NULL,
  risk_analysis JSONB,
  report_content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Project Structure

```
.
├── client/                 # Frontend React application
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── hooks/          # Custom React hooks
│       ├── lib/            # Utilities and query client
│       └── index.css       # Global styles
├── server/                 # Backend Express server
│   ├── routes.ts          # API route handlers
│   ├── storage.ts         # Database storage layer
│   ├── db.ts              # Database connection
│   └── replit_integrations/ # Gemini AI integration modules
├── shared/                # Shared types and schemas
│   ├── schema.ts          # Drizzle ORM schema and Zod validation
│   └── routes.ts          # API route definitions
└── package.json           # Dependencies
```

## Development Guidelines

### Adding New Features

1. **Update Data Schema**: Modify `shared/schema.ts` with new tables/fields
2. **Update Storage**: Add methods to `server/storage.ts`
3. **Add Routes**: Implement API endpoints in `server/routes.ts`
4. **Create Frontend Components**: Add React components in `client/src/components/` or pages in `client/src/pages/`
5. **Use React Query**: Fetch data with `@tanstack/react-query` on the frontend

### Code Style

- TypeScript for type safety
- Shadcn UI components for consistency
- TailwindCSS for styling
- Professional blue theme (primary color: #4979EF)

## Deployment

The application is configured to deploy on Replit:

1. Push your code to the repository
2. Click "Publish" in Replit
3. The app will be available at a public URL

## Known Limitations

- DOCX file support only (no PDF or plain text currently)
- Gemini API calls have rate limits and may take time for large documents
- Reports are generated as Markdown (PDF export would require additional libraries)

## Future Enhancements

- [ ] Support for multiple file formats (PDF, TXT, Markdown)
- [ ] Batch analysis for multiple documents
- [ ] Custom STRIDE parameter configuration
- [ ] Report comparison across assessments
- [ ] PDF export for reports
- [ ] User authentication and multi-user support
- [ ] Risk remediation tracking

## License

This project is built with Replit and uses Google Gemini AI.

## Support

For issues or questions, please refer to the Replit documentation or Google Gemini API documentation.

---

**Built with ❤️ using Replit, Express, React, and Google Gemini AI**
