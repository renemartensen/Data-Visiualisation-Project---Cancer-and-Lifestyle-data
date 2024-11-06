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

export function showHelpOverlay() {
    // Create overlay background
    const overlay = document.createElement("div");
    overlay.className = "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50";

    // Create content container
    const contentContainer = document.createElement("div");
    contentContainer.className = "max-w-3xl w-full bg-white rounded-lg shadow-lg relative p-6";
    contentContainer.style.maxHeight = "80vh";  // Limits height for scrollability within overlay
    contentContainer.style.overflowY = "auto";   // Enables scrolling within this container

    // Create close button
    const closeButton = document.createElement("button");
    closeButton.innerHTML = "&times;";
    closeButton.className = "absolute top-2 right-4 text-gray-500 hover:text-gray-700 font-bold text-xl focus:outline-none";
    closeButton.onclick = closeOverlay;
    contentContainer.appendChild(closeButton);

    // Create title and content
    const title = document.createElement("h2");
    title.className = "text-2xl font-bold text-center";
    title.innerText = "Help Document";

    const description = document.createElement("p");
    description.className = "text-gray-700 text-center";
    description.innerText = "Description of units of mesaurement and methods used.";

    const helpContent = document.createElement("div");
    helpContent.className = "space-y-10 text-left mt-4";
    helpContent.innerHTML = `
        <section class="mb-8">
            <h3 class="text-xl font-semibold mb-2">Lifestyle Factors</h3>
            <ul class="list-disc ml-8 text-gray-700 space-y-1">
                <li><strong>Alcohol Consumption:</strong> Measured in liters per capita per year, indicating the average annual intake.</li>
                <li><strong>Tobacco Usage:</strong> Percentage (%) of the population that uses tobacco.</li>
                <li><strong>Physical Inactivity:</strong> Percentage (%) representing those who fall below minimum physical activity recommendations.</li>
                <li><strong>UV Radiation:</strong> Is measure blablablablablablablablablablabla.</li>
            </ul>
        </section>

        <section class="mb-8">
            <h3 class="text-xl font-semibold mb-2 ">Cancer Types and ASR</h3>
            <ul class="list-disc ml-8 text-gray-700 space-y-2">
                <li><strong>ASR (Age-Standardized Rate):</strong> Per 100,000 individuals, standardizing rates across age-diverse populations.</li>
                
            </ul>
        </section>

        <section>
            <h3 class="text-xl font-semibold mb-2">Understanding Pearson Correlation</h3>
            <p class="text-gray-600">The Pearson Correlation Coefficient describes the relationship between lifestyle factors and cancer rates:</p>
            <ul class="list-disc ml-8 text-gray-700 space-y-2">
                <li><strong>Range:</strong> Values between -1 and 1 indicate negative, positive, or no correlation.</li>
                <li><strong>Interpretation:</strong> Positive correlation indicates that as one factor increases, so does another (e.g., smoking and lung cancer).</li>
                <li><strong>Limitations:</strong> Correlation does not imply causation; high correlation does not mean one factor causes the other.</li>
            </ul>
        </section>
    `;

    // Append title, description, and content to content container
    contentContainer.appendChild(title);
    contentContainer.appendChild(description);
    contentContainer.appendChild(helpContent);

    // Append content container to overlay
    overlay.appendChild(contentContainer);

    // Add overlay to the body
    document.body.appendChild(overlay);

    // Close overlay function
    function closeOverlay() {
        document.body.removeChild(overlay);
    }

    // Close overlay on Escape key or click outside content
    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) closeOverlay();
    });
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeOverlay();
    });
}
