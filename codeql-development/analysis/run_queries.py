import os
import glob
import threading
import subprocess
import argparse
from concurrent.futures import ThreadPoolExecutor
from tqdm import tqdm  # added

# Global variable for number of threads
NUM_THREADS = 1

def run_command(commands, timeout=None):
    for command in commands.split(";"):
        try:
            process = subprocess.run(command.split(), stdout=subprocess.PIPE, stdin=subprocess.PIPE, stderr=subprocess.PIPE, timeout=timeout)
        except subprocess.TimeoutExpired:
            error_string = "TIMEOUT ERROR: for user-specified timeout " + str(timeout) + " seconds"
            error = "TIMEOUT ERROR"
            return (error.encode('utf-8'), error_string.encode('utf-8'), 1)  # non-zero return code
    return (process.stderr, process.stdout, process.returncode)

# Function to execute a command
def execute_command(command):
    error, output, retcode = run_command(command)
    print(error.decode('utf-8'))

# Main function
def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--query_address", default="../query_running/queries/re_rendering")
    args = parser.parse_args()

    query_address = args.query_address
    db_address = "../db_caching/qldbs"

    # Get the list of all .ql files in the query_address
    queries = glob.glob(os.path.join(query_address, "*.ql"))

    # Get the list of all immediate subdirectories in the db_address
    dbs = [d for d in os.listdir(db_address) if os.path.isdir(os.path.join(db_address, d))]

    # Create the list of commands
    commands = [f"./run_query.sh {os.path.basename(query)} {db} {query_address}" for query in queries for db in dbs]

    # Wrap executor.map with tqdm for progress bar
    with ThreadPoolExecutor(max_workers=NUM_THREADS) as executor:
        list(tqdm(executor.map(execute_command, commands), total=len(commands), desc="Running queries"))

if __name__ == "__main__":
    main()
