FROM node:alpine

# Copy pre-built files
COPY ./build /app

WORKDIR /app

# Expose the frontend port
EXPOSE 3000

# Start the application with a simple static server
CMD ["npx", "serve", "-s", ".", "-l", "3000"] 