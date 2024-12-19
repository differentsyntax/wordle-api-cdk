import { v4 as uuidv4 } from "uuid";
import { DynamoDB } from "aws-sdk";
import * as dotenv from "dotenv";

dotenv.config();

type LambdaEvent = {
  body: string;
};

type LambdaResponse = {
  statusCode: number;
  body: string;
  headers?: {
    [key: string]: string;
  };
};

type NewGame = {
  gameId: string;
  targetWord: string;
  attempts: string[];
  maxAttempts: number;
  status: string;
};

const dynamoDb = new DynamoDB.DocumentClient();
const GET_WORD_API = process.env.GET_WORD_API;

export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  console.log("Received event:", event);

  let body: { wordLength: number };
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing request body:", (error as Error).message);
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({ error: "Invalid request body." }),
    };
  }

  let { wordLength } = body;

  wordLength = Number(wordLength);

  if (!wordLength || wordLength < 2) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({ error: "Invalid word length." }),
    };
  }

  const gameId = uuidv4();
  const maxAttempts = wordLength + 1;

  try {
    const targetWord = await fetchRandomWord(wordLength);

    if (!targetWord) {
      throw new Error("Failed to fetch a random word.");
    }

    console.log("Fetched target word:", targetWord);

    const newGame: NewGame = {
      gameId,
      targetWord,
      attempts: [],
      maxAttempts,
      status: "active",
    };

    if (!process.env.TABLE_NAME) {
      console.error("TABLE_NAME environment variable is not set.");
      return {
        statusCode: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
        },
        body: JSON.stringify({ error: "Internal server error." }),
      };
    }

    const params: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.TABLE_NAME,
      Item: newGame,
    };

    await dynamoDb.put(params).promise();

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({
        gameId,
        maxAttempts,
        currentState: [],
        targetWord,
      }),
    };
  } catch (error) {
    console.error("Error:", (error as Error).message);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify({ error: "Could not create game." }),
    };
  }
}

async function fetchRandomWord(wordLength: number): Promise<string> {
  try {
    const res = await fetch(`${GET_WORD_API}?words=1&length=${wordLength}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch word: ${res.statusText}`);
    }

    const data: string[] = await res.json();

    if (data.length <= 0) {
      throw new Error("No words returned from the API.");
    }

    return data[0];
  } catch (error) {
    console.error(
      "Error while fetching word:",
      (error as Error).message,
      `${GET_WORD_API}?length=${wordLength}`
    );
    throw error;
  }
}
