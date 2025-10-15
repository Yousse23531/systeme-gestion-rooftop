# FAQ and Contact Features Setup

## ✅ Features Added

### 1. FAQ - Assistant IA
- **Location**: Accessible via sidebar menu "FAQ - Assistant IA"
- **Features**:
  - Interactive chat interface for asking questions
  - LLM-powered responses (with fallback to predefined answers)
  - Confidence scoring for responses
  - Message history with timestamps
  - Real-time status indicator (online/offline mode)

### 2. Contact Page
- **Location**: Accessible via sidebar menu "Contact"
- **Features**:
  - Company information with logo
  - Multiple contact methods:
    - WhatsApp: +216 48 115 274
    - Phone: +216 29 173 456
    - Email: contact@hekma.ovh
  - Direct action buttons (call, message, email)
  - Services overview
  - Quick contact form

## 🔧 LLM Integration Setup

### Option 1: With API Key (Recommended)
1. Create a `.env` file in the root directory
2. Add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_api_key_here
   ```
3. Restart the development server
4. The FAQ will now use real LLM responses

### Option 2: Without API Key (Fallback Mode)
- The FAQ works without any API key
- Uses intelligent fallback responses
- Covers common questions about the system
- Shows "Mode hors ligne" indicator

## 📱 Contact Integration

### WhatsApp Integration
- Clicking WhatsApp button opens WhatsApp Web/App
- Pre-fills a greeting message
- Direct link: `https://wa.me/21648115274`

### Phone Integration
- Clicking phone button initiates a call
- Works on mobile devices
- Direct link: `tel:+21629173456`

### Email Integration
- Clicking email button opens default email client
- Pre-fills recipient address
- Direct link: `mailto:contact@hekma.ovh`

## 🎨 UI Features

### FAQ Interface
- Clean chat-like interface
- Loading states with spinner
- Confidence indicators (color-coded)
- Message history with timestamps
- Responsive design

### Contact Page
- Professional layout with company branding
- Interactive contact cards
- Service overview section
- Quick action buttons
- Mobile-friendly design

## 🔄 Navigation Updates

The sidebar now includes:
- "FAQ - Assistant IA" (MessageCircle icon)
- "Contact" (Phone icon)

Both sections are fully integrated into the existing navigation system.

## 🚀 Usage

1. **FAQ**: Users can ask questions in natural language and get instant responses
2. **Contact**: Users can easily reach out via their preferred communication method
3. **LLM**: Provides intelligent, contextual responses about the system
4. **Fallback**: Ensures the system works even without external API dependencies

## 📝 Notes

- The LLM service is designed to be provider-agnostic
- Fallback responses cover common use cases
- All contact information is easily configurable
- The system gracefully handles API failures
- No external dependencies required for basic functionality
