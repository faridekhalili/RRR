import os
import time
import requests
from urllib.parse import urlparse

def get_github_token():
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        return token

def get_total_downloads(repo_url, headers):
    parsed = urlparse(repo_url)
    parts = parsed.path.strip("/").split("/")
    if len(parts) != 2:
        return 0
    owner, repo = parts
    api_url = f"https://api.github.com/repos/{owner}/{repo}/releases"
    resp = requests.get(api_url, headers=headers)
    if resp.status_code != 200:
        print(f"Warning: {repo_url} → HTTP {resp.status_code}")
        return 0
    releases = resp.json()
    total = 0
    for release in releases:
        for asset in release.get("assets", []):
            total += asset.get("download_count", 0)
    return total

def main():
    token = get_github_token()
    headers = {"Authorization": f"token {token}"}

    input_file = "../../paper_results/repo_lists/Complete_list.txt"
    output_file = "../../repo_lists/repositories_with_downloaded_assets.txt"

    # Read GitHub URLs
    with open(input_file) as f:
        urls = [line.strip() for line in f if line.strip()]

    # Write only URLs with downloads > 0
    with open(output_file, "w") as out:
        for url in urls:
            print(f"Checking {url}...")
            total = get_total_downloads(url, headers)
            if total > 0:
                out.write(url + "\n")
            time.sleep(1)  # avoid hitting rate limits

    print(f"Done. Filtered URLs written to {output_file}")

if __name__ == "__main__":
    main()
