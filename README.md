# CustomDeviceHive

## Introduction

DeviceHive is an open-source platform for building systems to manage IoT devices, providing APIs that allow users to build components that interact with the system.

CustomDeviceHive is a product built on top of DeviceHive, integrating the ability to store data and display "Temperature" and "Humidity" parameters collected from the ESP8266 board and DHT11 sensor.

## Features

-   Based on the robust and open-source DeviceHive platform.
-   Collects and stores temperature and humidity data.
-   Visualizes data using Grafana.

## Prerequisites

-   Docker
-   Docker Compose
-   Arduino IDE or PlatformIO for flashing the ESP8266.

## Installation

1.  **Build the system:**
    To build the CustomDeviceHive system, use the following command:
    ```bash
    docker-compose -f docker-compose.yml --profile all up -d
    ```

2.  **Verify container status:**
    After pulling the images and successfully building the containers, check if the containers are running by viewing the logs of containers like `dh_frontend`, `dh_backend`, `dh_auth`, etc.

    You should see messages indicating that the applications have started successfully:
    ```
    2024-08-25 05:11:30.532 [main] INFO   c.d.a.DeviceHiveAuthApplication - Started DeviceHiveAuthApplication in 52.875 seconds (JVM running for 56.107)
    2024-08-25 05:12:16.594 [main] INFO   c.d.a.DeviceHiveFrontendApplication - Started DeviceHiveFrontendApplication in 20.922 seconds (JVM running for 22.219)
    2024-08-25 05:10:39.438 [main] INFO   c.d.a.DeviceHiveBackendApplication - Started DeviceHiveBackendApplication in 35.264 seconds (JVM running for 40.329)
    ```
    If you do not see these "Started" messages, you may need to restart the containers that are not running correctly.

## Usage

1.  **Access the Admin Console:**
    -   Go to `http://localhost/admin`
    -   Log in with the following credentials:
        -   **Username:** `dhadmin`
        -   **Password:** `dhadmin_#911`

2.  **Create a Backend User:**
    Since CustomDeviceHive is a sub-product, you need to create a backend user for the system to function correctly.
    -   Navigate to the **Users** tab.
    -   Click **Add new user** with the following information:
        -   **Username:** `backend`
        -   **Password:** `backend`
        -   **Role:** `ADMIN`

3.  **DeviceHive APIs:**
    DeviceHive provides Swagger APIs to interact with the system:
    -   **Frontend Swagger:** `http://hostname/api/swagger`
    -   **Auth Swagger:** `http://hostname/auth/swagger`
    -   **Plugin Swagger:** `http://hostname/plugin/swagger`

4.  **Configure and Flash ESP8266 Firmware:**
    -   Open the `ESP8266_FIRMWARE/ESP8266_FIRMWARE.ino` file in your preferred editor (like Arduino IDE).
    -   Update the following variables with your specific settings:
        -   `ssid`: Your WiFi network name.
        -   `password`: Your WiFi password.
        -   `mqtt_server`: The IP address of the computer running the Docker containers.
    -   The `device_id` variable in the `.ino` file corresponds to a device in DeviceHive. You can leave it as the default or change it to a new ID. If you change it, you will need to create a corresponding device in the DeviceHive admin console.
    -   Connect your DHT11 sensor to the D1 pin on the ESP8266.
    -   Upload (flash) the code to your ESP8266 board.

5.  **Visualize Data in Grafana:**
    -   Access the Grafana dashboard at `http://localhost/grafana`.
    -   Use the following SQL query to view the data:
        ```sql
        SELECT
          s.timestamp AS "time",
          CONCAT(d.name, ' - ', 'temperature') AS metric,
          s.temperature AS value
        FROM sensor_data AS s
        INNER JOIN device AS d ON s.device_name = d.name

        UNION ALL

        SELECT
          s.timestamp AS "time",
          CONCAT(d.name, ' - ', 'humidity') AS metric,
          s.humidity AS value
        FROM sensor_data AS s
        INNER JOIN device AS d ON s.device_name = d.name;
        ```

## Troubleshooting and Support

This product is built on DeviceHive, so some issues may arise during use.

If you encounter any problems or have questions, please contact me via email: [nhnt205@gmail.com](mailto:nhnt205@gmail.com).

Happy using!