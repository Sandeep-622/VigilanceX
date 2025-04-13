async function callGemini(promptText) {
  const apiKey = 'YOUR_GEMINI_KEY';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: promptText }] }]
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response from Gemini";
}

let prompt = ""


window.addEventListener(
  "load",
  () => {
      // Existing enabled and deepEnabled handlers
      sendMessage("enabled?", null, (response) => {
          document.querySelector("input[type=checkbox]#enabled").checked =
              response.enabled;
      });
      sendMessage("deepScanEnabled?", null, (response) => {
          document.querySelector("input[type=checkbox]#deepEnabled").checked =
              response.enabled;
      });

      document.querySelector("input[type=checkbox]#enabled").addEventListener(
          "click",
          () => {
              chrome.action.setIcon({
                  path: this.checked ? "img/favicon_48.png" : "icons/icon_bw48.png",
              });
              sendMessage("enable", this.checked, null);
          },
          false
      );

      document.querySelector("input[type=checkbox]#deepEnabled").addEventListener(
          "click",
          () => {
              sendMessage("deepScanEnable", this.checked, null);
          },
          false
      );

      // Unknown toggle handler
      const resultsContainer = document.getElementById("results");
      const unknownToggle = document.querySelector("input[type=checkbox]#unknown");
      
      unknownToggle.addEventListener("click", () => {
          resultsContainer.classList.toggle("show-unknown", unknownToggle.checked);
          resultsContainer.classList.toggle("hide-unknown", !unknownToggle.checked);
      });

      // Theme toggle handler
      const themeToggle = document.querySelector("input[type=checkbox]#themeToggle");
      themeToggle.addEventListener("click", () => {
          document.documentElement.classList.toggle("light-mode", !themeToggle.checked);
          // Persist theme preference
          localStorage.setItem("theme", themeToggle.checked ? "dark" : "light");
      });

      // Load saved theme preference
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme === "light") {
          themeToggle.checked = false;
          document.documentElement.classList.add("light-mode");
      }

      queryForResults();
      setInterval(queryForResults, 50000);
  },
  false
);

function queryForResults() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(
      tabs[0].id,
      { getDetected: 1 },
      async function (response) {
        if (!document.querySelector('.loadingBlock').classList.contains("open")) {
          document.querySelector('.loadingBlock').classList.add("open");
        }
        if (!document.getElementById('suggestion').classList.contains("open")) {
          document.getElementById('suggestion').classList.remove("open")
        }
        show(response);
        console.log(prompt)

        // Gemini is being Called
        if (prompt != "") {
          setTimeout(async () => {
            const result = await callGemini(
              "This are the vulnerabilities that I found on a webpage. List out some of the possible data breaches that can take place due to these vulnerabilites: Only list possible breached in 5-10 bullet points of one line. Since I am using gemini api, don't any font styling, just add new line after each point" + prompt
            );
            document.querySelector('.loadingBlock').classList.remove('open')
            const formattedResult = '<ul>' +
              result
                .split('*')
                .filter(line => line.trim() !== '') // skip empty lines
                .map(line => `<li>${line.trim()}</li>`) // wrap each point in <li>
                .join('') +
              '</ul>';


            document.getElementById("suggestion").innerHTML = "<h3>Possible Threats</h3>" + formattedResult;
            document.getElementById('suggestion').classList.add("open")

            console.log("done gemini");
          }, 200);
        }
        else {
          document.querySelector('.loadingBlock').classList.remove('open')
          const result = "No Vulnerabilies. Clear to go."
          const formattedResult = result
          document.getElementById("suggestion").innerHTML = "<h3>Possible Threats</h3> <br>" + formattedResult;
          document.getElementById('suggestion').classList.add("open")
        }
        console.log(response);
      }
    );
  });
}
function mapSeverity(vulns) {
  if (vulns.some((v) => v.severity == "critical")) return "critical";
  if (vulns.some((v) => v.severity == "high")) return "high";
  if (vulns.some((v) => v.severity == "medium")) return "medium";
  if (vulns.some((v) => v.severity == "low")) return "low";
  return "high";
}
const severityMap = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  unknown: 0,
};
const detMapping = {
  ast: "AST",
  uri: "URI",
  filename: "file name",
  filecontent: "file content",
};

function show(totalResults) {
  if (totalResults == null || totalResults == undefined) return;

  document.getElementById("results").innerHTML = "";
  document.getElementById("suggestion").innerHTML = "";
  
  // Maintain existing class for unknown toggle
  const resultsContainer = document.getElementById("results");
  const isUnknownShown = document.querySelector("#unknown").checked;
  resultsContainer.classList.toggle("show-unknown", isUnknownShown);
  resultsContainer.classList.toggle("hide-unknown", !isUnknownShown);
  console.log(totalResults);
  var merged = {};
  totalResults.forEach((rs) => {
    merged[rs.url] = merged[rs.url] || { url: rs.url, results: [] };
    rs.results.forEach((r) => {
      if (
        !merged[rs.url].results.some(
          (x) => x.component == r.component && x.version == r.version
        )
      ) {
        merged[rs.url].results.push(r);
      }
    });
  });

  let results = Object.values(merged);

  const vulnerabilities = results.reduce((acc, rs) => {
    return (
      acc +
      rs.results.reduce((acc, r) => {
        return acc + (r.vulnerabilities ? r.vulnerabilities.length : 0);
      }, 0)
    );
  }, 0);
  document.querySelector("#stats").innerHTML = `<span>URLs scanned: ${results.length
    }</span> <span class="${vulnerabilities > 0 ? "vuln" : ""
    }">Vulnerabilities found: ${vulnerabilities}</span>`;

  results.forEach((rs) => {
    rs.results.forEach((r) => {
      r.url = rs.url;
      r.vulnerable = r.vulnerabilities && r.vulnerabilities.length > 0;
    });
    if (rs.results.length == 0) {
      rs.results = [{ url: rs.url, unknown: true, component: "unknown" }];
    }
  });
  let res = results.reduce((x, y) => {
    return x.concat(y.results);
  }, []);
  res.sort((x, y) => {
    if (x.unknown != y.unknown) {
      return x.unknown ? 1 : -1;
    }
    if (x.vulnerable != y.vulnerable) {
      return x.vulnerable ? -1 : 1;
    }
    return (x.component + x.version + x.url).localeCompare(
      y.component + y.version + y.url
    );
  });

  res.forEach((r) => {
    let tr = document.createElement("div");
    tr.className = "rowEntry"
    document.getElementById("results").appendChild(tr);

    // Create vulnerability section container but keep it hidden initially
    let listVulns = null;

    tr.addEventListener("click", () => {
      if (listVulns.classList.contains("open")) {
        listVulns.classList.remove("open");
      } else {
        listVulns.classList.add("open");
      }
    });


    let vulns;
    if (r.unknown) {
      tr.classList.add("unknown");
      td(tr, "component").innerText = "-";
      td(tr, "version").innerText = "-";
      vulns = td(tr, "vulns");
      vulns.innerHTML = `Did not recognize ${r.url}`;
    } else {
      td(tr, "component").innerText = r.component;
      td(tr, "version").innerText = r.version;
      vulns = td(tr, "vulns");
      let d = detMapping[r.detection] ?? r.detection;
      vulns.innerHTML = `${r.url} (${d} detection)`;
    }

    if (r.vulnerabilities && r.vulnerabilities.length > 0) {
      r.vulnerabilities.sort((x, y) => {
        return severityMap[y.severity] - severityMap[x.severity];
      });
      const severity = mapSeverity(r.vulnerabilities);
      tr.classList.add("vulnerable");
      tr.classList.add(severity);

      listVulns = document.createElement("div");
      listVulns.className = "listVulns";
      // listVulns.style.display = "none"; // Hide initially
      tr.appendChild(listVulns);

      const table = document.createElement("table");
      table.style.width = "100%";
      listVulns.appendChild(table);

      r.vulnerabilities.forEach(function (v) {
        const row = document.createElement("tr");
        row.className = v.severity;
        table.appendChild(row);

        // Severity cell (left aligned)
        const sev = td1(row);
        sev.style.textAlign = "left";
        sev.innerText = v.severity || " ";

        // Identifiers cell (left aligned)
        const ids = td1(row);
        ids.style.textAlign = "left";
        ids.innerText = v.identifiers
          ? v.identifiers
            .mapOwnProperty((val) => val)
            .flatten()
            .join(" ")
          : " ";
        prompt = prompt + ids.innerHTML
        // console.log(ids.innerHTML)
        // Info cell (right aligned)
        const info = td1(row);
        info.className = "info";
        info.style.textAlign = "right";
        v.info.forEach(function (u, i) {
          const a = document.createElement("a");
          a.innerText = i + 1;
          a.href = u;
          a.title = u;
          a.target = "_blank";
          info.appendChild(a);
          if (i < v.info.length - 1) {
            info.appendChild(document.createTextNode(" "));
          }
        });
      });
    }
  });

}
function td(tr, cName) {
  let cell = document.createElement("span");
  cell.className = cName;
  tr.appendChild(cell);
  return cell;
}
function td1(tr) {
  let cell = document.createElement("td");
  tr.appendChild(cell);
  return cell;
}



Object.prototype.forEachOwnProperty = function (f) {
  mapOwnProperty(f);
};
Object.prototype.mapOwnProperty = function (f) {
  var results = [];
  for (var i in this) {
    if (this.hasOwnProperty(i)) results.push(f(this[i], i));
  }
  return results;
};

Array.prototype.flatten = function () {
  return this.reduce((a, b) => a.concat(b), []);
};

function sendMessage(message, data, callback) {
  chrome.runtime.sendMessage(
    { to: "background", message: message, data: data },
    (response) => {
      callback && callback(response);
    }
  );
}
