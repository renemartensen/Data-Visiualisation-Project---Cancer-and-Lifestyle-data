export function showOverlay(iso, countryName) {
    const overlay = document.getElementById("custom-overlay");
    const title = document.getElementById("overlay-title");
    const content = document.getElementById("overlay-content");
    
    // Set title and content
    title.innerText = `Country: ${countryName} (${iso})`;
    content.innerHTML = '';  // Clear any previous content
    content.appendChild(createContent(iso, countryName));  // Append new content

    // Show overlay
    overlay.classList.remove("hidden");

    // Close overlay function
    function closeOverlay() {
        overlay.classList.add("hidden");
        document.removeEventListener("keydown", handleKeyDown);
    }

    // Click outside or Escape key to close
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeOverlay();
    });

    function handleKeyDown(event) {
        if (event.key === "Escape") closeOverlay();
    }
    document.addEventListener("keydown", handleKeyDown);

    // Close button event
    document.getElementById("close-overlay").onclick = closeOverlay;
}


function createContent(iso, countryName) {
    const main = document.createElement("div");
    main.innerHTML = `hej, her kommer der til at være grafer om ${countryName} (${iso})`;
    return main
}
