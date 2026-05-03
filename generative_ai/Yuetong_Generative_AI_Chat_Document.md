
# Generative AI Chat Document – Yuetong

## 1. Basic Information

**Project:** COMP30830 Dublin Bikes Web Application  
**Student:** Yuetong  
**Group:** Group 3  

**Generative AI / AI-assisted tools used:**

- ChatGPT
- Claude
- Grok
- Cursor

This document summarises how I used Generative AI and AI-assisted tools during the COMP30830 Dublin Bikes project. These tools were used to support learning, debugging, planning, communication, and report preparation.

ChatGPT was the main tool used for most AI-assisted discussions. Claude, Grok, and Cursor were used more occasionally for comparison, alternative explanations, wording checks, or code-editing support.

Generative AI was not used as a replacement for my project work. Final implementation decisions, deployment checks, database verification, screenshots, report evidence, and team communication were based on the actual GitHub repository, EC2 terminal outputs, MySQL database results, Flask API responses, browser testing, and group decisions.

Sensitive information such as API keys, passwords, database credentials, private key files, and server access details has been excluded.

---

## 2. Summary of Tool Usage

| Tool | Main Purpose | Level of Use |
|---|---|---|
| ChatGPT | Main tool for understanding concepts, organising debugging steps, preparing report explanations, and drafting technical group messages. | Primary |
| Claude | Used occasionally to compare wording and improve clarity of written explanations. | Secondary |
| Grok | Used occasionally for quick second opinions on technical explanations or communication wording. | Secondary |
| Cursor | Used as an AI-assisted coding/editor tool when reviewing or navigating project code and checking possible code-level changes. | Secondary |

The majority of AI-supported reasoning and planning was done through ChatGPT. The other tools were used in a limited way to compare phrasing, check understanding, or support code editing.

---

## 3. Scope of AI Use

I used AI tools mainly for the following purposes:

1. understanding technical concepts from the course material, such as Flask routes, REST API responses, EC2 deployment, Gunicorn, nginx, and MySQL verification;
2. organising step-by-step debugging plans when the deployed application did not behave as expected;
3. interpreting possible meanings of terminal errors, HTTP status codes, service logs, and runtime behaviour;
4. preparing checklists for screenshots and report evidence;
5. improving the wording of my individual contribution and technical explanations;
6. drafting clearer technical messages for group communication;
7. checking whether report sections were logically connected to the actual implementation.

The AI output was treated as guidance only. I checked the actual result myself before using it in the project or report.

---

## 4. What AI Was Not Used For

AI tools were not used to:

- access the EC2 server directly;
- run deployment commands on my behalf;
- access the MySQL database directly;
- upload files to GitHub on my behalf;
- make final project decisions independently;
- replace testing of the deployed web application;
- generate or store secret credentials;
- submit any project deliverable automatically.

Any command suggested by AI was manually reviewed, adapted to the actual project, and executed by me only when appropriate.

---

## 5. Main AI-Supported Areas

### 5.1 Understanding Project Requirements and Report Evidence

I used ChatGPT mainly to clarify what the final report needed to include and how my individual contribution should be evidenced. This included checking that the report had space for the GitHub repository URL, video demo link, backlog links, Generative AI chat document link, screenshots, and individual contribution description.

Claude was occasionally used to compare wording and make the explanation more concise.

The final report content and evidence were based on the actual project files and screenshots.

---

### 5.2 Backend and Flask API Understanding

I used ChatGPT to revise my understanding of how Flask routes and API endpoints work in the project. In particular, I discussed the difference between:

- routes that serve HTML pages;
- API endpoints that return JSON;
- JavaScript `fetch()` requests from the frontend;
- backend routes that query the database;
- JSON responses used by the map and station pages.

This helped me explain the backend/API integration more clearly in the report. The actual route names, endpoint behaviour, and screenshots were checked against the real project code and deployed application.

Cursor was used where relevant to review code structure and navigate project files more efficiently.

---

### 5.3 Database Verification

I used ChatGPT to organise a checklist for verifying the MySQL database. The checklist included commands such as:

```sql
SHOW TABLES;
DESCRIBE real_stations;
DESCRIBE availability;
SELECT COUNT(*) FROM real_stations;
SELECT COUNT(*) FROM availability;
SELECT * FROM real_stations LIMIT 5;
SELECT * FROM availability LIMIT 5;
````

These commands were used as a guide only. I ran the relevant checks myself in the actual database environment. The report evidence was based on real MySQL outputs.

---

### 5.4 EC2 Deployment and Runtime Debugging

I used ChatGPT to structure the debugging process for the deployed Flask application on EC2. The checks discussed included:

```bash
sudo systemctl status bikeapp
sudo journalctl -u bikeapp -n 120 --no-pager
sudo systemctl status nginx
sudo ss -lntp | grep -E ':80|:5000'
curl http://127.0.0.1:5000/health
curl -I http://<EC2_PUBLIC_IP>/health
```

The purpose was to identify whether a deployment issue came from Flask, Gunicorn, nginx, dependencies, server configuration, model loading, or public IP access.

The actual debugging was done through EC2 terminal output, service status checks, HTTP responses, and browser testing. AI did not access or modify the server.

---

### 5.5 Runtime Error Interpretation

When runtime or deployment issues occurred, I used AI tools to understand possible causes. For example, ChatGPT helped me reason through whether an issue was likely related to:

* missing Python dependencies;
* Flask import or route errors;
* Gunicorn failing to start;
* nginx running but not forwarding correctly;
* service restart issues;
* model loading or memory problems.

Grok was occasionally used for quick second opinions on technical wording or possible interpretations of errors.

I verified the actual cause using logs, service status output, HTTP responses, and project files.

---

### 5.6 ML Deployment Support

I used ChatGPT to help reason about an ML deployment issue where the uploaded model files and model metadata appeared inconsistent.

The discussion helped me frame the issue clearly:

* the deployed model file loaded as a `DecisionTreeRegressor`;
* the metadata or report wording needed to match the final deployed model;
* a larger model could perform better offline but be less practical to deploy on EC2;
* the final model choice needed to be confirmed by the team and reflected consistently in the report.

AI was used to help phrase the issue and understand the deployment trade-off. The actual model type was checked by loading the model file in Python and observing the result.

---

### 5.7 Report Writing and Screenshot Planning

I used ChatGPT to organise what screenshots would be useful for my contribution section. The checklist included:

* Flask route or API evidence;
* API endpoint returning JSON;
* MySQL table structure and row counts;
* EC2 instance running;
* SSH login and project directory;
* `bikeapp` service status;
* nginx service status;
* `/health` endpoint response;
* public IP access;
* runtime log evidence;
* model loading/type check where applicable.

Claude was occasionally used to compare wording and improve clarity of written explanations.

The screenshots themselves were collected from the real project environment.

---

### 5.8 Team Communication

I used ChatGPT mainly to improve the clarity of technical group messages, especially when explaining:

* deployment status;
* remaining debugging tasks;
* model file mismatch;
* report evidence;
* final submission preparation.

Claude or Grok was occasionally used for alternative phrasing. The messages were edited by me before sending and were based on the actual project status.

---

## 6. Representative Prompt Summaries

The following are representative summaries of the types of prompts I used. They are not full verbatim transcripts because private credentials, repeated debugging outputs, and irrelevant details were removed.

### Example 1: EC2 Deployment

**Prompt summary:**
How can I check whether the Flask application is running correctly on EC2 through Gunicorn and nginx?

**AI tool mainly used:** ChatGPT

**Use of response:**
I used the response to organise a sequence of checks, then verified the application using actual EC2 commands, browser access, and HTTP responses.

---

### Example 2: Database Verification

**Prompt summary:**
What MySQL commands should I use to verify that the station and availability tables exist and contain data?

**AI tool mainly used:** ChatGPT

**Use of response:**
I used the response as a checklist, then ran the relevant SQL commands myself and used the real outputs as report evidence.

---

### Example 3: Flask API Explanation

**Prompt summary:**
How should I explain the connection between Flask API routes and frontend JavaScript requests?

**AI tools used:** ChatGPT, with occasional wording comparison using Claude

**Use of response:**
I used the response to improve the wording of my report explanation. The explanation was checked against the actual project code.

---

### Example 4: ML Model Consistency

**Prompt summary:**
What should I do if the uploaded model file and model metadata describe different model types?

**AI tool mainly used:** ChatGPT

**Use of response:**
I used the response to understand the consistency issue and to write a clear message asking the team to confirm the final model used in the submission.

---

### Example 5: Report Wording

**Prompt summary:**
How can I describe my backend, database, deployment, and debugging contribution clearly without overstating or understating my work?

**AI tools used:** ChatGPT and Claude

**Use of response:**
I used the responses to improve the clarity of the wording. The final content was edited by me and matched the actual work completed.

---

### Example 6: Code Navigation and Editing Support

**Prompt summary:**
Review this code structure and help me understand where a route, model-loading function, or configuration issue may be located.

**AI tool used:** Cursor

**Use of response:**
Cursor was used as an editor-based assistant to support code navigation and possible code-level review. Any changes were checked manually against the project behaviour.

---

## 7. Verification Process

Before using any AI-supported suggestion in the project or report, I checked it against at least one of the following:

* the actual GitHub repository;
* the EC2 terminal output;
* Flask route behaviour;
* API JSON responses;
* MySQL database output;
* browser access through the EC2 public IP;
* Gunicorn and nginx service status;
* `journalctl` logs;
* Python model loading results;
* team confirmation.

If the AI suggestion did not match the actual project structure, I adapted it or ignored it.

---

## 8. Data Handling and Academic Integrity

I used AI tools in a transparent and supportive way. They helped with understanding, debugging, planning, wording, and communication, but the submitted project work was based on the group implementation and actual system behaviour.

I did not include:

* API keys;
* database passwords;
* `.pem` private key content;
* private credentials;
* raw secret configuration files;
* sensitive server access information.

The final code, report explanations, screenshots, and deployment evidence were checked against the real project.

---

## 9. Reflection

Generative AI was useful as a technical support and explanation tool, especially during backend debugging, EC2 deployment checks, database verification, and report preparation.

ChatGPT was the most frequently used tool because it was helpful for step-by-step debugging and explanation. Claude, Grok, and Cursor were used more selectively for alternative wording, quick second opinions, or code-editor support.

The main lesson was that AI can make debugging and documentation more systematic, but it still requires careful verification. For this project, I treated AI output as guidance and confirmed important details through real commands, screenshots, deployed application behaviour, and team decisions.

```
