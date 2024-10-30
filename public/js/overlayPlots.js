
export function showOverlay(iso, countryName) {
    
    // Check if overlay already exists
    if (document.getElementById("custom-overlay")) return;

    // Create overlay container
    const overlay = document.createElement("div");
    overlay.id = "custom-overlay";
    overlay.style.position = "fixed";
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";  // Semi-transparent background
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = 1000;  // Ensure it's on top

    // Close overlay function
    function closeOverlay() {
        document.body.removeChild(overlay);
        document.removeEventListener("keydown", handleKeyDown);
    }

    // Click outside the content box to close
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeOverlay();
    });

    // Close on Escape key press
    function handleKeyDown(event) {
        if (event.key === "Escape") closeOverlay();
    }
    document.addEventListener("keydown", handleKeyDown);

    // Create overlay content box
    
    const contentBox = document.createElement("div");
    contentBox.style.backgroundColor = "#fff";
    contentBox.style.padding = "20px";
    contentBox.style.borderRadius = "8px";
    contentBox.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    contentBox.style.maxWidth = "80%";
    contentBox.style.maxHeight = "80%";
    contentBox.style.overflow = "auto";
    const title = document.createElement("h1");
    title.classList.add("text-2xl", "font-bold", "text-grey");
    title.innerText = `Country: ${countryName} (${iso})`;
    contentBox.appendChild(title);

    // Close button
    const closeButton = document.createElement("button");
    closeButton.innerText = "Close";
    closeButton.style.marginTop = "10px";
    closeButton.style.padding = "8px 12px";
    closeButton.style.cursor = "pointer";
    closeButton.style.border = "none";
    closeButton.style.borderRadius = "4px";
    closeButton.style.backgroundColor = "#333";
    closeButton.style.color = "#fff";
    closeButton.onclick = closeOverlay;

    const main = createContent(iso, countryName);

    // Append elements
    contentBox.appendChild(main);
    contentBox.appendChild(closeButton);
    overlay.appendChild(contentBox);
    
    
    document.body.appendChild(overlay);
}

function createContent(iso, countryName) {
    const main = document.createElement("div");
    main.innerHTML = `hej, her kommer der til at være grafer om ${countryName} (${iso})`;
    return main
}
