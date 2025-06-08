# Collaborative Whiteboard - Frontend

A real-time collaborative drawing application built with React and Socket.io that allows multiple users to draw, chat, and collaborate on a shared canvas.

## 🎨 Features

### Drawing Tools

- **Brush Tool** - Freehand drawing with customizable colors and sizes
- **Eraser Tool** - Remove drawings with adjustable eraser size
- **Shape Tools** - Draw rectangles, circles, and lines
- **Text Tool** - Add text with customizable font sizes
- **Image Import** - Upload and place images on the canvas

### Collaboration Features

- **Real-time Drawing** - See other users drawings instantly
- **Live Cursors** - View other users' cursor positions and current tools
- **User Management** - See who's online and track user activity
- **Chat System** - Built-in chat for communication
- **Canvas Sync** - New users receive complete canvas history

### User Interface

- **Modern Design** - Clean, intuitive interface with Lucide React icons
- **Responsive Layout** - Works on different screen sizes
- **Tool Sidebar** - Comprehensive tool panel with all drawing options
- **Keyboard Shortcuts** - Quick access to tools and actions
- **Grid Background** - Notebook-style grid for better drawing alignment

### Advanced Features

- **Undo/Redo** - Full history management with keyboard shortcuts
- **Canvas Download** - Export drawings as PNG files, you can right click the canvas and copy image
- **Image Synchronization** - Images are shared across all users
- **Rate Limiting Protection** - Client-side feedback for server rate limits

## 🛠️ Tech Stack

- **React** - Hooks and functional components
- **Socket.io Client** - Real-time bidirectional communication
- **Lucide React** - Icons
- **Tailwind CSS** - css framework
- **Vite** - fast dev build tool for simple projects like this

## 📋 Prerequisites

- **Node.js** (v18.18.0)
- **npm** package manager

## 🚀 Installation & Setup

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd collaborative-whiteboard/client
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Start Development Server

\`\`\`bash
npm run dev
\`\`\`

The application will be available at `http://localhost:5173`

### Getting Started

1. **Enter Username** - Join the whiteboard with a unique username
2. **Select Tool** - Choose from brush, eraser, shapes, or text tools
3. **Customize Settings** - Adjust colors, sizes, and other tool properties
4. **Start Drawing** - Click and drag on the canvas to draw
5. **Collaborate** - See other users' drawings and cursors in real-time

### Keyboard Shortcuts

- **B** - Switch to Brush tool
- **E** - Switch to Eraser tool
- **T** - Switch to Text tool
- **R** - Switch to Rectangle tool
- **C** - Switch to Circle tool
- **L** - Switch to Line tool
- **Ctrl+Z** - Undo last action - may not work
- **Ctrl+Y** - Redo last action - may not work

### Drawing Tools

- **Brush**: Freehand drawing with pressure-sensitive lines
- **Eraser**: Remove parts of drawings with customizable size
- **Rectangle**: Draw rectangular shapes by clicking and dragging
- **Circle**: Draw circles from center point outward
- **Line**: Draw straight lines between two points
- **Text**: Click to place text with customizable font size

### Chat Features

- **Send Messages** - Type and press Enter to send
- **Message History** - Scroll through previous messages
- **User Identification** - See who sent each message
- **Timestamps** - All messages include time information

## 🔧 Configuration

### Socket.io Connection

The client connects to the backend server using Socket.io. Update the server URL in `app.jsx`:

\`\`\`javascript
const socket = io("http://localhost:4000") // Change to your server URL
\`\`\`

### Canvas Settings

Modify canvas dimensions and grid settings in the `drawGridLines` function within `app.jsx`.

### Tool Configuration

Add or modify tools in the `tools` array in `components/Sidebar.jsx`.

## 🐛 Troubleshooting

### Common Issues

**Connection Problems**

- Ensure the backend server is running
- Check the server URL in the Socket.io connection
- Verify CORS settings allow your domain

**Drawing Not Syncing**

- Ensure internet connection
- Check browser console for Socket.io errors
- Try refreshing the page to reconnect

**Performance Issues**

- Large images may cause slowdowns
- Clear browser cache if experiencing issues
