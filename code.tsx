<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>AI Media Generator</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    /* ===== Basic Styles ===== */
    body {
      margin: 0;
      font-family: sans-serif;
      background: #0f172a;
      color: #e2e8f0;
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 900;
      text-align: center;
      color: white;
      margin: 1rem 0;
    }
    .container {
      max-width: 1200px;
      margin: auto;
      padding: 1rem;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 1rem;
    }
    .card {
      background: rgba(15, 23, 42, 0.9);
      border: 1px solid #475569;
      border-radius: 0.75rem;
      padding: 1rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.6);
    }
    label {
      display: block;
      margin-bottom: 0.25rem;
      font-size: 0.9rem;
      font-weight: bold;
    }
    input, textarea, select, button {
      width: 100%;
      padding: 0.5rem;
      margin-bottom: 1rem;
      border-radius: 0.5rem;
      border: 1px solid #475569;
      background: #1e293b;
      color: #e2e8f0;
    }
    button {
      cursor: pointer;
      font-weight: bold;
      background: #3b82f6;
      border: none;
    }
    button:disabled {
      background: #475569;
      cursor: not-allowed;
    }
    .results img, .results video {
      width: 100%;
      border-radius: 0.5rem;
      margin-top: 0.5rem;
    }
    .results .item {
      background: #1e293b;
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      border-radius: 0.5rem;
    }
    .flex {
      display: flex;
      gap: 0.5rem;
    }
    .progress {
      width: 100%;
      height: 8px;
      background: #334155;
      border-radius: 4px;
      margin-top: 0.5rem;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      width: 0;
      background: #3b82f6;
      transition: width 0.3s ease;
    }
  </style>
</head>
<body>
  <h1>AI Media Generator</h1>
  <div class="container">
    <!-- Left Panel -->
    <div class="card">
      <label for="mode">Mode</label>
      <select id="mode">
        <option value="image">Image</option>
        <option value="video">Video</option>
      </select>

      <label for="prompt">Prompt</label>
      <textarea id="prompt" placeholder="Enter your description..."></textarea>

      <label for="style">Style</label>
      <select id="style">
        <option value="photorealistic">Photorealistic</option>
        <option value="artistic">Artistic</option>
        <option value="cartoon">Cartoon</option>
        <option value="vintage">Vintage</option>
        <option value="modern">Modern</option>
        <option value="fantasy">Fantasy</option>
      </select>

      <label for="size">Size</label>
      <select id="size">
        <option value="1024x1024">1024×1024</option>
        <option value="512x512">512×512</option>
        <option value="1920x1080">1920×1080</option>
        <option value="1080x1920">1080×1920</option>
      </select>

      <div class="flex">
        <button id="generate">Generate</button>
        <button id="clear">Clear</button>
      </div>

      <div class="progress">
        <div id="progress-bar" class="progress-bar"></div>
      </div>
    </div>

    <!-- Right Panel (Results) -->
    <div class="card results">
      <h3>Generated Media</h3>
      <div id="results"></div>
    </div>
  </div>

  <script>
    // ===== Variables =====
    const modeEl = document.getElementById("mode");
    const promptEl = document.getElementById("prompt");
    const styleEl = document.getElementById("style");
    const sizeEl = document.getElementById("size");
    const generateBtn = document.getElementById("generate");
    const clearBtn = document.getElementById("clear");
    const resultsEl = document.getElementById("results");
    const progressBar = document.getElementById("progress-bar");

    let isGenerating = false;

    // ===== Fake API Call (Demo) =====
    async function generateMedia(prompt, style, type, size) {
      // ⚠ Replace with your actual API calls (like in TSX file)
      return new Promise((resolve) => {
        let fakeUrl =
          type === "image"
            ? "https://placehold.co/600x400/png?text=Generated+" + style
            : "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4";

        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          progressBar.style.width = progress + "%";
          if (progress >= 100) {
            clearInterval(interval);
            resolve(fakeUrl);
          }
        }, 200);
      });
    }

    // ===== Generate Handler =====
    generateBtn.addEventListener("click", async () => {
      if (isGenerating) return;
      const prompt = promptEl.value.trim();
      if (!prompt) {
        alert("Enter a prompt first!");
        return;
      }

      isGenerating = true;
      generateBtn.disabled = true;
      progressBar.style.width = "0%";

      const url = await generateMedia(
        prompt,
        styleEl.value,
        modeEl.value,
        sizeEl.value
      );

      const item = document.createElement("div");
      item.className = "item";
      if (modeEl.value === "image") {
        item.innerHTML = `
          <p><b>${styleEl.value}</b> • ${sizeEl.value}</p>
          <img src="${url}" alt="Generated image" />
          <p>${prompt}</p>
        `;
      } else {
        item.innerHTML = `
          <p><b>${styleEl.value}</b> • ${sizeEl.value}</p>
          <video src="${url}" controls></video>
          <p>${prompt}</p>
        `;
      }
      resultsEl.prepend(item);

      isGenerating = false;
      generateBtn.disabled = false;
    });

    // ===== Clear Results =====
    clearBtn.addEventListener("click", () => {
      resultsEl.innerHTML = "";
    });
  </script>
</body>
</html>
