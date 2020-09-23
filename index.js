import { typeDefs } from './graphql-schema'
import {ApolloServer, PubSub, SchemaDirectiveVisitor} from 'apollo-server'
import neo4j from 'neo4j-driver'
import { makeAugmentedSchema } from 'neo4j-graphql-js'
import dotenv from 'dotenv'
// import { IsPublishedDirective } from "./directives";
import {DirectiveLocation, GraphQLDirective} from "graphql";

// set environment variables from .env
dotenv.config()


const driver = neo4j.driver(
  process.env.NEO4J_URI || 'bolt://localhost:7687',
  neo4j.auth.basic(
    process.env.NEO4J_USER || 'neo4j',
    process.env.NEO4J_PASSWORD || 'localgraph'
  ),
  {
    encrypted: process.env.NEO4J_ENCRYPTED ? 'ENCRYPTION_ON' : 'ENCRYPTION_OFF',
  }
)

const pubsub = new PubSub();

export class SubscribeDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    field.subscribe = () => pubsub.asyncIterator(field.name);
  }

  visitObject(object) {
    return super.visitObject(object);
  }
}

export class PublishDirective extends SchemaDirectiveVisitor {
  visitFieldDefinition(field) {
    const { to } = this.args;
    const { resolve } = field;
    field.resolve = (...args) => {
      const data = resolve.apply(this, args);
      pubsub.publish(to, { [to]: data });
      return data;
    };
  }

  visitObject(object) {
    const { to } = this.args;
    const fields = object.getFields();
    Object.keys(fields).forEach((fieldName) => {
      const field = fields[fieldName];
      const next = field.resolve;

      field.resolve = (result, args, context, info) => {
        pubsub.publish(to, {[to]: result})
        return next(result, args, context, info);
      }
    })
  }
}

const augmentedSchema = makeAugmentedSchema({
  typeDefs,
  schemaDirectives: {
    subscribe: SubscribeDirective,
    publish: PublishDirective

  },
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
  playground: true,
})

server.listen().then(({ url })=> {
  console.log(`GraphQL server ready at ${url}`)
})