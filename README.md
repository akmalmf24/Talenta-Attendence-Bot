# Talenta Attendance Bot

This project automates daily attendance marking for the Talenta platform.


## Key Features & Benefits
* Auto Attendance: Automatically clocks in/out according to the schedule.
* Location Spoofing: Uses coordinates from configuration (latitude & longitude).
* Daily Photo Upload: Each weekday uses a specific photo — required for attendance.
* Flexible Storage: Supports local image storage or Cloudinary upload.
* Dockerized Deployment: Fully containerized for simple setup.

## Prerequisites & Dependencies

Before you begin, ensure you have the following installed:

*   **Node.js:** Version 20 or higher.
*   **npm:** Node Package Manager.
*   **Docker:** Docker Engine for containerization.

## Installation & Setup Instructions

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/akmalmf24/Talenta-Attendence-Bot.git
    cd Talenta-Attendence-Bot
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure environment variables:**

    *   Create a `.env` file by copying `.env.copy`:

        ```bash
        cp .env.copy .env
        ```

    *   Populate the `.env` file with the necessary environment variables. 

4.  **Build and run the Docker container (Optional but recommended):**

    ```bash
    docker build -t talenta-attendance-bot .
    docker run -d -p 3000:3000 talenta-attendance-bot
    ```

    Alternatively, you can run it directly using node if you are not using docker:

    ```bash
    node server.js
    ```

## Usage Examples & API Documentation

The bot likely interacts with the Talenta API to perform attendance-related tasks.

**Example: Accessing the Company ID**

The `server.js` file includes an endpoint `/company` that fetches the company ID.

```javascript
if (req.url === "/company") {
  try {
    const companyId = await getCompanyId()
    res.end(JSON.stringify({ companyId }))
  } catch (err) {
    console.error(err)
    res.writeHead(500, { 'Content-Type': 'text/plain' })
    res.end('Error fetching company ID')
  }
  return
}
```

## Configuration Options

The project utilizes environment variables for configuration. The following variables should be defined in the `.env` file:

*   **`EMAIL`:** Talenta account email
*   **`PASSWORD`:** Talenta account password
*   **`CLOCK_IN`:** Clock-in time (e.g., 08:00)
*   **`CLOCK_OUT`:** Clock-out time (e.g., 17:00)
*   **`LATITUDE`:** Latitude coordinate
*   **`LONGITUDE`:** Longitude coordinate
*   **`COMPANY_ID`:** Your Talenta company ID (Get manually or run server and access `/company` to get company id)
*   **Cloudinary API Keys (if applicable):** Cloud name, API key, API secret.

## Image Handling Rules
The bot requires a photo each day (Monday to Friday).
Photos can be stored either locally or uploaded to Cloudinary.

### 1️⃣ Local Mode

Put your photos in the images folder using this naming format:
| Day       | File name |
| --------- | --------- |
| Monday    | `images/1/example.jpg`   |
| Tuesday   | `images/2/example.jpg`   |
| Wednesday | `images/3/example.jpg`   |
| Thursday  | `images/4/example.jpg`   |
| Friday    | `images/5/example.jpg`   |

### 2️⃣ Cloudinary Mode
Fill the claudinary credentials on **`.env`**, then the bot will upload photos automatically. Create a new folder (images), and name it like the local mode.


## Contributing Guidelines

Contributions are welcome! To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature or bug fix.
3.  Make your changes and commit them with clear and descriptive messages.
4.  Submit a pull request.