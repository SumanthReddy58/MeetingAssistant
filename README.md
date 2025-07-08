# Meeting Assistant

A modern meeting assistant application with voice recognition, real-time transcription, and intelligent action item extraction. Features Google Calendar integration for automatic event creation.

## Features

- **Voice Recognition**: Real-time speech-to-text transcription
- **Action Item Extraction**: Automatically identifies and extracts action items from conversations
- **Google Calendar Integration**: Creates calendar events for scheduled action items
- **Session Management**: Save and manage multiple meeting sessions
- **Export Functionality**: Export transcripts and action items
- **Dark/Light Theme**: Toggle between themes
- **Responsive Design**: Works on desktop and mobile devices

## Setup

### Prerequisites

- Node.js 18+ 
- A Google Cloud Platform account for Calendar integration

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Google Calendar integration:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Calendar API
   - Create OAuth 2.0 credentials
   - Add your domain to authorized origins
   - Copy the `.env.example` file to `.env` and add your credentials

4. Start the development server:
   ```bash
   npm run dev
   ```

### Google Calendar Setup

1. **Create a Google Cloud Project**:
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing

2. **Enable Calendar API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

3. **Create OAuth Credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add your domain to "Authorized JavaScript origins"
   - Add your domain to "Authorized redirect URIs"

4. **Configure Environment**:
   - Copy your Client ID
   - Create a `.env` file from `.env.example`
   - Set `VITE_GOOGLE_CLIENT_ID` to your Client ID

### Deployment

The app is configured for deployment on Netlify:

```bash
npm run build
```

Make sure to set your environment variables in your deployment platform.

## Usage

1. **Start a Session**: Click "New Session" to begin
2. **Record Audio**: Click the microphone button to start voice recognition
3. **View Transcript**: See real-time transcription in the main panel
4. **Manage Action Items**: Review and edit extracted action items
5. **Connect Calendar**: Link your Google Calendar for automatic event creation
6. **Export Data**: Download transcripts and action items as files

## Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Voice Recognition**: Web Speech API
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Deployment**: Netlify

## Browser Support

- Chrome (recommended for voice recognition)
- Edge
- Safari (limited voice recognition support)
- Firefox (limited voice recognition support)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details