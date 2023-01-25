#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack'
import { ECommerceApiStack } from '../lib/ecommerceApi-stack'
import { ProductsAppLayersStack } from '../lib/productsAppLayers-stack'
import { EventsDdbStack } from '../lib/eventsDdb-stack'
import { OrdersAppLayersStack } from '../lib/ordersAppLayer-app.stack';
import { OrdersAppStack } from '../lib/ordersApp-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  account: '182028296198',
  region: 'us-east-1'
}

const tags = {
  cost: 'ECommerce',
  team: 'Jonas'
}

const productsAppLayerStack = new ProductsAppLayersStack(app, 'productsAppLayers', {
  tags: tags,
  env: env
})

const eventsDdbStack = new EventsDdbStack(app, 'EventsDdb', {
  tags: tags,
  env: env
})

const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  eventsDdb: eventsDdbStack.table,
  tags: tags,
  env: env
})
productsAppStack.addDependency(productsAppLayerStack)
productsAppStack.addDependency(eventsDdbStack)


const ordersAppLayerStack = new OrdersAppLayersStack(app, 'OrdersAppLayers', {
  tags: tags,
  env: env
})

const ordersAppStack = new OrdersAppStack(app, 'OrdersApp', {
  tags: tags,
  env: env,
  productsDdb: productsAppStack.productsDdb
})
ordersAppStack.addDependency(productsAppStack)
ordersAppStack.addDependency(ordersAppLayerStack)

const eCommerceApiStack = new ECommerceApiStack(app, 'ECommerceApi', {
  productsFetchHandler: productsAppStack.productsFetchHandler,
  productsAdminHandler: productsAppStack.productsAdminHandler,
  ordersHandler: ordersAppStack.ordersHandler,
  tags: tags,
  env: env
})
eCommerceApiStack.addDependency(productsAppStack)
eCommerceApiStack.addDependency(ordersAppStack)
