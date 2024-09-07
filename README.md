# Noobizes Express Back-end API

The **Noobizes Express Back-end API** is a Node.js and Express-based back-end that provides a GraphQL API to interact with Riot Games' API. This API allows users to retrieve player stats, recent match history, and specific match details.

## Features

- GraphQL API for efficient and flexible querying
- Integration with Riot Games API
- Retrieve player statistics, recent matches, and specific match details
- Easy to extend and customize

## Prerequisites

- Riot Games API key (You can get one from the [Riot Developer Portal](https://developer.riotgames.com/))

## Installation

### Docker Setup

You can run the **Noobizes Express Back-end API** using Docker. Follow the steps below to build and run the app in a Docker container.

### Steps to Build and Run using Docker:

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/noobizes_express_backend.git
    ```

2. Navigate to the project directory:

    ```bash
    cd noobizes_express_backend
    ```

3. Create a `.env` file in the root directory and add your Riot API key:

    ```bash
    RIOT_API_KEY=your_riot_api_key
    ```

4. Build the Docker image:

    ```bash
    docker build -t lol-dashboard .
    ```

5. Run the Docker container:

    ```bash
    docker run -p 4000:4000 lol-dashboard
    ```

   This will run the server at [http://localhost:4000/graphql](http://localhost:4000).

