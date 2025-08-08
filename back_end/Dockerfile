# back_end/Dockerfile
FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app

# system deps (add extras here if you need to compile wheels)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
 && rm -rf /var/lib/apt/lists/*

# copy only requirements first (layer caching)
COPY requirements.txt /app/requirements.txt

# upgrade pip and install deps (include gunicorn if not in requirements)
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r /app/requirements.txt
RUN pip install --no-cache-dir gunicorn

# Copy only the folders we need into the image.
# This keeps the image minimal and avoids copying things outside the build context.
COPY back_end /app/back_end
COPY agents /app/agents

EXPOSE 5000

# Run using package import path so Python can import back_end
CMD ["gunicorn", "back_end.app:app", "--bind", "0.0.0.0:5000", "--workers=2", "--threads=4"]
