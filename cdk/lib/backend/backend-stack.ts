import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Role } from 'aws-cdk-lib/aws-iam';
import * as dotenv from "dotenv";
import * as path from 'path';
import { fileURLToPath } from 'url';

interface BackendStackProps extends cdk.NestedStackProps {
    stage: string;
}

export class BackendStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props?: BackendStackProps) {
    super(scope, id, props);

    const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
    const __dirname = path.dirname(__filename);
    dotenv.config({ path: path.resolve(__dirname, "../../.env") });

    const lambdaRole = ssm.StringParameter.valueForStringParameter(this, '/car-game/lambda-role');
    const lambdaRoleId = ssm.StringParameter.valueForStringParameter(this, '/car-game/lambda-role-id');
    
    const retrieveCarLambda = new lambda.Function(this, 'retrieveCarLambda', {
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset('../lambda'),
      timeout: cdk.Duration.seconds(60),
      role: Role.fromRoleArn(this, lambdaRoleId, lambdaRole),
    });

    const api = new apigateway.RestApi(this, 'cars-api', {
      restApiName: 'cars-api',
      deployOptions: {
        stageName: 'dev',
      }
    });

    const carsResource = api.root.addResource('car');
    carsResource.addMethod('GET', new apigateway.LambdaIntegration(retrieveCarLambda));

    // Write the API URL to Parameter Store
    new ssm.StringParameter(this, 'ApiUrlParameter', {
      parameterName: '/car-game/api-url',
      stringValue: api.urlForPath('/car'), 
    });

  }
}
