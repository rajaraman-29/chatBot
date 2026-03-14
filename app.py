import os
import requests
from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests if the user opens index.html locally

# Securely stored API Key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

@app.route('/')
def home():
    # Serve the main index.html from the templates folder
    return render_template('index.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Securely handles the chat request by attaching the API key on the backend."""
    data = request.json
    messages = data.get('messages', [])
    
    if not messages:
        return jsonify({"error": "No messages provided"}), 400

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "openrouter/free",
                "messages": messages
            },
            timeout=30  # Add timeout so it doesn't hang forever
        )
        
        response.raise_for_status()
        return jsonify(response.json())
        
    except requests.exceptions.Timeout:
        print("Error: OpenRouter API timed out after 30 seconds.")
        return jsonify({"error": "The free AI server is currently overloaded and timed out. Please try again."}), 504
    except requests.exceptions.RequestException as e:
        error_msg = f"Error communicating with OpenRouter: {e}"
        if hasattr(e, 'response') and e.response is not None:
             error_msg += f" Response: {e.response.text}"
        print(error_msg)
        return jsonify({"error": "Failed to connect to AI service"}), 500

if __name__ == '__main__':
    # Run the Flask app on port 5000
    app.run(debug=True, port=5000)
