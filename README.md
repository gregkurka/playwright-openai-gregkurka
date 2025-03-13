# qa-wolf-3

### What is this?

This project is my submission for the QA Wolf take-home assessment for the QA Engineer role. It includes a frontend and backend setup, along with scripts to streamline development.

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
