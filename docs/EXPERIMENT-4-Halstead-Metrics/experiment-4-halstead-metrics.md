# EXPERIMENT – 4

## AIM
To Evaluate Halstead Software Metrics for Student Learning Management System (SLMS).

---

## REQUIREMENTS

### HARDWARE
- Intel Core i3 Processor or above
- 4 GB RAM or above
- 256 GB SSD

### SOFTWARE
- Source Monitor Tool (or equivalent)
- Any IDE or Source Code Editor (VS Code or similar)
- Web Browser
- Source Code of Student Learning Management System (SLMS)

---

## THEORY

Halstead Software Metrics are a set of software measures proposed by Maurice Halstead to evaluate the complexity and maintainability of a software system. These metrics are based on counting the number of **operators** and **operands** in a program and are used to estimate the effort required to develop and maintain the software.

Halstead metrics provide a quantitative method for measuring software complexity and help in understanding **program difficulty**, **programming effort**, and **development time**.

In this experiment, Halstead Software Metrics are evaluated for the **Student Learning Management System (SLMS)**. The SLMS is a web-based application consisting of multiple modules such as authentication, course management, enrollment, assignments, discussion forum, and utilities.

### Halstead Parameters
- **n1** = Number of distinct operators  
- **n2** = Number of distinct operands  
- **N1** = Total number of operators  
- **N2** = Total number of operands  

### Basic Formulas

| Metric | Formula |
|--------|---------|
| Program Vocabulary | n = n1 + n2 |
| Program Length | N = N1 + N2 |
| Program Volume | V = N × log₂(n) |
| Program Difficulty | D = (n1 / 2) × (N2 / n2) |
| Program Effort | E = D × V |
| Program Level | L = 1 / D |
| Estimated Programming Time | T = E / 18 seconds |
| Estimated Number of Bugs | B = V / 3000 |

### Metric Interpretation
- **Vocabulary (n):** Total number of unique operators and operands.
- **Length (N):** Total number of operator and operand occurrences.
- **Volume (V):** Information content of the program.
- **Difficulty (D):** How difficult the program is to understand and implement.
- **Effort (E):** Effort required to develop the program.
- **Time (T):** Estimated programming time (seconds).
- **Bugs (B):** Estimated number of errors in the program.

---

## PROCEDURE

1. **Select a module or source file** from the SLMS → Selected: **User Authentication Module** (Register API route).
2. **Identify all operators** (arithmetic, logical, relational, assignment, control statements, function calls, brackets, etc.).
3. **Identify all operands** (variable names, constants, function names, object names).
4. **Count** n1, n2, N1, N2.
5. **Calculate** Vocabulary (n), Length (N), Volume (V), Difficulty (D), Effort (E), Level (L), Time (T), Bugs (B).
6. **Record** the values in tabular form.

---

## OBSERVATIONS

### Selected Module
**User Authentication Module** — Register API route  
**File:** `app/api/auth/register/route.ts`

### Lines of Code
**70** (total lines in the selected file)

---

### Operators Table

| Operator | Description | Occurrence |
|----------|-------------|------------|
| = | Assignment | 7 |
| . | Member access (dot) | 14 |
| ( | Opening parenthesis (call/group) | 18 |
| ) | Closing parenthesis | 18 |
| { | Opening brace | 18 |
| } | Closing brace | 18 |
| , | Comma (separator) | 20 |
| ; | Semicolon | 16 |
| : | Colon (object key-value) | 18 |
| ! | Logical NOT | 4 |
| \|\| | Logical OR | 2 |
| await | Async wait | 5 |
| return | Return statement | 4 |
| if | Conditional | 2 |
| new | Constructor call | 2 |
| async | Async function | 1 |
| + | Addition | 1 |
| * | Multiplication | 2 |
| **Total N1** | | **170** |

*Distinct operators **n1 = 18** (above rows; assignment and * counted once each for distinct count).*

---

### Operands Table

| Operand | Type | Occurrence |
|---------|------|------------|
| prismaDB | Identifier | 2 |
| request | Identifier | 2 |
| body | Identifier | 2 |
| email | Identifier | 6 |
| username | Identifier | 4 |
| password | Identifier | 2 |
| NextResponse | Identifier | 3 |
| json | Identifier | 4 |
| message | Identifier | 3 |
| status | Identifier | 3 |
| userExist | Identifier | 2 |
| user | Identifier | 2 |
| findUnique | Identifier | 1 |
| where | Identifier | 2 |
| bcrypt | Identifier | 1 |
| hash | Identifier | 1 |
| OTPHandler | Identifier | 1 |
| otpClient | Identifier | 3 |
| getOTP | Identifier | 1 |
| String | Identifier | 1 |
| padStart | Identifier | 1 |
| Date | Identifier | 1 |
| now | Identifier | 1 |
| otpExpiry | Identifier | 3 |
| nonVerifiedUser | Identifier | 1 |
| upsert | Identifier | 1 |
| create | Identifier | 2 |
| update | Identifier | 2 |
| name | Identifier | 2 |
| hashedPassword | Identifier | 2 |
| otp | Identifier | 3 |
| parseInt | Identifier | 2 |
| sendOTP | Identifier | 1 |
| error | Identifier | 2 |
| success | Identifier | 2 |
| console | Identifier | 1 |
| log | Identifier | 1 |
| "Missing value name, email or password" | Literal | 1 |
| 422 | Literal | 1 |
| "User already exists" | Literal | 1 |
| false | Literal | 1 |
| 409 | Literal | 1 |
| 10 | Literal | 1 |
| 6 | Literal | 1 |
| "0" | Literal | 1 |
| 5 | Literal | 1 |
| 60 | Literal | 1 |
| 1000 | Literal | 1 |
| true | Literal | 2 |
| "OTP sent, check your email" | Literal | 1 |
| "Something went wrong" | Literal | 1 |
| 500 | Literal | 1 |
| **Total N2** | | **85** |

*Distinct operands **n2 = 48**.*

---

### Halstead Parameters

| Parameter | Value |
|-----------|--------|
| n1 | 18 |
| n2 | 48 |
| N1 | 170 |
| N2 | 85 |

---

### Calculated Metrics

| Metric | Formula | Value |
|--------|---------|--------|
| Vocabulary (n) | n1 + n2 | 66 |
| Length (N) | N1 + N2 | 255 |
| Volume (V) | N × log₂(n) | 255 × log₂(66) ≈ **1,541** |
| Difficulty (D) | (n1/2) × (N2/n2) | (18/2) × (85/48) ≈ **15.94** |
| Effort (E) | D × V | 15.94 × 1541 ≈ **24,565** |
| Program Level (L) | 1 / D | 1 / 15.94 ≈ **0.063** |
| Time (T) | E / 18 (seconds) | 24565 / 18 ≈ **1,365 s** (~22.8 min) |
| Bugs (B) | V / 3000 | 1541 / 3000 ≈ **0.51** |

*Calculations: log₂(66) ≈ 6.044; V = 255 × 6.044 ≈ 1541; T in seconds.*

---

## RESULT

Halstead Software Metrics for the **Student Learning Management System (SLMS)** were successfully evaluated by calculating operators and operands for the **User Authentication Module (Register API)** — file `app/api/auth/register/route.ts` (70 LOC).

- **Vocabulary (n = 66)** and **Length (N = 255)** reflect the size of the program’s lexicon and total token count.
- **Volume (V ≈ 1,541)** indicates the information content; **Difficulty (D ≈ 15.94)** and **Effort (E ≈ 24,565)** indicate moderate complexity and development effort for this module.
- **Estimated programming time (T ≈ 22.8 minutes)** and **estimated bugs (B ≈ 0.51)** are derived from the standard Halstead formulas and help in planning and quality estimation.

These metrics support estimation of **software complexity**, **development effort**, and **maintainability** for the SLMS authentication module and can be extended to other modules for comparison.
