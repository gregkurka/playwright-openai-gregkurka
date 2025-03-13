# qa-wolf-3

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
