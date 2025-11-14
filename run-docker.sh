#!/usr/bin/env bash
set -euo pipefail

IMAGE=rrr-container
OUT=$(pwd)/docker_output

# -------- 0. prepare host folders -------------
mkdir -p "$OUT"/{case-studies,qldbs,query_results,CSV_results,pattern_match_tables,react-profiler-extension,repo_lists,code-complexity/results}
cp -R react-profiler-extension/. "$OUT/react-profiler-extension"/
cp -R "$(pwd)/repo_lists/." "$OUT/repo_lists"/

# -------- 1. build (prefer buildx, else regular build) -------------
if docker buildx version >/dev/null 2>&1; then
  # buildx present → we can always request linux/amd64
  docker buildx build --platform linux/amd64 --no-cache -t "$IMAGE" . --load
else
  echo "[WARN] docker buildx not found – falling back to plain 'docker build'."
  echo "       If you are on Apple Silicon, please upgrade Docker Desktop ≥ 4.3."
  docker build --pull --no-cache -t "$IMAGE" .
fi

# -------- 2. decide whether 'docker run --platform' is supported -------------
if docker run --help 2>&1 | grep -q -- '--platform'; then
  PLATFORM_OPT="--platform linux/amd64"
else
  PLATFORM_OPT=""
  echo "[WARN] Your Docker version does not understand '--platform'."
  echo "       The container will run with the host architecture."
  echo "       On non-x86 hosts this may crash CodeQL; please upgrade Docker."
fi

# -------- 3. run the container -------------
docker run --rm -it \
  -e GITHUB_TOKEN="$GITHUB_TOKEN" \
  $PLATFORM_OPT \
  --mount type=bind,source="$OUT/case-studies",target=/usr/src/app/codeql-development/db_caching/case-studies \
  --mount type=bind,source="$OUT/qldbs",target=/usr/src/app/codeql-development/db_caching/qldbs \
  --mount type=bind,source="$OUT/query_results",target=/usr/src/app/codeql-development/query_running/query_results \
  --mount type=bind,source="$OUT/CSV_results",target=/usr/src/app/codeql-development/query_running/CSV_results \
  --mount type=bind,source="$OUT/pattern_match_tables",target=/usr/src/app/codeql-development/pattern_match_tables \
  --mount type=bind,source="$OUT/react-profiler-extension",target=/usr/src/app/react-profiler-extension \
  --mount type=bind,source="$OUT/repo_lists",target=/usr/src/app/repo_lists \
  --mount type=bind,source="$OUT/code-complexity/results",target=/usr/src/app/code-complexity/results \
  "$IMAGE"
