// badge.js
(function () {

  async function waitForKey() {
    return new Promise(resolve => {
      const check = () => {
        // console.log("[BADGE] Checking for userLicenseKey…", window.userLicenseKey);
        if (window.userLicenseKey) resolve(window.userLicenseKey);
        else setTimeout(check, 50);
      };
      check();
    });
  }

  async function waitForValidator() {
    return new Promise(resolve => {
      const check = () => {
        // console.log("[BADGE] Checking for __checkLicense…", typeof window.__checkLicense);
        if (typeof window.__checkLicense === "function") resolve();
        else setTimeout(check, 50);
      };
      check();
    });
  }

  // Base64-encoded verified badge image
  // Replace with your own image if desired
  const LicenseBadgeBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAAAoCAIAAACHGsgUAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAFTGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI2LTAyLTA1PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkRhdGE+eyZxdW90O2RvYyZxdW90OzomcXVvdDtEQUhBYlNqd1FKOCZxdW90OywmcXVvdDt1c2VyJnF1b3Q7OiZxdW90O1VBQmwtVC1lUjNrJnF1b3Q7LCZxdW90O2JyYW5kJnF1b3Q7OiZxdW90O0JBQmwtWEQ5OTVFJnF1b3Q7fTwvQXR0cmliOkRhdGE+CiAgICAgPEF0dHJpYjpFeHRJZD43NzhjZGY3NC1jMzg2LTQxMzktOTMzNC1iNDFjN2E3NWVhZTc8L0F0dHJpYjpFeHRJZD4KICAgICA8QXR0cmliOkZiSWQ+NTI1MjY1OTE0MTc5NTgwPC9BdHRyaWI6RmJJZD4KICAgICA8QXR0cmliOlRvdWNoVHlwZT4yPC9BdHRyaWI6VG91Y2hUeXBlPgogICAgPC9yZGY6bGk+CiAgIDwvcmRmOlNlcT4KICA8L0F0dHJpYjpBZHM+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOmRjPSdodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4x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";
  async function render() {
    // console.log("[BADGE] Render started");

    const el = document.getElementById("licenseBadge");
    // console.log("[BADGE] Badge element =", el);

    if (!el) {
      // console.log("[BADGE] No badge element found — stopping");
      return;
    }

    await waitForValidator();
    // console.log("[BADGE] Validator ready");

    const key = await waitForKey();
    // console.log("[BADGE] Key ready =", key);

    const valid = await window.__checkLicense();
    // console.log("[BADGE] License valid =", valid);

    if (valid && key) {
      // console.log("[BADGE] Rendering VERIFIED badge");
      // Replace URL with your own verification page if desired
      el.innerHTML = `
        <a href="https://erickouassi.github.io/YT-Rank-Tracker-verify/?licenseKey=${encodeURIComponent(key)}"
           target="_blank" rel="noopener noreferrer">
          <img src="${LicenseBadgeBase64}" alt="Verified logo" width="100" height="40">
        </a>
      `;
    } else {
      //console.log("[BADGE] Rendering UNLICENSED message");
      el.textContent = "This installation is not licensed.";
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    //console.log("[BADGE] DOMContentLoaded fired");
    render();
  });

})();
