/* global chrome, console */

let count = 0;
const totalResults = [];

(function () {
  const isSecure = window.location.protocol === 'https:';

  // Add the listener in all cases
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message) {
      const result = JSON.parse(request.message);
      totalResults.push(result);
      if (result.vulnerable) {
        result.results
          .filter((x) => x.vulnerabilities && x.vulnerabilities.length > 0)
          .forEach(() => count++);
        const out = result.results.map((r) => {
          r.vulnerabilities = r.vulnerabilities || [];
          return `${r.component} ${r.version} - Info: ${r.vulnerabilities
            .map((i) => i.info)
            .join(" ")}`;
        });
        console.log(
          `⚠️ Loaded script with known vulnerabilities: ${
            result.url
          }\n - ${out.join("\n - ")}`
        );
      }
      sendResponse({ count: count });
    } else if (request.getDetected) {
      sendResponse(totalResults);
    }
    return false;
  });

  // Push HTTP vulnerability only if not secure
  if (!isSecure) {
    const httpsResult = {
      url: window.location.href,
      results: [{
        component: "Protocol Security",
        version: "HTTP",
        vulnerabilities: [{
          severity: "high",
          identifiers: {
            summary: "Insecure HTTP Protocol Detected"
          },
          info: ["Connection is not secure. Data transmitted over HTTP is vulnerable to interception."],
          below: "2.0.0"
        }]
      }]
    };
    totalResults.push(httpsResult);
  }

})();
