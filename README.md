
# Wordle API CDK

This project provides an infrastructure-as-code (IaC) solution using the AWS Cloud Development Kit (AWS CDK) to deploy and manage a serverless backend for a Wordle-like application. The API is designed to handle word validation, game logic, and other backend features necessary for a Wordle game.

Play it online here: [Wordle UI](https://wordle-ui.netlify.app/)

Here's the corresponding UI implementation with React, TypeScript and Vite: https://github.com/differentsyntax/wordle-ui

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Testing](#testing)
- [Contributing](#contributing)

---

## Overview

The **Wordle API CDK** project is a serverless implementation using AWS CDK to define and deploy the infrastructure. The backend is built with AWS Lambda, API Gateway, and DynamoDB to ensure scalability and low latency for the Wordle game's functionality.

## Features

- **Serverless architecture**: Fully managed services using AWS Lambda, API Gateway, and DynamoDB.
- **Efficient game logic**: Handles word validation and game state.
- **Infrastructure as Code**: Easily reproducible and modifiable infrastructure with AWS CDK.

## Architecture

### Components:

- **AWS Lambda**: Contains the backend logic for the Wordle game.
- **API Gateway**: Exposes the RESTful API for client interactions.
- **DynamoDB**: Stores game state, user data, and the word dictionary.
- **AWS CDK**: Manages the infrastructure as code.

### Diagram

```text
Client --> API Gateway --> Lambda --> DynamoDB
```

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- [AWS CLI](https://aws.amazon.com/cli/) (configured with your AWS credentials)
- [AWS CDK](https://aws.amazon.com/cdk/) (v2 or later)
- [npm](https://www.npmjs.com/)

## Getting Started

### 0. Setup AWS CLI for your own AWS account locally with appropriate IAM access policies for your user

### 1. Clone the Repository

```bash
git clone https://github.com/differentsyntax/wordle-api-cdk.git
cd wordle-api-cdk
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create an `.env` file in the root directory with the following variables:

```env
GET_WORD_API="https://random-word-api.herokuapp.com/word"
```
Note: Using random word API to fetch a random valid dictionary word. 

### 4. Bootstrap the CDK Environment

```bash
cdk bootstrap
```

## Deployment

### Deploy the Stack

Run the following command to deploy the Wordle API stack:

```bash
cdk deploy
```

### Outputs

After deployment, the API endpoint will be displayed in the terminal. Use this endpoint to interact with the Wordle API.

## Testing

### 1. Local Testing

Use tools like [Postman](https://www.postman.com/) or [curl](https://curl.se/) to test the API locally:

```bash
curl -X POST <API_ENDPOINT>/validate-word -d '{"word":"example"}'
```

## Contributing

Contributions are welcome! To contribute:

1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature-name`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-name`).
5. Open a pull request.

---

## Acknowledgments

Special thanks to the open-source community and AWS CDK for making serverless infrastructure easier to build and manage.
