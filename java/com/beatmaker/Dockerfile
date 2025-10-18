# Use official Node.js image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first (for caching dependencies)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your project files
COPY . .

# Expose port (change if your app runs on another)
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
