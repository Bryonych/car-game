import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import { Role } from 'aws-cdk-lib/aws-iam';

interface BackendStackProps extends cdk.NestedStackProps {
    stage: string;
}

export class BackendStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props?: BackendStackProps) {
    super(scope, id, props);

    const lambdaRole = process.env.LAMBDA_ROLE || "";
    const lambdaRoleId = process.env.LAMBDA_ROLE_ID || "";
    
    const retrieveCarLambda = new lambda.Function(this, 'retrieveCarLambda', {
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset('lambda'),
      timeout: cdk.Duration.seconds(60),
      role: Role.fromRoleName(this, lambdaRoleId, lambdaRole),
    });

    const api = new apigateway.RestApi(this, 'cars-api', {
      restApiName: 'cars-api',
      deployOptions: {
        stageName: 'dev',
      }
    });

    const carsResource = api.root.addResource('car');
    carsResource.addMethod('GET', new apigateway.LambdaIntegration(retrieveCarLambda));

  }
}
