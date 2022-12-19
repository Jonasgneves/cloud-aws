import * as cdk from 'aws-cdk-lib'
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apiGateway from 'aws-cdk-lib/aws-apigateway'
import * as cwLogs from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'
import { AccessLogFormat } from 'aws-cdk-lib/aws-apigateway'

interface ECommerceApiStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJs.NodejsFunction
  
}

export class ECommerceApiStack extends cdk.Stack {

  constructor(scope: Construct, id: string, props: ECommerceApiStackProps) {
    super(scope, id, props)
    
    const logGroup = new cwLogs.LogGroup(this, 'ECommerceApiLogs')

    const api = new apiGateway.RestApi(this, 'ECommerceApi', {
      restApiName: 'ECommerceApi',
      deployOptions: {
        accessLogDestination: new apiGateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
          httpMethod: true,
          ip: true,
          protocol: true,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          caller: true,
          user: true
        })
      },
      cloudWatchRole: true
    })

    const productsFetchIntegration = new apiGateway.LambdaIntegration(props.productsFetchHandler)

    // "/products"
    const productsResources = api.root.addResource('products')
    productsResources.addMethod('GET', productsFetchIntegration)
  }
}