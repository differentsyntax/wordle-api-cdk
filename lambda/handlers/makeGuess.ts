import { DynamoDB } from "aws-sdk";

type LambdaEvent = {
  pathParameters: {
    gameId: string;
  };
  body: string;
};

type LambdaResponse = {
  statusCode: number;
  body: string;
  headers?: {
    [key: string]: string;
  };
};

type Game = {
  gameId: string;
  targetWord: string;
  attempts: string[];
  maxAttempts: number;
  status: string;
};

type ValidityResponse = {
  validity: string[];
  remainingAttempts: number;
  status: string;
};

const dynamoDb = new DynamoDB.DocumentClient();

export async function handler(event: LambdaEvent): Promise<LambdaResponse> {
  const { gameId } = event.pathParameters;

  let body: { guess: string };
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    console.error("Error parsing request body:", (error as Error).message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid request body." }),
    };
  }

  let { guess } = body;
  guess = guess.toLowerCase();

  if (!process.env.TABLE_NAME) {
    console.error("TABLE_NAME environment variable is not set.");
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error." }),
    };
  }

  const params: DynamoDB.DocumentClient.GetItemInput = {
    TableName: process.env.TABLE_NAME,
    Key: { gameId },
  };

  try {
    const result = await dynamoDb.get(params).promise();
    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: "Game not found." }),
      };
    }

    const game = result.Item as Game;

    if (game.status !== "active") {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Game is not active." }),
      };
    }

    const validity = getValidity(game.targetWord, guess);
    game.attempts.push(guess);

    if (guess === game.targetWord) {
      game.status = "won";
    } else if (game.attempts.length >= game.maxAttempts) {
      game.status = "lost";
    }

    const updateParams: DynamoDB.DocumentClient.PutItemInput = {
      TableName: process.env.TABLE_NAME,
      Item: game,
    };

    await dynamoDb.put(updateParams).promise();

    const response: ValidityResponse = {
      validity,
      remainingAttempts: game.maxAttempts - game.attempts.length,
      status: game.status,
    };

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error("Error:", (error as Error).message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Could not submit guess." }),
    };
  }
}

function getValidity(target: string, guess: string): string[] {
  const validity: string[] = [];
  for (let i = 0; i < target.length; i++) {
    if (guess[i] === target[i]) {
      validity.push("correct");
    } else if (target.includes(guess[i])) {
      validity.push("wrong-place");
    } else {
      validity.push("wrong");
    }
  }
  return validity;
}
