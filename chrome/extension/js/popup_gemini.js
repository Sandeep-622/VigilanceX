async function callGemini(promptText) {
    const apiKey = 'AIzaSyB4aeSXleQjEjH2xZynnSyvH3ma0tn8NzE'; // Secure this in production!
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
    const payload = {
      contents: [{
        parts: [{ text: "Hello What data is today" }]
      }]
    };
  
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
  
    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || 'No response';
    return text;
  }
  