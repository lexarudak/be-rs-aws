# be-rs-aws
Backend RS repo for AWS

Task 4

## Available Links

FE deploy link: https://d24m7wg51rffak.cloudfront.net/

FE pr: https://github.com/lexarudak/nodejs-aws-shop-react/pull/1

Lambda-products-list: https://g0z8a0y8yh.execute-api.eu-north-1.amazonaws.com/prod/products

Lambda-product-by-id: https://g0z8a0y8yh.execute-api.eu-north-1.amazonaws.com/prod/product/1

Swagger: http://localhost:8080/docs

# In the project directory, you can run scripts:

## `install deps`
Installs all necessary dependencies for the project, including infrastructure and service dependencies.
```sh
npm run install:all
```

## `deploy`
Deploys the infrastructure using AWS CDK.
```sh
npm run deploy
```

## `build`
Builds the product service.
```sh
npm run build
```

## `swagger`

Runs the Swagger documentation generator for the product service.
```sh
npm run swagger
```
### Check http://localhost:8080/docs

## `test`
Runs the tests for the product service.
```sh
npm run test
```
