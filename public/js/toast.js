// toast.js
export function showToast(message, duration = 3000) {
    // Create the toast container if it doesn't exist
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.style.position = 'fixed';
        toastContainer.style.top = '10%';
        toastContainer.style.left = '50%';
        toastContainer.style.transform = 'translate(-50%, -50%)'; // Centering
        toastContainer.style.zIndex = '1000';
        document.body.appendChild(toastContainer);
    }
    

    // Create the toast element
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.style.backgroundColor = '#333';
    toast.style.color = '#fff';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.marginTop = '10px';
    toast.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.3)';
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';

    // Set the message
    toast.innerText = message;

    // Append the toast to the container
    toastContainer.appendChild(toast);

    // Show the toast
    setTimeout(() => {
        toast.style.opacity = '1';
    }, 10);

    // Hide the toast after the specified duration
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300);
    }, duration);
}
