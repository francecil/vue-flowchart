# vue-flowchart

> A flowchart base on Vue.js project

## Api

### The model

```javascript
{
  nodes: [Node],
  edges: [Edge]
}
```

#### Node
```javascript
{
  id: integer,
  name: string,
  x: integer, // x-coordinate of the node relative to the canvas.
  y: integer, // y-coordinate of the node relative to the canvas.
  connectors: [Connector],
  readonly: boolean
}
```

#### Connector
```javascript
{
  id: integer,
  type: string
}
```

#### Edge
```javascript
{
 source: Connector.id
 destination: Connector.id
 active: boolean
 label:string
}
```

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```

