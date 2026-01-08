# Sia - AI Chat Interface

A modern, minimal AI chat interface inspired by Linear and modern LLM interfaces.

## Running Locally

### Option 1: Using Python (Recommended)

```bash
python3 server.py
```

This will start a local server at `http://localhost:8000` and automatically open it in your browser.

### Option 2: Using Python HTTP Server

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/index.html` in your browser.

### Option 3: Using Node.js (if you have it installed)

```bash
npx http-server -p 8000
```

Then open `http://localhost:8000/index.html` in your browser.

### Option 4: Direct File Opening

You can also open `index.html` directly in your browser, though some features may work better with a local server.

## Features

- **Contracted Mode**: Starts in a compact, minimal state
- **Expands on Focus**: Smoothly expands when you focus the input
- **Modern Design**: Clean, subtle styling inspired by Linear
- **AI-First Interface**: Optimized for AI chat interactions

## Files

- `index.html` - Main HTML file
- `styles.css` - Styling
- `script.js` - JavaScript functionality
- `server.py` - Local development server
