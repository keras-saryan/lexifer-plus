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
  const saveResultBtn = document.getElementById("saveResultBtn");
  const defTextarea = document.getElementById("def");
  const resultElement = document.getElementById("result");
  const numberInput = document.getElementById("number");
  const unsortedCheckbox = document.getElementById("unsorted");
  const onePerLineCheckbox = document.getElementById("one-per-line");
  const verboseCheckbox = document.getElementById("verbose");

  const downloadTextFile = (filename, content) => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const encodeState = (state) => btoa(encodeURIComponent(JSON.stringify(state)));

  const decodeState = (encoded) => JSON.parse(decodeURIComponent(atob(encoded)));

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
    const isCurrentlyDark = !darkTheme.disabled;
    updateTheme(!isCurrentlyDark);
  });

  const updateFont = (useSans) => {
    serifFont.disabled = useSans;
    fontToggle.textContent = useSans ? "✒️" : "🔡️";
    localStorage.setItem("fontface", useSans ? "sans" : "serif");
  };

  const savedFont = localStorage.getItem("fontface");
  const prefersSans = savedFont === "sans" || !savedFont;
  updateFont(prefersSans);

  fontToggle.addEventListener("click", () => {
    const isCurrentlySans = serifFont.disabled;
    updateFont(!isCurrentlySans);
  });

  loadFileBtn.addEventListener("click", () => hiddenInput.click());

  hiddenInput.addEventListener("change", async () => {
    const file = hiddenInput.files[0];
    if (!file) return;
    const text = await file.text();
    defTextarea.value = text;
  });

  saveFileBtn.addEventListener("click", () => {
    const content = defTextarea.value;
    if (!content.trim()) return alert("Definition is empty. 🤨");
    downloadTextFile("lexifer.def", content);
  });

  saveResultBtn.addEventListener("click", () => {
    const content = resultElement.innerText.trim();
    if (!content) return alert("There is no output to save! 🤨");
    downloadTextFile("output.wli", content);
  });

  window.copyResult = async function () {
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

  window.shareDefinition = () => {
    const state = {
      def: defTextarea.value,
      number: numberInput.value || "",
      unsorted: unsortedCheckbox.checked,
      onePerLine: onePerLineCheckbox.checked,
      verbose: verboseCheckbox.checked,
      output: resultElement.innerText,
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
    } catch (e) {
      console.warn("Failed to parse shared state:", e);
    }
  }

  defTextarea.addEventListener("dragover", (e) => e.preventDefault());
  defTextarea.addEventListener("drop", async (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".def")) {
      const text = await file.text();
      defTextarea.value = text;
      localStorage.setItem("lexifer-def", text);
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
        const shortcutCheats = document.getElementById("shortcut-cheats");
        shortcutCheats.style.display = (shortcutCheats.style.display === "block") ? "none" : "block";
        break;
      case "f":
        e.preventDefault();
        const isCurrentlySans = serifFont.disabled;
        updateFont(!isCurrentlySans);
        break;
      case "l":
        e.preventDefault();
        const isCurrentlyDark = !darkTheme.disabled;
        updateTheme(!isCurrentlyDark);
        break;
      case "i":
        e.preventDefault();
        loadFileBtn.click();
        break;
      case "e":
        e.preventDefault();
        saveFileBtn.click();
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
        e.preventDefault();
        genWords();
        break;
      case "c":
        e.preventDefault();
        copyResult();
        break;
      case "s":
        e.preventDefault();
        saveResultBtn.click();
        break;
      case "p":
        e.preventDefault();
        shareDefinition();
        break;
      case "x":
        e.preventDefault();
        const defTextarea = document.getElementById("def");
        defTextarea.value = '';
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
});
