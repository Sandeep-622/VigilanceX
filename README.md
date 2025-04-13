# VigilanceX

VigilanceX is a powerful Chrome extension for real-time JavaScript vulnerability scanning and security analysis. It helps developers and security professionals identify potential security risks in web applications by detecting vulnerable JavaScript libraries and providing detailed threat analysis using AI.

## Features

- **Real-time Vulnerability Scanning**: Automatically scans JavaScript libraries loaded on web pages
- **Deep Scanning**: Advanced scanning capability for thorough vulnerability detection
- **AI-Powered Threat Analysis**: Uses Google's Gemini AI to analyze and explain potential security threats
- **Multiple Detection Methods**: 
  - AST Analysis
  - URI Pattern Matching
  - File Content Analysis
  - Hash-based Detection
- **Severity Classification**: Vulnerabilities are classified by severity (Critical, High, Medium, Low)
- **Detailed Reporting**: Comprehensive vulnerability reports with references and explanations

## Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `chrome/extension` directory

## Configuration

### Setting up Gemini API Key

1. Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Paste the key directly into the file:  
   `chrome/extension/js/sample.js`  
   Replace the placeholder `"your gemini key"` in the `apiKey` variable with your actual API key.

## Usage

1. Click the VigilanceX icon in your Chrome toolbar
2. Enable scanning using the toggle switch
3. Browse websites normally - the extension will automatically scan for vulnerabilities
4. Click on detected vulnerabilities to see detailed information
5. View AI-generated threat analysis for comprehensive security insights

## Features Breakdown

### Scanning Modes

- **Standard Scan**: Basic vulnerability detection
- **Deep Scan**: More thorough analysis (may be slower)
- **Show Unknown**: Option to display unrecognized scripts

### Detection Methods
Detection Methods
-AST Analysis: Analyzes JavaScript Abstract Syntax Trees (AST) to identify patterns and constructs associated with vulnerabilities, such as insecure API usage or obfuscated code.
-URI Detection: Matches known vulnerable CDN or package URLs against a curated vulnerability database to identify externally loaded assets that may pose security risks.
-Content Analysis: Scans the content of files for known vulnerability signatures, such as insecure code snippets, suspicious function calls, or unsafe patterns.
-Hash Detection: Compares file hashes against a database of hashes from known vulnerable versions of libraries or scripts, allowing for fast and accurate identification.

### Vulnerability Information

- Severity level
- Affected versions
- CVE references
- Security advisories
- Detailed descriptions
- Fix recommendations

## Development

### Project Structure

```
chrome/
├── extension/
│   ├── js/
│   │   ├── background.js
│   │   ├── content.js
│   │   └── sample.js
│   ├── popup.html
│   └── manifest.json
```

### Building

You can build the project using either of the following methods:

```bash
cd node
npm install
npm run build
cd ../chrome/build
npm install
npm run build
```

**OR**

```bash
bash build_chrome.sh
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## Security

- The extension requires minimal permissions
- No sensitive data is transmitted to external servers except Google's Gemini API
- All scanning is performed locally

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
