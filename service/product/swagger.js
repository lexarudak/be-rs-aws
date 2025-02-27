const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');

const app = express();

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(8080, () => {
  console.log('Swagger is running on http://localhost:8080/docs');
});