document.addEventListener("DOMContentLoaded", () => {
  const fontToggle = document.getElementById("font-toggle");
  const serifFont = document.getElementById("serif-font");
  const sansFont = document.getElementById("sans-font");
  const themeToggle = document.getElementById("theme-toggle");
  const lightTheme = document.getElementById("light-theme");
  const darkTheme = document.getElementById("dark-theme");
  const hiddenInput = document.getElementById("hiddenFileInput");
  const loadFileBtn = document.getElementById("loadFileBtn");
  const saveFileBtn = document.getElementById("saveFileBtn");
  const saveOutputBtn = document.getElementById("saveOutputBtn");
  const defTextarea = document.getElementById("def");
  const resultElement = document.getElementById("result");
  const numberInput = document.getElementById("number");
  const unsortedCheckbox = document.getElementById("unsorted");
  const onePerLineCheckbox = document.getElementById("one-per-line");
  const verboseCheckbox = document.getElementById("verbose");
  const changesInput = document.getElementById("lexurgy-changes");

  const downloadTextFile = (filename, content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const encodeState = (state) =>
    LZString.compressToEncodedURIComponent(JSON.stringify(state));

  const decodeState = (encoded) =>
    JSON.parse(LZString.decompressFromEncodedURIComponent(encoded));

  const updateTheme = (isDark) => {
    lightTheme.disabled = isDark;
    darkTheme.disabled = !isDark;
    themeToggle.textContent = isDark ? "🌞️" : "🌚";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  };

  const savedTheme = localStorage.getItem("theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  updateTheme(savedTheme === "dark" || (!savedTheme && prefersDark));

  themeToggle.addEventListener("click", () => {
    updateTheme(darkTheme.disabled);
  });

  const updateFont = (useSans) => {
    serifFont.disabled = useSans;
    fontToggle.textContent = useSans ? "✒️" : "🔡️";
    localStorage.setItem("fontface", useSans ? "sans" : "serif");
  };

  const savedFont = localStorage.getItem("fontface");
  updateFont(savedFont === "sans" || !savedFont);

  fontToggle.addEventListener("click", () => {
    updateFont(!serifFont.disabled);
  });

  loadFileBtn.addEventListener("click", () => hiddenInput.click());

  hiddenInput.addEventListener("change", async () => {
    const file = hiddenInput.files[0];
    if (file) defTextarea.value = await file.text();
  });

  saveFileBtn.addEventListener("click", () => {
    if (!defTextarea.value.trim()) return alert("Definition is empty. 🤨");
    downloadTextFile("lexifer.def", defTextarea.value);
  });

  saveOutputBtn.addEventListener("click", () => {
    const content = resultElement.innerText.trim();
    if (!content) return alert("There is no output to save! 🤨");
    downloadTextFile("output.wli", content);
  });

  window.copyOutput = async function () {
    const text = resultElement.innerText.trim();
    if (!text) return alert("There is nothing to copy! 🤨");
    try {
      await navigator.clipboard.writeText(text);
      alert("Output copied to clipboard! 🥳");
    } catch (err) {
      console.error("Failed to copy:", err);
      alert("Failed to copy output. 😢");
    }
  };

  window.sharePage = () => {
    const state = {
      def: defTextarea.value,
      number: numberInput.value || "",
      unsorted: unsortedCheckbox.checked,
      onePerLine: onePerLineCheckbox.checked,
      verbose: verboseCheckbox.checked,
      output: resultElement.innerText,
      encodedChanges: changesInput ? changesInput.value.trim() : "",
    };

    try {
      const encoded = encodeState(state);
      const shareURL = `${location.origin}${location.pathname}?state=${encoded}`;
      navigator.clipboard.writeText(shareURL).then(() => alert("URL copied to clipboard! 🥳"));
    } catch (err) {
      console.error("Failed to encode state:", err);
      alert("Failed to create URL. 😢");
    }
  };

  const params = new URLSearchParams(window.location.search);
  const encoded = params.get("state");
  if (encoded) {
    try {
      const state = decodeState(encoded);
      if (state.def !== undefined) defTextarea.value = state.def;
      if (state.number !== undefined) numberInput.value = state.number;
      if (state.unsorted !== undefined) unsortedCheckbox.checked = state.unsorted;
      if (state.onePerLine !== undefined) onePerLineCheckbox.checked = state.onePerLine;
      if (state.verbose !== undefined) verboseCheckbox.checked = state.verbose;
      if (state.output !== undefined) resultElement.innerText = state.output;
      if (state.encodedChanges !== undefined && changesInput) {
        changesInput.value = state.encodedChanges;
      }
    } catch (e) {
      console.warn("Failed to parse shared state:", e);
    }
  }

  defTextarea.addEventListener("dragover", (e) => e.preventDefault());
  defTextarea.addEventListener("drop", async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".def")) {
      defTextarea.value = await file.text();
    }
  });

  /*
  defTextarea.addEventListener("input", () => {
    localStorage.setItem("lexifer-def", defTextarea.value);
  });

  const savedDef = localStorage.getItem("lexifer-def");
  if (!encoded && savedDef) defTextarea.value = savedDef;
  */

  document.addEventListener("keydown", (e) => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey;
    
    if (!(ctrlOrCmd && e.shiftKey)) return;

    switch (e.key.toLowerCase()) {
      case "?":
        e.preventDefault();
        const cheats = document.getElementById("shortcut-cheats");
        cheats.style.display = cheats.style.display === "block" ? "none" : "block";
        break;
      case "f":
        e.preventDefault();
        updateFont(!serifFont.disabled);
        break;
      case "h":
        e.preventDefault();
        updateTheme(darkTheme.disabled);
        break;
      case "i":
        e.preventDefault();
        loadFileBtn.click();
        break;
      case "e":
        e.preventDefault();
        saveFileBtn.click();
        break;
      case "v":
        e.preventDefault();
        navigator.clipboard
          .readText()
          .then((text) => {
            defTextarea.value = text;
          })
          .catch((err) => {
            console.error("Failed to read clipboard:", err);
            alert("Could not read from clipboard. 😢");
          });
        break;
      case "x":
        e.preventDefault();
        defTextarea.value = "";
        break;
      case "arrowup":
        e.preventDefault();
        numberInput.value = parseInt(numberInput.value || "0", 10) + 10;
        break;
      case "arrowdown":
        e.preventDefault();
        numberInput.value = Math.max(0, parseInt(numberInput.value || "0", 10) - 10);
        break;
      case "u":
        e.preventDefault();
        unsortedCheckbox.checked = !unsortedCheckbox.checked;
        break;
      case "o":
        e.preventDefault();
        onePerLineCheckbox.checked = !onePerLineCheckbox.checked;
        break;
      case "a":
        e.preventDefault();
        verboseCheckbox.checked = !verboseCheckbox.checked;
        break;
      case "g":
      case "enter":
        e.preventDefault();
        genWords();
        break;
      case "c":
        e.preventDefault();
        copyOutput();
        break;
      case "s":
        e.preventDefault();
        saveOutputBtn.click();
        break;
      case "p":
        e.preventDefault();
        sharePage();
        break;
      case "l":
        e.preventDefault();
        toLexurgy();
        break;
      case "y":
        e.preventDefault();
        if (changesInput) {
          navigator.clipboard
            .readText()
            .then((text) => {
              changesInput.value = text;
            })
            .catch((err) => {
              console.error("Failed to read clipboard:", err);
              alert("Could not read from clipboard. 😢");
            });
        }
        break;
      case "k":
        e.preventDefault();
        if (changesInput) changesInput.value = "";
        break;
    }
  });

  const shortcutHelpBtn = document.getElementById("shortcut-help");
  const shortcutCheats = document.getElementById("shortcut-cheats");
  const closeShortcutCheats = document.getElementById("close-shortcut-cheats");

  shortcutHelpBtn.addEventListener("click", () => {
    shortcutCheats.style.display = "block";
  });

  closeShortcutCheats.addEventListener("click", () => {
    shortcutCheats.style.display = "none";
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && shortcutCheats.style.display === "block") {
      shortcutCheats.style.display = "none";
    }
  });

  function toLexurgy() {
    const output = resultElement.innerText.trim();
    if (!output) return alert("There is no output to send! 🤨");

    let encodedChanges = changesInput?.value.trim() || "";
    if (encodedChanges.includes("changes=")) {
      const match = encodedChanges.match(/changes=([^&]*)/);
      if (match) encodedChanges = match[1];
    }

    const encodedInput = btoa(unescape(encodeURIComponent(output)))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const url = `https://lexurgy-app.vercel.app/sc?changes=${encodedChanges}&input=${encodedInput}`;
    window.open(url, "_blank");
  }

  window.toLexurgy = toLexurgy;
});
