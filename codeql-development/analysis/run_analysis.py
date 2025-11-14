#!/usr/bin/env python3
import argparse
import subprocess
import sys

def run_script(script: str, args: list) -> None:
    """
    Run another Python script with the same interpreter. Exit on failure.
    """
    try:
        subprocess.run([sys.executable, script] + args, check=True)
    except subprocess.CalledProcessError as e:
        print(f"Error: `{script}` failed with return code {e.returncode}", file=sys.stderr)
        sys.exit(e.returncode)


def get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Orchestrate caching DBs, running queries, and generating pattern match tables."
    )
    parser.add_argument(
        "--repo_list",
        type=str,
        default="../../paper_results/repo_lists/subject_repositories.txt",
        help="Path to the .txt file listing GitHub repo URLs"
    )
    return parser.parse_args()


def main() -> None:
    args = get_args()
    repo_list = args.repo_list

    print("Step 1: Caching databases...")
    run_script("cache_dbs.py", ["--repo_list", repo_list])

    print("Step 2: Running queries...")
    run_script("run_queries.py", [])

    print("Step 3: Generating pattern match tables...")
    run_script("pattern_match_table_generator.py", ["--repo_list", repo_list])


if __name__ == "__main__":
    main()
