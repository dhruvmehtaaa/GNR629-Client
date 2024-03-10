# Geospatial Data Web Client

This project was done as part of the course GNR629 at IIT Bombay and provides a web client to access and retrieve geospatial data from WMS/WFS/WCS servers. It allows users to send various requests to a server (e.g., GetCapabilities, GetMap) and display the response, including both the XML response document and parsed values. Additionally, it supports displaying multiple layers on top of each other and includes a base layer such as Open Street Maps.

## Functionality

- Send various requests to a server (e.g., GetCapabilities, GetMap, DescribeCoverage).
- Capture and display the XML response document.
- Parse the XML and display only the values.
- Display multiple layers, with the ability to stack them.
- Support a base layer (Open Street Maps).
- Ability to send requests to external WMS/WFS/WCS servers and display the result.
- User interface with capabilities to select layers, SRS, bounding coordinates, format, and size.


## Prerequisites

Before you begin, ensure you have met the following requirements:

- **Node.js:** Install [Node.js](https://nodejs.org/) (version 14.20.0).
- **Angular CLI:** Install Angular CLI globally (version 11.0.0). You can install it using npm:

    ```bash
    npm install -g @angular/cli@11.0.0
    ```

## Installation

To get started with this project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/dhruvmehtaaa/GNR629-Client.git
2. Navigate to the project directory:

   ```bash
   cd GNR629-Client
   ```

3. Install dependencies using npm:

   ```bash
   npm install
   ```

## Usage

1. Start the development server:

   ```bash
   ng serve
   ```

2. Open your browser and navigate to `http://localhost:4200/` to access the web client.

3. Use the provided user interface to send requests to WMS/WFS/WCS servers and explore geospatial data.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request with your changes.



