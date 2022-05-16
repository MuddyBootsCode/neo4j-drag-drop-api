import { typeDefs } from './graphql-schema'
import {ApolloServer} from 'apollo-server'
import neo4j from 'neo4j-driver'
import { makeAugmentedSchema } from 'neo4j-graphql-js'
import dotenv from 'dotenv'

// set environment variables from .env
dotenv.config()

const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'localgraph'
  ),
  {
    encrypted: process.env.NEO4J_ENCRYPTED
  }
)

const augmentedSchema = makeAugmentedSchema({
  typeDefs,
  config: {
    auth: {
      isAuthenticated: true,
    }
  }
})


const server = new ApolloServer({
  context: ({ req }) => {
    return { req, driver, neo4jDatabase: process.env.NEO4J_DATABASE }
  },
  schema: augmentedSchema,
  introspection: true,
  playground: true
})

const port = process.env.GRAPHQL_SERVER_PORT || 4000

server.listen({port}, () => {
  console.log(`GraphQL server ready at http://localhost:${port}`)
});