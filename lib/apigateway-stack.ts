import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";

interface ApiGatewayStackProps extends cdk.StackProps {
  createGameLambda: lambda.Function;
  makeGuessLambda: lambda.Function;
}

export class ApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props);

    const { createGameLambda, makeGuessLambda } = props;

    const api = new apigateway.RestApi(this, "WordleApi");

    const apiResource = api.root.addResource("game");

    // Game creation
    apiResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(createGameLambda)
    );

    // Guess submission and validity check
    const gameResource = apiResource.addResource("{gameId}");
    gameResource
      .addResource("guess")
      .addMethod("POST", new apigateway.LambdaIntegration(makeGuessLambda));
  }
}
