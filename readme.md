# OPENAI Key Checker

This project provides a simple web interface to check whether your OpenAI API key supports GPT-4 or other models like GPT-3.5-Turbo. It supports both single key checking and batch checking from a text file.

## Features

- Check if your OpenAI API Key supports GPT-4 and other models.
- Batch checking by uploading a text file containing multiple keys.
- Simple and intuitive web interface.

## Project Setup

The project is set up in Node.js with Express.js for the back-end and vanilla JavaScript for the front-end.

### Prerequisites

Ensure you have the following installed on your system:

1. Node.js (version 14 or higher)
2. npm (version 6 or higher)

### Installation

To set up the project locally, follow the steps below:

1. Clone the repository:

```bash
git clone https://github.com/aikemist/openai-key-checker.git
```

2. Navigate into the project directory:

```bash
cd openai-key-checker
```

3. Install the project dependencies:

```bash
npm install
```

### Configuration

Create a `.env` file in the project root directory and add your OpenAI API Key:

```env
OPENAI_API_KEY=your_openai_api_key
```

## Running the Application

To start the application:

```bash
npm start
```

This will start the server on port 3000 or the port specified in the `PORT` environment variable. Navigate to `http://localhost:3000` to access the application.

## Usage

- **Single Key Check**: Enter the API key in the input box and click "Check".
- **Batch Key Check**: Click "Batch", then select a text file containing one or more API keys.

## Note

- The server needs to be restarted after updating the `.env` file.
- The application uses OpenAI's models endpoint to check the available models for a key, and it also uses OpenAI's Chat API to preprocess the batch key text. Make sure the OpenAI API Key you use for server setup has the necessary permissions.
