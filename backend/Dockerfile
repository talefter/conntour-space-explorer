FROM python:3.11-slim

# Install uv (modern Python package installer)
RUN pip install --no-cache-dir uv

WORKDIR /app

# Copy requirements and install with uv (fallback to pip)
COPY requirements.txt .
RUN uv pip install --system --no-cache -r requirements.txt || pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

# Verify Python version meets requirements (3.8+)
RUN python --version

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000", "--reload"]