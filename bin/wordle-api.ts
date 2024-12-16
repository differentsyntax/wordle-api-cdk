import * as cdk from "aws-cdk-lib";
import { DynamoDbStack } from "./../lib/dynamodb-stack";
import { LambdaStack } from "./../lib/lambda-stack";
import { ApiGatewayStack } from "./../lib/apigateway-stack";

const app = new cdk.App();

const dynamoDbStack = new DynamoDbStack(app, "DynamoDbStack");

const lambdaStack = new LambdaStack(app, "LambdaStack", {
  wordleGamesTable: dynamoDbStack.wordleGamesTable,
});

new ApiGatewayStack(app, "ApiGatewayStack", {
  createGameLambda: lambdaStack.createGameLambda,
  makeGuessLambda: lambdaStack.makeGuessLambda,
});
