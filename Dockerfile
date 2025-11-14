# Dockerfile
FROM python:3.13-rc AS base

# -- Install system dependencies --
RUN apt-get update && apt-get install -y \
    curl unzip git ca-certificates gnupg \
    libglib2.0-0 libstdc++6 libnss3 libx11-6 \
    nodejs npm \
    vim \
    && npm install -g npm@10.7.0 \
    && rm -rf /var/lib/apt/lists/*

# -- Install CodeQL bundle v2.21.3 --
RUN mkdir -p /opt \
    && curl -sSL \
    https://github.com/github/codeql-action/releases/download/codeql-bundle-v2.21.3/codeql-bundle-linux64.tar.gz \
    | tar -xz -C /opt
ENV PATH="/opt/codeql:$PATH"

# -- Set working directory --
WORKDIR /usr/src/app

# -- Copy project files --
COPY . .

# -- Install Python dependencies --
RUN pip install --no-cache-dir gitpython pandas requests tqdm

# -- Pre-install CodeQL packs --
WORKDIR /usr/src/app/codeql-development/query_running/queries
RUN /opt/codeql/codeql pack install \
    && codeql resolve qlpacks \
    && codeql resolve languages

# -- Return to main workdir --
WORKDIR /usr/src/app
CMD ["/bin/bash"]
