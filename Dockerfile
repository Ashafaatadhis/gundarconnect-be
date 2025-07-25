# Gunakan image Node.js LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy file yang dibutuhkan
COPY package*.json ./
COPY . .

# Install dependencies
RUN npm install

# Expose port
EXPOSE 5222

# Jalankan aplikasi
CMD ["npm", "start"]
