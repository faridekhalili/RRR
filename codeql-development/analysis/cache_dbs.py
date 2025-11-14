#!/usr/bin/env python3

import argparse
from typing import Tuple, List, Dict
import git
import subprocess
import os
import time
import json
import requests
import glob
import shutil
import zipfile
from tqdm import tqdm  # added for progress bar

REPOSITORIES_DIR = "../db_caching/case-studies"
DB_TGT_DIR = "../db_caching/qldbs"

def copy_content_and_cleanup(dir: str, zip_file_path: str, extracted_subdir_name: str) -> None:
    shutil.copytree(f"{dir}{extracted_subdir_name}", dir, dirs_exist_ok=True)
    os.remove(zip_file_path)
    shutil.rmtree(f"{dir}{extracted_subdir_name}")

def extract_dbs_from_github() -> None:
    subdirectories = glob.glob(f"{DB_TGT_DIR}/*/")
    for dir in subdirectories:
        repo_name = dir.split("/")[-2]
        zip_files = [file for file in os.listdir(dir) if file == f"{repo_name}.zip"]
        if len(zip_files):
            zip_file_path = f"{dir}{zip_files[0]}"
            try:
                with zipfile.ZipFile(zip_file_path, 'r') as zip_ref:
                    # Extract all the contents of the ZIP file to the specified folder
                    zip_ref.extractall(dir)
                    try:
                        copy_content_and_cleanup(dir, zip_file_path, "codeql_db/")
                    except Exception as e:
                        try:
                            copy_content_and_cleanup(dir, zip_file_path, "javascript/")
                        except Exception as e:
                            print(e)
            except Exception as e:
                print(e)
    for dir in subdirectories:
        db_javascript_subdirs = [file for file in os.listdir(dir) if file == "db-javascript"]
        if not len(db_javascript_subdirs):
            try:
                shutil.rmtree(dir)
            except Exception as e:
                print(e)

def report_time_consumption(proj_name: str, difference: int, report_dir: str) -> None:
    report = f"{proj_name}: "
    report += "QL DB built by the code."
    report += " (" + str(difference) + " seconds" + ")\n"
    with open(report_dir, 'a') as f:
        f.write(report)

def remove_repo(proj_name: str) -> None:
    path = os.path.join(REPOSITORIES_DIR, proj_name)
    if os.path.exists(path):
        shutil.rmtree(path)

def clone_repo(repo_url: str) -> None:
    try:
        git.Git(REPOSITORIES_DIR).clone(repo_url)
    except git.exc.GitCommandError as e:
        print(f"{repo_url} is already cloned.")

def cache_db(repo_url: str, proj_name: str) -> None:

    # If the db is not on Github, the repository is cloned
    clone_repo(repo_url)

    # Then the db is created locally using the code
    subprocess.call(['sh', './make-database.sh', proj_name])

    # Cleaning up the cloned code when no longer needed
    # remove_repo(proj_name)

def cache_dbs(repo_list: List[str], report_dir: str) -> None:

    # Open the report file
    file = open(report_dir, 'a')
    for repo_url in tqdm(repo_list, desc="Processing Repositories"):
        proj_name = repo_url.split("/")[-1]

        # Skip if the DB already exists.
        if not os.path.isdir(os.path.join(DB_TGT_DIR, proj_name)):
            start = time.time()
            cache_db(repo_url, proj_name)
            end = time.time()

            # Captures how long it's taken for this specific\
            # repository DB to be created.
            difference = int(end - start)

            # log how much it takes for each db to be created.
            report_time_consumption(proj_name, difference, report_dir)
            
    file.close()
        
def get_repo_list(repo_list_path: str) -> List[str]:
    repo_list = []
    # opening the data file
    file = open(repo_list_path)

    # reading the file as a list line by line
    content = file.readlines()

    # closing the file
    file.close()

    # Removing the extra newlines at the end of each repo link.
    for repo_url in content:
        repo_url = repo_url.replace("\n", "")
        repo_list.append(repo_url)

    return repo_list

def get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description='This script reads a list of repositories and makes QL databases for them.')
    parser.add_argument("--repo_list", type=str, default="../../repo_lists/sample.txt")
    args = parser.parse_args()

    return args

def make_directories() -> None:
    if not os.path.exists(REPOSITORIES_DIR):
        os.makedirs(REPOSITORIES_DIR)
    if not os.path.exists(DB_TGT_DIR):
        os.makedirs(DB_TGT_DIR)

def main() -> None:

    make_directories()

    # --repo_list should be provided as an argument
    args = get_args()

    # The default value is ../../repo_lists/sample.txt
    repo_list = args.repo_list
    filename = repo_list.split("/")[-1].split(".")[0]

    report_dir = f"../db_caching/{filename}_time_consumption_report.txt"
    # Extracting the list of repositories.
    repo_list = get_repo_list(repo_list)

    # 1. Each repository will be cloned in the REPOSITORIES_DIR
    # 2. The make-database.sh will be used to make the DBs
    # 3. The DBs will be stored in DB_TGT_DIR
    # 4. The repositories will be cleaned from REPOSITORIES_DIR
    for i in range(5):
        cache_dbs(repo_list, report_dir)
        extract_dbs_from_github()

if __name__ == "__main__":
    main()
