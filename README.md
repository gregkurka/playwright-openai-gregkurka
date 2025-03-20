# Playwright and Open AI

### What is this?

This project is was originally made for a project submission for a QA Engineer job, and evolved into a full fledged project.

The front end takes a URL from the user, fetches the HTML from that URL, sends the HTML to the OPEN AI API. The open AI API sends back playwright code for the user to run automated tests on that website.

### How to initialize project

Create a `.env` file in the **backend** folder with the following contents:

```bash
PORT=5000
OPENAI_API_KEY=YOUR_OPEN_AI_API_KEY_HERE
```

then install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ..
npm install
```

### Running the Project

To streamline starting both the backend and frontend during development, I've created a script at the root of the project: **`run-dev.sh`**.

- **What it does**:

  1. Navigates to the backend folder and runs `npm run start:dev`.
  2. Navigates to the frontend folder and runs `npm run dev`.
  3. Keeps both processes running until you stop them.

- **How to use**:

  1. Make sure the script is executable:
     ```bash
     chmod +x run-dev.sh
     ```
  2. Run the script from the project’s root directory:
     ```bash
     ./run-dev.sh
     ```
  3. To stop both servers, press `Ctrl + C`.

### Quick playwright check

You can make a quick playwright check by running the command

```bash
node index.js
```

to see the single test for Hacker News.
