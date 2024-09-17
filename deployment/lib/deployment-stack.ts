import * as cdk from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

export class Replay2024DemoStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC for the ECS cluster
    const vpc = new Vpc(this, 'Replay2024Vpc', {
      maxAzs: 2,  // Deploy resources in 1 AZ to reduce subnets and EIPs
      natGateways: 1,  // Only create 1 NAT Gateway for private subnet
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: 'public-subnet',
          subnetType: ec2.SubnetType.PUBLIC,  // Only 1 public subnet for NLB/UI
        },
        {
          cidrMask: 24,
          name: 'private-subnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,  // 1 private subnet for worker
        },
      ],
    });

    // ECS Cluster
    const cluster = new ecs.Cluster(this, 'Replay2024Cluster', {
      clusterName: 'replay2024-demo',
      vpc,
    });

    // Task Role for both services
    const taskRole = new iam.Role(this, 'Replay2024TaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
    });

    // Allow communication with Temporal Cloud
    taskRole.addToPolicy(new PolicyStatement({
      actions: ['secretsmanager:GetSecretValue', 'ssm:GetParameter'],
      resources: ['*'],
    }));

    // Security group allowing port 5173 from anywhere for the UI
    const securityGroup = new ec2.SecurityGroup(this, 'Replay2024SG', {
      vpc,
      allowAllOutbound: true,
    });
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5173), 'Allow TCP 5173 from anywhere');

    // ECS task definition for the UI container (Game UI)
    const uiTaskDefinition = new ecs.FargateTaskDefinition(this, 'GameUiTaskDef', {
      memoryLimitMiB: 2048,
      cpu: 1024,
      taskRole,
    });

    const gameUiContainer = uiTaskDefinition.addContainer('GameUiContainer', {
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(this, 'UiRepo', 'temporal-replay-demo-2024-game-ui'),
        'v1.7.qrchange'  // Use 'latest' tag or your specific image tag
      ),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'game-ui' }),
      environment: {
        'TEMPORAL_ADDRESS': 'replay-2024-demo.sdvdw.tmprl.cloud:7233',
        'TEMPORAL_NAMESPACE': 'replay-2024-demo.sdvdw',
        'TEMPORAL_CLIENT_CERT_PATH': 'replay-2024-demo.sdvdw.crt',
        'TEMPORAL_CLIENT_KEY_PATH': 'replay-2024-demo.sdvdw.key',
        'TEMPORAL_TASK_QUEUE': 'game',
        'TEMPORAL_WORKFLOW_TYPE': 'GameWorkflow',
      },
    });

    gameUiContainer.addPortMappings({
      containerPort: 5173,
      protocol: ecs.Protocol.TCP,
    });

    // Network Load Balancer (NLB)
    const nlb = new elbv2.NetworkLoadBalancer(this, 'GameUiNLB', {
      vpc,
      internetFacing: true,  // NLB will be publicly accessible
      crossZoneEnabled: true,  // Distribute traffic across multiple zones
    });

    // Create a listener for the NLB
    const nlbListener = nlb.addListener('PublicListener', {
      port: 80,
    });

    // Add the Fargate service to the NLB listener
    nlbListener.addTargets('GameUiFargateTarget', {
      port: 5173,  // Forward traffic to port 5173
      targets: [new ecs.FargateService(this, 'FargateService', {
        cluster,
        taskDefinition: uiTaskDefinition,
        assignPublicIp: false, // No need to assign a public IP directly to the task
        securityGroups: [securityGroup],
      })],
      // TCP-based health check for NLB (No path, only port)
      healthCheck: {
        port: '5173',  // Health check for TCP connections on port 5173
        protocol: elbv2.Protocol.TCP,  // Use TCP for health checks
      },
    });

    const nlbDnsName = nlb.loadBalancerDnsName;

    // EIP association cannot be done directly with CDK for NLB. You will need to do this manually
    // by associating the Elastic IP to the Network Interfaces of the NLB after deployment.

    // ECS task definition for the worker container (Temporal Worker)
    const workerTaskDefinition = new ecs.FargateTaskDefinition(this, 'GameWorkerTaskDef', {
      memoryLimitMiB: 2048,
      cpu: 1024,
      taskRole,
    });

    const gameWorkerContainer = workerTaskDefinition.addContainer('GameWorkerContainer', {
      image: ecs.ContainerImage.fromEcrRepository(
        ecr.Repository.fromRepositoryName(this, 'WorkerRepo', 'temporal-replay-demo-2024-game-worker'),
        'v1.7.qrchange'  // Use 'latest' tag or your specific image tag
      ),
      logging: ecs.LogDrivers.awsLogs({ streamPrefix: 'game-worker' }),
      environment: {
        'TEMPORAL_ADDRESS': 'replay-2024-demo.sdvdw.tmprl.cloud:7233',
        'TEMPORAL_NAMESPACE': 'replay-2024-demo.sdvdw',
        'TEMPORAL_CLIENT_CERT_PATH': 'replay-2024-demo.sdvdw.crt',
        'TEMPORAL_CLIENT_KEY_PATH': 'replay-2024-demo.sdvdw.key',
        'SOCKETIO_HOST': `http://${nlbDnsName}:80`,
      },
    });

    // Fargate Service for Worker without public IP
    const workerService = new ecs.FargateService(this, 'GameWorkerService', {
      cluster,
      taskDefinition: workerTaskDefinition,
      desiredCount: 1,
      securityGroups: [securityGroup],
      assignPublicIp: false, // Worker does not need a public IP
    });

    // Scaling down to 1 instance
    workerService.autoScaleTaskCount({
      maxCapacity: 1,
      minCapacity: 1,
    });
  }
}
