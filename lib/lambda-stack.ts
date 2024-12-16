import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";

interface LambdaStackProps extends cdk.StackProps {
  wordleGamesTable: dynamodb.Table;
}

export class LambdaStack extends cdk.Stack {
  public readonly createGameLambda: lambda.Function;
  public readonly makeGuessLambda: lambda.Function;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const { wordleGamesTable } = props;

    this.createGameLambda = new NodejsFunction(this, "CreateGameHandler", {
      entry: path.join(__dirname, "../lambda/handlers/createGame.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        TABLE_NAME: wordleGamesTable.tableName,
      },
      timeout: cdk.Duration.seconds(5),
      bundling: {
        externalModules: [],
        target: "node18",
      },
    });

    this.makeGuessLambda = new NodejsFunction(this, "MakeGuessHandler", {
      entry: path.join(__dirname, "../lambda/handlers/makeGuess.ts"),
      handler: "handler",
      runtime: lambda.Runtime.NODEJS_18_X,
      environment: {
        TABLE_NAME: wordleGamesTable.tableName,
      },
      bundling: {
        externalModules: [],
        target: "node18",
      },
    });

    wordleGamesTable.grantReadWriteData(this.createGameLambda);
    wordleGamesTable.grantReadWriteData(this.makeGuessLambda);
  }
}
