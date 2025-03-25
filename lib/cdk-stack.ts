import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Role } from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';


export class CdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const lambdaRole = process.env.LAMBDA_ROLE || "";
    const lambdaRoleId = process.env.LAMBDA_ROLE_ID || "";
    
    const retrieveCarLambda = new lambda.Function(this, 'retrieveCarLambda', {
      runtime: lambda.Runtime.PYTHON_3_13,
      handler: 'lambda_function.lambda_handler',
      code: lambda.Code.fromAsset('backend'),
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

    // Add domain and uncomment when you have the domain
    // new cdk.CfnOutput(this, 'Site', {value: 'https://test.com'});

    const gameBucket = new s3.Bucket(this, 'GameBucket', {
      bucketName: 'car-game',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      // Need to change for prod
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    new cdk.CfnOutput(this, 'Bucket', {value: gameBucket.bucketName });

    // Uncomment when you have a domain
    // const certificate = new acm.Certificate(this, 'SiteCertificate', {
    //   domainName: 'https://test.com', // change
    //   validation: acm.CertificateValidation.fromDns(); // add zone
    // });

    // new cdk.CfnOutput(this, 'Certificate', {value: certificate.certificateArn});

    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      // certificate: certificate, // uncomment when cert genenrated
      defaultRootObject: "page.tsx",
      // domainNames: [// add domain name when created],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 403,
          responsePagePath: './error.html',
          ttl: cdk.Duration.minutes(10),
        }
      ],
      defaultBehavior: {
        origin: cloudfront_origins.S3BucketOrigin.withOriginAccessControl(gameBucket),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD_OPTIONS,
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      }
    });

    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });

    // Uncomment when route53 set up
    // new route53.ARecord(this, 'SiteAliasRecord', {
    //   recordName: '', //add domain
    //   target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    //   zone // add zone
    // });

    new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [s3deploy.Source.asset(path.join(__dirname, './src'))],
      destinationBucket: gameBucket,
      distribution,
      distributionPaths: ['/*'],
    });

  }
}
