# RRR Artifact
---

## **Citation & Paper Reference**

This repository serves as the **artifact** for the following ICSE 2026 paper:

**Farideh Khalili, Satyajit Gokhale, Alexi Turcotte, Dale Xu, and Frank Tip. 2026. *Remediating Superfluous Superfluous Re-Rendering in React Applications*. In 2026 IEEE/ACM 48th International Conference on Software Engineering (ICSE ’26), April 12–18, 2026, Rio de Janeiro, Brazil. ACM, New York, NY, USA, 12 pages. https://doi.org/10.1145/3744916.3773235**

If you use this artifact in academic work, please cite the paper above.
---

This repository provides a self-contained environment for reproducing key elements of the RRR paper. This artifact includes:

1. [Ground Truth Data](#ground-truth-data)
2. [Analysis, Transformation, and Profiling Pipeline](#analysis-transformation-and-profiling-pipeline)
3. [Dataset Collection Pipeline](#dataset-collection-pipeline)

---

## Ground Truth Data

The [paper_results/](paper_results/) subdirectory includes all intermediary and final results used in the paper, enabling a reproduction check.

1. [paper_results/repo_lists/](paper_results/repo_lists/):  
    List of repositories achieved and used in each step of the dataset collection and analysis pipeline.

   1. [Complete_list.txt](paper_results/repo_lists/Complete_list.txt):  
      The entire list of 10,000 React repositories.
   2. [repositories_with_dbs.txt](paper_results/repo_lists/repositories_with_dbs.txt):  
      The list of 7,758 repositories with CodeQL databases.
   3. [manually_investigated.txt](paper_results/repo_lists/manually_investigated.txt):  
      The list of 40 repositories manually investigated for anti-patterns.
   4. [initial_subjects.txt](paper_results/repo_lists/initial_subjects.txt):  
      The list of 14 (out of 40) repositories used in evaluation.
   5. [repositories_with_downloaded_assets.txt](paper_results/repo_lists/repositories_with_downloaded_assets.txt):  
      The list of 75 repositories with ≥1 downloaded asset (real-world usage).
   6. [augmented_subjects.txt](paper_results/repo_lists/augmented_subjects.txt):  
      The list of 9 repositories (out of the 75) used in evaluation.
   7. [subject_repositories.txt](paper_results/repo_lists/subject_repositories.txt):  
      The list of all 23 repositories used in evaluation.
   8. [performance_analysis_subjects.txt](paper_results/repo_lists/performance_analysis_subjects.txt):  
      The list of the 3 scalable repositories used to evaluate the impact of RRR's transformations on time perfromance.

2. [paper_results/query_results/](paper_results/query_results/):  
   Reference query results.

   1. [paper_results/query_results/re_rendering/](paper_results/query_results/re_rendering/):  
      The results of running all the re_rendering CodeQL queries on all 23 subject repositories and [repositories_with_downloaded_assets.txt](paper_results/repo_lists/repositories_with_downloaded_assets.txt).

3. [paper_results/CSV_results/](paper_results/CSV_results/):

   1. [paper_results/CSV_results/unusedParentState/subcomponent-siblings/](paper_results/CSV_results/unusedParentState/subcomponent-siblings/):  
      The csv result files of running the sibling CodeQL query on the 2,047 repositories which returned non-empty results and were flagged for further analysis + the csv file result of running the query on the CodeQL databased of the 23 subject repositories.

   2. [paper_results/CSV_results/re_rendering/](paper_results/CSV_results/re_rendering/):  
      Consists of 23 subdirectories for each of the 23 subject repositories, containing csv files of running the re_rendering CodeQL queries on the CodeQL database of each of the subject repositories.

4. [paper_results/pattern_match_tables/](paper_results/pattern_match_tables/):

   1. [repositories_with_downloaded_assets.csv](paper_results/pattern_match_tables/repositories_with_downloaded_assets.csv):  
      A tabular overview of the number of occurrences of each anti-pattern in each of the repositories with non zero number of downloaded asset, based on the CodeQL queries developed.

   2. [subject_repositories.csv](paper_results/pattern_match_tables/subject_repositories.csv):  
      A tabular overview of the number of occurrences of each anti-pattern in each of the 23 subject repositories with non zero number of downloaded asset, based on the CodeQL queries developed.

5. [paper_results/performance_profiles/](paper_results/performance_profiles/):  
   We used the Chrome Developer Tools React Profiler tab to collect the total render times for the workflows we explored originally in RQ3 of the paper, taking the average over 10 runs. This directory includes profiling information as json files for 10 execution of each of the subject repositories, before and after the transformations are applied.

---

For reference versions of all 23 subject repositories for comparison you can visit the repositories in [https://github.com/orgs/RRR-benchmarks/repositories](https://github.com/orgs/RRR-benchmarks/repositories). These repositories include different versions of each subject repository in 4 branches:

1. **`before_transformation`:**
   Original project before any changes.

2. **`before_transformation_instrumented`:**  
   Original project instrumented with a counter for the number of re-rendering operations.

3. **`after_transformation`:**  
   Project after applying code refactoring transformations.

4. **`after_transformation_instrumented`:**
   Project after applying code refactoring transformations, and instrumentation with a counter for the number of re-rendering operations.

> **Note:** The **_after_transformation_** version of each of the 23 subject repositories, is provided as a reference for comparison after applying the [automated transformation](#refactoring-transformation) on the **_before_transformation_** version of each repository.

> **Note:** You can reproduce the results reported in Table 1 by running the scenarios described in the supplemental material for each subject repository in the **_before_transformation_instrumented_** and **_after_transformation_instrumented_** branches. To view the counter output, open the `Console` tab in the Chrome browser's `Developer Tools`.

---

You can also find the 3 repositories used for performance evaluation, as configured for our evaluation in: [https://github.com/orgs/RRR-benchmarks/repositories](https://github.com/orgs/RRR-benchmarks/repositories). These repositories have 6 branches: **`before_transformation_small`**,**`after_transformation_small`**, **`before_transformation_medium`**, **`after_transformation_medium`**, **`before_transformation_large`**,**`after_transformation_large`**.

---

## Getting Started

Run the following from the project root:

```bash
./run-docker.sh
```

This will start an interactive Docker container. Run all the commands from the container root.

> **Note1:** Due to containerization overhead and platform emulation, some steps may take a lot longer to run than on native machines.

> **Note2:** All outputs generated inside Docker are mirrored to the `docker_output/` directory enabling inspection and comparison.

---

### Running the Analysis on the subject repositories

```bash
cd /usr/src/app/codeql-development/analysis
python run_analysis.py
```

This script automates our analysis of all 23 subject repositories, cloning each repository, building a CodeQL database, running the _re_rendering_ queries on each database, and aggregating the detected anti-patterns into a single CSV file: [/codeql-development/pattern_match_tables/subject_repositories.csv](/codeql-development/pattern_match_tables/subject_repositories.csv). For a more detailed, step-by-step breakdown, please continue reading below.

You can also run the script with an argument:

```
python run_analysis.py --repo_list ../../paper_results/repo_lists/subject_repositories.txt
```

The default value for the `repo_list` argument is `../../paper_results/repo_lists/subject_repositories.txt`, you can replace this with any other list of repository URLs of your choosing.

---

## Analysis, Transformation, and Profiling Pipeline

---

### Clone Subject Repositories and Generate CodeQL Databases

```bash
cd /usr/src/app/codeql-development/analysis
python cache_dbs.py
```

Outputs will be available on host at:

```
docker_output/qldbs/
docker_output/case-studies/
```

You can also run the script with an argument:

```
python cache_dbs.py --repo_list ../../repo_lists/sample.txt
```

The default value for the `repo_list` argument is `../../repo_lists/sample.txt`, you can replace this with any other list of repository URLs of your choosing.

---

### Generate CodeQL Query Results

```bash
cd /usr/src/app/codeql-development/analysis
python run_queries.py
```

You can also run the script with an argument:

```
python run_queries.py --query_address ../query_running/queries/re_rendering
```

The default value for the `query_address` argument is `../query_running/queries/re_rendering`, you can replace this with any other directory of CodeQL queries of your choosing.

> **Note:** This step could take about 30-45 minutes to run on a single repository.

Outputs will be available on host at:

```
docker_output/CSV_results/
docker_output/query_results/
```

---

### Refactoring Transformation

```bash
cd /usr/src/app/transformation-source
npm install
npm run build

node dist/transformation-source.js \
  --project /usr/src/app/codeql-development/db_caching/case-studies/<projectName> \
  --transformations /usr/src/app/codeql-development/query_running/CSV_results/re_rendering/<projectName>
```

Transformed code is also synced to:

```
docker_output/case-studies/
```

---

### Using the Profiler

```bash
cd /usr/src/app/react-profiler-extension
npm install
npm run build
```

1. Open `chrome://extensions` in your Chrome browser.
2. Enable Developer Mode.
3. Click "Load unpacked" and select the `react-profiler-extension` folder.
4. Start the development server with either:

```bash
npm start
# or
npm run dev  # for some projects
```

5. Open the provided URL in your browser.
6. If the project has been instrumented with Re-rendering Counters, open DevTools → Console tab to observe the render metrics.

---

### Computing the Code Complexity

```bash
cd /usr/src/app/code-complexity
npm install
node index.js
```

> **Note:** This script needs that the subject repositories are already cloned([instruction](#clone-subject-repositories-and-generate-codeql-databases)).

> **Note:** For more detail you can check [/code-complexity/README.md](/code-complexity/README.md).

---

### Computing the performance of an execution

```bash
cd /usr/src/app/codeql-development/analysis
python get_duration_from_react_profile.py -d </path/to/performance/profiles/directory>
```

---

## Dataset Collection Pipeline

This pipeline covers the data preparation for both anti-pattern identification and the subsequent evaluation of our refactoring methodology. It reproduces every intermediate artifact—from initial repository sampling and CodeQL database construction to the selection of evaluation subjects—and exposes the scripts and queries needed to regenerate them. This is outlined in sections 4.1 and 6.1 of the paper.

1. **Dataset Collection** (Sec 4.1):

   - Randomly sampled [10,000 GitHub repositories](paper_results/repo_lists/Complete_list.txt) declaring React as a dependency.

2. **Database Construction** (Sec 4.1):

   - Attempted to build a CodeQL databases for all 10,000 repositories—[7,758](paper_results/repo_lists/repositories_with_dbs.txt) succeeded.
   - **Script:** [cache_dbs.py](codeql-development/analysis/cache_dbs.py)

     - Script usage [instruction](#clone-subject-repositories-and-generate-codeql-databases)

3. **Sibling-Component Query** (Sec 4.1):

   - **Purpose:** Detect React components where at least one child does _not_ reference all of its parent’s state via static analysis—indicative of potential needless re-rendering.
   - **Input**: All 7,758 CodeQL databases.
   - **Query:** [subcomponent-siblings.ql](codeql-development/query_running/queries/unusedParentState/subcomponent-siblings.ql)
   - **Output:** 2,047 repositories returned non-empty results and were flagged for further analysis([paper_results/CSV_results/unusedParentState/subcomponent-siblings/](paper_results/CSV_results/unusedParentState/subcomponent-siblings/)).

4. **Manual Sampling & Filtering** (Sec 4.1):

   - **Input:** The list of 2,047 repositories flagged by the sibling component query.
   - **Filtering process:**

     - Iteratively sampled from the list, for each sample, if any of the following filters applied it was discarded immediately; those passing all checks were retained. Sampling continued until no new antipatterns emerged
       1. Repository is deleted from GitHub by the time for this step of the analysis
       2. There is a Build/install failure
       3. There is an execution or interaction failure
       4. There is no visual sign of needless re-rendering (Profiler draws a red box around a component when it re-renders—if the box appears but the component’s appearance doesn’t change, it’s redundant)
       5. There is excessive code complexity
       6. The code relies on external libraries
     - **Note:** Conditions 5 and 6 were in place because tangled code or deep external dependencies would require major structural refactoring—undermining our ultimate goal of generalizable, automated transformations.

   - **Output:** This process yielded [40 candidate repositories](paper_results/repo_lists/manually_investigated.txt). We were able to find and fix re-rendering issues in [14](paper_results/repo_lists/initial_subjects.txt) of them which was later used for evaluations as well.

5. **Evaluation Subject Repository Augmentation** (Sec 6.1):

   - **Purpose:** Enrich our list of subject repositories with real-world React applications.
   - **Step1:** Collect a list of repositories with at least one downloaded asset—an indicator of end-user adoption.

     - **Input:** The entire list of 10,000 React repositories.
     - **Script:** [get_downloaded_repositories.py](codeql-development/analysis/get_downloaded_repositories.py).

       ```bash
       cd /usr/src/app/codeql-development/analysis
       python get_downloaded_repositories.py
       ```

       The list will be available on host at:

       ```
       docker_output/repo_lists/repositories_with_downloaded_assets.txt
       ```

       > **Note:** This script requires the Github token to be stored inside the _**GITHUB_TOKEN**_ environment variable.

     - **Output:** [repositories_with_downloaded_assets.txt](paper_results/repo_lists/repositories_with_downloaded_assets.txt)

   - **Step 2:** Prune the list to only include the repositories with an indication of an anti-pattern based on the CodeQL queries.

     - **Input:** The list of 75 repositories with at least 1 downloaded asset.
     - **CodeQL queries:** After manually investigating and fixing redundant re-rendering in the list of 14 subject repositories, we identified 5 anti-patterns. For each anti-pattern described in Section 4, we devised a codeQL query to identify the emergence of that anti-pattern.

       | Anti-Pattern                                               | Queries                                                                                                                                                                                                                                                                        |
       | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
       | Controlled Component(Sec 4.2)                              | [find-attr-to-make-ref.ql](codeql-development/query_running/queries/re_rendering/find-attr-to-make-ref.ql)                                                                                                                                                                     |
       | State Variables not Affecting the UI(Sec 4.3 )             | [find-state-with-no-props.ql](codeql-development/query_running/queries/re_rendering/find-state-with-no-props.ql)                                                                                                                                                               |
       | Propless Child Component(Sec 4.4 )                         | [find-components-no-props.ql](codeql-development/query_running/queries/re_rendering/find-components-no-props.ql)                                                                                                                                                               |
       | Child Component with Object or Array Element Prop(Sec 4.5) | [find-component-uses-object-or-array-state.ql](codeql-development/query_running/queries/re_rendering/find-component-uses-object-or-array-state.ql)                                                                                                                             |
       | Child Component receiving Function Prop(Sec 4.6)           | [find-component-where-function-passed.ql](codeql-development/query_running/queries/re_rendering/find-component-where-function-passed.ql), [find-component-where-setter-passed.ql](codeql-development/query_running/queries/re_rendering/find-component-where-setter-passed.ql) |

     - **Result collection script:** [pattern_match_table_generator.py](codeql-development/analysis/pattern_match_table_generator.py)

     ```bash
     cd /usr/src/app/codeql-development/analysis
     python pattern_match_table_generator.py
     ```

     You can also run the script with an argument:

     ```
     python pattern_match_table_generator.py --repo_list ../../repo_lists/sample.txt
     ```

     The default value for the `repo_list` argument is `../../repo_lists/sample.txt`, you can replace this with any other list of repository URLs of your choosing.

     The resulting table will be available on host at:

     ```
     docker_output/pattern_match_tables/<repo_list file name>.csv
     ```

     - **Output:** [repositories_with_downloaded_assets.csv](paper_results/pattern_match_tables/repositories_with_downloaded_assets.csv)

   - **Step 3:** Keep the repositories we could 1. build, and install successfully, 2. run locally, and 3. did not use class components.
     - **Output:** [augmented_subjects.txt](paper_results/repo_lists/augmented_subjects.txt)

---

---

This artifact is publicly accessible, self-contained, and supports full reproduction of the paper’s results. It includes all code, scripts, and pipelines necessary to regenerate the datasets, conduct the static analysis, apply the code transformations, and profile performance in a Dockerized environment. While not all intermediate data is bundled, the provided infrastructure enables end-to-end reproduction and extension. The analysis and transformation workflows are configurable—supporting alternative repository lists and queries—which facilitates reuse in other contexts. Reference versions of all subject repositories before and after transformation are also available in a public GitHub organization, enabling direct inspection and comparison.

---
