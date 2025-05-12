import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfront_origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface FrontendStackProps extends cdk.NestedStackProps {
    stage: string;
}

export class FrontendStack extends cdk.NestedStack {
  constructor(scope: Construct, id: string, props?: FrontendStackProps) {
    super(scope, id, props);

    const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
    const __dirname = path.dirname(__filename);
    const domain = "revealthewheels.com";
  
    new cdk.CfnOutput(this, 'Site', {value: 'https://revealthewheels.com'});

    // Create S3 bucket for built code deployment
    const gameBucket = new s3.Bucket(this, 'GameBucket', {
      bucketName: 'car-game-75',
      publicReadAccess: false,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
      autoDeleteObjects: true,
    });

    new cdk.CfnOutput(this, 'Bucket', {value: gameBucket.bucketName });

    // fetch route53 zone
    const zone = route53.HostedZone.fromLookup(this, "zone", {
      domainName: domain,
    })

    // Create SSL cert for domain
    const certificate = new acm.Certificate(this, 'SiteCertificate', {
      domainName: domain,
      validation: acm.CertificateValidation.fromDns(zone), 
    });

    new cdk.CfnOutput(this, 'Certificate', {value: certificate.certificateArn});

    // Create Cloudfront distribution
    const distribution = new cloudfront.Distribution(this, 'SiteDistribution', {
      certificate: certificate, 
      defaultRootObject: "index.html",
      domainNames: [domain],
      minimumProtocolVersion: cloudfront.SecurityPolicyProtocol.TLS_V1_2_2021,
      errorResponses: [
        {
          httpStatus: 403,
          // responseHttpStatus: 403,
          // responsePagePath: './error.html',
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

    // Add A record to hosted zone
    new route53.ARecord(this, 'SiteAliasRecord', {
      recordName: domain, 
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
      zone: zone,
    });

    // Deploy build code to bucket
    new s3deploy.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../../out'))],
      destinationBucket: gameBucket,
      distribution,
      distributionPaths: ['/*'],
    });

    new cdk.CfnOutput(this, 'GameUrl', { value: distribution.distributionDomainName });
  }
}
