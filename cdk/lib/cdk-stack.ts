import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { FrontendStack } from './frontend/frontend-stack.ts';
import { BackendStack } from './backend/backend-stack.ts';

export interface CdkStackProps extends cdk.StackProps {
  stage: string;
}

export class CdkStack extends cdk.Stack {
  public frontendResources: FrontendStack;
  public backendResources: BackendStack;

  constructor(scope: Construct, id: string, props: CdkStackProps) {
    super(scope, id, props);

    this.frontendResources = new FrontendStack(this, 'FrontendStack', {
      stage: props.stage,
    });

    this.backendResources = new BackendStack(this, 'BackendStack', {
      stage: props.stage,
    });
  }
}
