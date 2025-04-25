FROM python:3.11-slim

WORKDIR /app

# Optimize Python memory usage
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONOPTIMIZE=2

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose the API port
EXPOSE 8000

# Start the FastAPI application
CMD ["python", "run.py"] 