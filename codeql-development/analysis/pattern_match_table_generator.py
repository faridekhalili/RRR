import os
import csv
import argparse

def get_database_names_from_repo_list(repo_list_path):
    """Extracts repository names from a list of GitHub URLs."""
    database_names = []
    with open(repo_list_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#'):
                repo_name = line.rstrip('/').split('/')[-1]
                database_names.append(repo_name)
    return database_names

def count_csv_rows(csv_file):
    """Counts the number of data rows in a CSV file (excluding the header)."""
    if os.path.isfile(csv_file):
        with open(csv_file, 'r', newline='', encoding='utf-8') as f:
            reader = csv.reader(f)
            num_rows = sum(1 for _ in reader) - 1
        return max(num_rows, 0)
    return 0

def collect_database_data(pattern_query_dirs, database_names, base_dir):
    """Collects the number of matches for each database and pattern."""
    data_rows = []
    for db_name in database_names:
        row = [db_name]
        counts = []
        for pattern, query_dirs in pattern_query_dirs.items():
            if isinstance(query_dirs, list):
                # sum counts from both subdirectories for p5
                num_rows = sum(
                    count_csv_rows(os.path.join(base_dir, qd, f"{db_name}.csv"))
                    for qd in query_dirs
                )
            else:
                num_rows = count_csv_rows(os.path.join(base_dir, query_dirs, f"{db_name}.csv"))
            counts.append(num_rows)
            row.append(str(num_rows))
        # temporarily append total for sorting
        row.append(sum(counts))
        data_rows.append(row)
    # sort by total descending and remove the total column
    data_rows.sort(key=lambda r: r[-1], reverse=True)
    for row in data_rows:
        row.pop()
    return data_rows

def write_csv(header, data_rows, output_file):
    """Writes the collected data into a CSV file."""
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(data_rows)

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--repo_list", 
        default="../../repo_lists/sample.txt",
        help="Path to the .txt file listing GitHub repo URLs"
    )
    args = parser.parse_args()

    pattern_query_dirs = {
        'p1': 'find-attr-to-make-ref',
        'p2': 'find-state-with-no-props',
        'p3': 'find-components-no-props',
        'p4': 'find-component-uses-object-or-array-state',
        'p5': [
            'find-component-where-function-passed',
            'find-component-where-setter-passed'
        ],
    }

    base_dir = '../../paper_results/query_results/re_rendering'
    repo_list_path = args.repo_list
    repo_list_name = os.path.splitext(os.path.basename(repo_list_path))[0]
    output_file = f"../pattern_match_tables/{repo_list_name}.csv"

    database_names = get_database_names_from_repo_list(repo_list_path)
    header = ['Database'] + list(pattern_query_dirs.keys())
    data_rows = collect_database_data(pattern_query_dirs, database_names, base_dir)
    write_csv(header, data_rows, output_file)

if __name__ == '__main__':
    main()
