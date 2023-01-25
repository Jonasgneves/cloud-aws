import * as cdk from 'aws-cdk-lib'
import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs'
import * as apiGateway from 'aws-cdk-lib/aws-apigateway'
import * as cwLogs from 'aws-cdk-lib/aws-logs'
import { Construct } from 'constructs'
import { AccessLogFormat } from 'aws-cdk-lib/aws-apigateway'

interface ECommerceApiStackProps extends cdk.StackProps {
  productsFetchHandler: lambdaNodeJs.NodejsFunction
  productsAdminHandler: lambdaNodeJs.NodejsFunction
  ordersHandler: lambdaNodeJs.NodejsFunction
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

    this.createProductsService(props, api)

    this.createOrdersService(props, api)
  }

  private createOrdersService(props: ECommerceApiStackProps, api: apiGateway.RestApi) {
    const ordersIntegration = new apiGateway.LambdaIntegration(props.ordersHandler)

    // resource - /orders
    const ordersResource = api.root.addResource('orders')

    //GET /orders
    //GET /orders?email=teste@gmail.com
    //GET /orders?email=teste@gmail.com&orderId=123
    ordersResource.addMethod('GET', ordersIntegration)

    const orderDeletionValidator = new apiGateway.RequestValidator(this, 'OrderDeletionValidation', {
      restApi: api,
      requestValidatorName: 'OrderDeletionValidation',
      validateRequestParameters: true
    })
    
    //DELETE /orders?email=teste@gmail.com&orderId=123
    ordersResource.addMethod('DELETE', ordersIntegration, {
      requestParameters: {
        'method.request.querystring.email': true,
        'method.request.querystring.orderId': true
      },
      requestValidator: orderDeletionValidator
    })

    //POST /orders 
    ordersResource.addMethod('POST', ordersIntegration)
  }

  private createProductsService(props: ECommerceApiStackProps, api: apiGateway.RestApi) {
    const productsFetchIntegration = new apiGateway.LambdaIntegration(props.productsFetchHandler)

    // "/products"
    const productsResources = api.root.addResource('products')
    productsResources.addMethod('GET', productsFetchIntegration)

    // GET products/{id}
    const productsIdResource = productsResources.addResource('{id}')
    productsIdResource.addMethod('GET', productsFetchIntegration)

    const productAdminIntegration = new apiGateway.LambdaIntegration(props.productsAdminHandler)

    // POST /products
    productsResources.addMethod('POST', productAdminIntegration)

    // PUT /products/{id}
    productsIdResource.addMethod('PUT', productAdminIntegration)

    // DELETE /products/{id}
    productsIdResource.addMethod('DELETE', productAdminIntegration)
  }
}