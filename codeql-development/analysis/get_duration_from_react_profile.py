import sys
import os
import argparse

def get_duration_from_profile(file_path):
    try:
        with open(file_path, 'r') as file:
            content = file.read()
            # it's a JSON, so we can parse it
            import json
            data = json.loads(content)
            # iterate over data["dataForRoots"]["commitData"], add up durations
            total_duration = 0
            for commit in data.get("dataForRoots", {})[0].get("commitData", []):
                duration = commit.get("duration", 0)
                total_duration += duration
            # round to 2 decimal places
            total_duration = round(total_duration, 2)
            return total_duration
    except FileNotFoundError:
        print(f"Error: File '{file_path}' not found.")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Process React profile data.")
    parser.add_argument("-f", "--file", help="Path to the React profile file")
    parser.add_argument("-d", "--dir", help="Path to a directory containing React profile files")
    args = parser.parse_args()

    durations = []

    if args.file:
        durations.append(get_duration_from_profile(args.file))
        print(durations[0])
    elif args.dir:
        if not os.path.isdir(args.dir):
            print(f"Error: Directory '{args.dir}' does not exist.")
        else:
            for file_name in os.listdir(args.dir):
                file_path = os.path.join(args.dir, file_name)
                if os.path.isfile(file_path):
                    print(f"Processing file: {file_path}")
                    durations.append(get_duration_from_profile(file_path))
            # print tab separated durations
            print("\t".join(map(str, durations)))
    else:
        print("Usage: python get_duration_from_react_profile.py -f <file_path> or -d <dir_path>")
