import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda";

export async function handler(event: APIGatewayProxyEvent,
  context: Context): Promise<APIGatewayProxyResult> {

  const lambdaRequestId = context.awsRequestId
  const apiGatewayId = event.requestContext.requestId

  console.log(`API Gateway requestId: ${apiGatewayId} - Lambda requestId: ${lambdaRequestId}`)

  const method = event.httpMethod
  if (event.resource === '/products') {
      console.log('TUDO OK NO POST')
      return {
        statusCode: 201,
        body: JSON.stringify({
          message: 'POST /products OK!!!'
        })
      }
  } else if (event.resource === '/products/{id}') {
    const productId = event.pathParameters!.id as string
    if (event.httpMethod === 'PUT') {
      console.log(`PUT - /products/${productId}`)
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `PUT - /products/${productId}`
        }) 
      }
    } else if (event.httpMethod === 'DELETE') {
      console.log(`DELETE - /products/${productId}`)
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: `DELETE - /products/${productId}`
        })
        
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