import { APIGateway, DynamoDB } from "aws-sdk"
import { Order, OrderRepository } from "/opt/nodejs/ordersLayer"
import { Product, ProductRepository } from "/opt/nodejs/productsLayer"
import * as AWSXray from 'aws-xray-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { OrderProductResponse, OrderRequest } from "/opt/nodejs/ordersApiLayer"

AWSXray.captureAWS(require('aws-sdk'))

const ordersDdb = process.env.ORDERS_DDB!
const productsDdb = process.env.ORDERS_DDB!

const ddbClient = new DynamoDB.DocumentClient()

const orderRepository = new OrderRepository(ddbClient, ordersDdb)
const productRepository = new ProductRepository(ddbClient, productsDdb)

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
  const method = event.httpMethod
  const apiRequestId = event.requestContext.requestId
  const lambdaRequestId = context.awsRequestId

  console.log(`API Gateway RequestId: ${apiRequestId} - LambdaRequestId: ${lambdaRequestId}`)

  if (method === 'GET') {
    if (event.queryStringParameters) {
      const email = event.queryStringParameters!.email
      const orderId = event.queryStringParameters!.orderId
      if (email) {
        if (orderId) {
          // Get one order from user
        } else {
          // Get all order from user
        }
      }
    } else {
      // Get all orders
    }
  } else if (method === 'POST') {
    console.log('POST /orders')

  } else if (method === 'DELETE') {
    console.log('DELETE /orders')
    const email = event.queryStringParameters!.email
    const orderId = event.queryStringParameters!.orderId
  }
  return {
    statusCode: 400,
    body: 'Bad request'
  }
}

function buildOrder(orderRequest: OrderRequest, products: Product[]): Order {
  const orderProduct: OrderProductResponse[] = []
  let totalPrice = 0

  products.forEach((product) => {
    totalPrice += product.price
    orderProduct.push({
      code: product.code,
      price: product.price
    })
  })
  const order: Order = {
    pk: orderRequest.email,
    billing: {
      payment: orderRequest.payment,
      totalPrice: totalPrice
    },
    shipping: {
      type: orderRequest.shipping.type,
      carrier: orderRequest.shipping.carrier
    },
    products: orderProduct
  }
  return order
}
