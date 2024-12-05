# Use the official Node.js 18 image
FROM --platform=linux/amd64 node:20

# Set working directory in the container
WORKDIR /usr/src

# Copy package.json and package-lock.json
COPY package*.json ./

# Install Node.js dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port 3000 (or whichever port your app will use)
EXPOSE 3000

# Start the application (replace with your actual start script if necessary)
CMD ["node", "server.js"]
