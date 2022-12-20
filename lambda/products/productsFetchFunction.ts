import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId
  const apiGatewayId = event.requestContext.requestId

  console.log(`API Gateway requestId: ${apiGatewayId} - Lambda requestId: ${lambdaRequestId}`)

  const method = event.httpMethod
  if (event.resource === '/products') {
    if (method === 'GET') {
      console.log('GET')
      
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'GET Products OK!'
        })
      }
    }
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string
    console.log(`GET produscts/${productId} - TUDO CERTO`)

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `TUDO OK GET products/${productId}`
      })
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({
      message: 'Bad request'
    })
  }
}