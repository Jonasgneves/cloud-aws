import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";
import { ProductRepository } from "/opt/nodejs/productsLayer"
import { DynamoDB } from "aws-sdk"

const productsDdb = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()

const productRepository = new ProductRepository(ddbClient, productsDdb)

export async function handler(event: APIGatewayProxyEvent,
  context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId
  const apiGatewayId = event.requestContext.requestId

  console.log(`API Gateway requestId: ${apiGatewayId} - Lambda requestId: ${lambdaRequestId}`)

  const method = event.httpMethod
  if (event.resource === '/products') {
    if (method === 'GET') {
      console.log('GET')

      const products = await productRepository.getAllProducts()
      
      return {
        statusCode: 200,
        body: JSON.stringify(products)
      }
    }
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string
    console.log(`GET produscts/${productId} - TUDO CERTO`)

    try {
      const product = await productRepository.getProductById(productId)
    return {
      statusCode: 200,
      body: JSON.stringify(product)
    }
    } catch (error) {
      console.error((<Error>error).message)
      return {
        statusCode: 404,
        body: (<Error>error).message
      }
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad request'
    })
  }
}