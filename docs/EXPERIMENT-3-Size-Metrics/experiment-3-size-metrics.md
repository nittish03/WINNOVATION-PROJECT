# EXPERIMENT – 3

## AIM
To Evaluate Size Metrics for Student Learning Management System (SLMS).

---

## REQUIREMENTS

### HARDWARE
- Intel Core i5 Processor or above
- 8 GB RAM
- 512 GB SSD

### SOFTWARE
- Windows / Mac / Linux Operating System
- Source Code Editor (VS Code or similar)
- Source Monitor Tool (SourceMonitor or equivalent)
- Web Browser
- Source Code of Student Learning Management System (SLMS)

---

## THEORY

Size-oriented metrics are quantitative measures used to determine the size and complexity of a software system. These metrics are based on the physical size of the software and are generally expressed in terms of **Lines of Code (LOC)**, **number of modules**, **number of functions**, and **file count**.

Size metrics are important because they help in:
- Estimating development effort
- Predicting maintenance cost
- Measuring productivity
- Identifying complex or high-risk modules

Although size metrics may depend on programming language and coding style, they are widely used due to their simplicity and ease of measurement.

In this experiment, the size metrics of the **Student Learning Management System (SLMS)** are evaluated. The SLMS is a full-stack web-based application (Next.js 15, React 18, Prisma, MongoDB) that includes the following **10 functional modules**:

| # | Module Name |
|---|-------------|
| 1 | User Authentication Module |
| 2 | Course Management Module |
| 3 | Enrollment Module |
| 4 | Assignment and Grading Module |
| 5 | Discussion Forum Module |
| 6 | Dashboard Module |
| 7 | Google Drive Utility Module |
| 8 | Text Management Module |
| 9 | QR Code Generator Module |
| 10 | Text Utilities Module |

Each module contributes to the total size of the system. The following size metrics are evaluated:

- **Lines of Code (LOC):** Total number of lines in source files (excluding `node_modules` and `.next`). Comment and blank lines are included in total line count; effective LOC can be derived using tools like SourceMonitor.
- **Number of Modules:** Total functional modules (10) as listed above.
- **Number of Functions/Methods:** Total number of exported request handlers (GET/POST/PUT/DELETE), React components, and exported utility functions.
- **File Count:** Total number of source files (`.js`, `.jsx`, `.ts`, `.tsx`, `.css`) in `app`, `components`, `lib`, `context`, `prisma`, and `utils` directories.
- **Cyclomatic Complexity:** When a tool is used, it measures logical complexity and identifies modules with higher complexity. In this report, relative complexity is inferred from LOC and function count per module.

---

## PROCEDURE

1. **Collect the complete source code** of the SLMS project from the repository (directories: `app`, `components`, `lib`, `context`, `prisma`, `utils`).
2. **Identify and separate the system into the 10 functional modules** as per the theory.
3. **Use manual counting and line-count tools** (e.g. `wc -l`, VS Code, or SourceMonitor) to calculate:
   - Total Lines of Code (LOC)
   - Number of functions (exported handlers and component/utility functions)
   - Number of modules (10)
   - Total number of source files
4. **Record the calculated values** in the observation table below.
5. **Analyse** which module has the highest size and complexity using LOC per module and, if available, cyclomatic complexity from SourceMonitor.

---

## OBSERVATION

### Metrics Summary Table

| Metric | Value |
|--------|--------|
| **Total LOC** | 16,101 |
| **Total Modules** | 10 |
| **Total Functions** | 186 |
| **Total Files** | 94 |
| **Average LOC per Module** | 995 |
| **Highest Complexity Module** | Assignment and Grading Module |

### Metrics Summary For Checkpoint 'Baseline' (Parameter | Value)

| Parameter | Value |
|-----------|--------|
| Project Directory | SLMS (app, components, lib, context, prisma, utils) |
| Project Name | Student Learning Management System (SLMS) |
| Checkpoint Name | Baseline |
| Files | 94 |
| Lines | 16,101 |
| Total Modules | 10 |
| Total Functions | 186 |
| Average LOC per Module | 995 |
| Highest Complexity Module | Assignment and Grading Module |

### Module-wise LOC (for Histogram and Kiviat Graph)

| Module Name | LOC | File Count | Functions (approx) |
|-------------|-----|------------|---------------------|
| 1. User Authentication | 898 | 6 | 12 |
| 2. Course Management | 1,763 | 10 | 18 |
| 3. Enrollment | 661 | 4 | 8 |
| 4. Assignment and Grading | 2,623 | 15 | 32 |
| 5. Discussion Forum | 696 | 6 | 12 |
| 6. Dashboard | 388 | 3 | 5 |
| 7. Google Drive Utility | 1,822 | 5 | 22 |
| 8. Text Management | 982 | 4 | 14 |
| 9. QR Code Generator | 193 | 1 | 2 |
| 10. Text Utilities | 306 | 1 | 4 |
| **Shared / Infrastructure** | 6,154 | 39 | 61 |

*Note: Shared/Infrastructure includes layout, Navbar, Footer, UI components, profile, skills, user-skills, admin users/skills/analytics, lib, context, prisma seed, and utils. Total LOC = 9,947 (10 modules) + 6,154 (shared) = 16,101.*

### Diagrams and Graphs

- **Fig. 1 – Histogram of LOC per Module:** Open `histogram-loc-per-module.html` in a web browser. It shows the distribution of Lines of Code across the 10 functional modules (similar to a Monte Carlo–style histogram for metric distribution).
- **Fig. 2 – Kiviat (Radar) Graph of Size Metrics per Module:** Open `kiviat-metrics-graph.html` in a web browser. It compares the 10 modules on normalized axes: LOC, File Count, and Number of Functions (similar to the Kiviat Metrics Graph for project 'SLMS', Checkpoint 'Baseline').

---

## RESULT

The size metrics of the **Student Learning Management System (SLMS)** were successfully evaluated using size-oriented measures:

- **Total LOC:** 16,101 lines across 94 source files.
- **Total Modules:** 10 functional modules as specified.
- **Total Functions:** 186 (API request handlers, React components, and exported utilities).
- **Average LOC per Module:** 995 lines (considering only the 10 functional modules’ dedicated code).
- **Highest Complexity Module:** The **Assignment and Grading Module** has the highest size (2,623 LOC) and the largest number of related files and functions, indicating the greatest structural and functional complexity. The **Google Drive Utility Module** (1,822 LOC) is the second largest and also exhibits high complexity due to chunked upload, folder management, and password protection.

These metrics help in understanding the overall size, complexity, and structural distribution of the SLMS and can be used for effort estimation, maintenance planning, and identifying refactoring or testing priorities.
