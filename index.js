const { Neo4jGraphQL } = require("@neo4j/graphql");
const { ApolloServer, gql } = require("apollo-server");
const neo4j = require("neo4j-driver");
const fs = require("fs");
const path = require("path")
const dotenv = require("dotenv")

dotenv.config();


// (You may need to replace your connection details, username and password)
const AURA_ENDPOINT = 'bolt://localhost:7687';
const USERNAME = process.env.NEO4J_USER;
const PASSWORD = process.env.NEO4J_PWD;

// Create Neo4j driver instance
const driver = neo4j.driver(AURA_ENDPOINT, neo4j.auth.basic(USERNAME, PASSWORD));

const typeDefs = fs
  .readFileSync(path.join(__dirname, "schema.graphql"))
  .toString("utf-8")

// Create instance that contains executable GraphQL schema from GraphQL type definitions
const neo4jGraphQL = new Neo4jGraphQL({
  typeDefs,
  driver
});

// Generate schema
neo4jGraphQL.getSchema().then((schema) => {
  // Create ApolloServer instance to serve GraphQL schema
  const server = new ApolloServer({
    schema,
    context: { driverConfig: { database: 'neo4j' } }
  });

  // Start ApolloServer
  server.listen().then(({ url }) => {
    console.log(`GraphQL server ready at ${url}`);
  });
});
