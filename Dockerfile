FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the project
RUN npm run build

# Expose port for preview
EXPOSE 3000

# Run preview server
CMD ["npm", "run", "preview"]
