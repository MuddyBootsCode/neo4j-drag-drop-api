// import { SchemaDirectiveVisitor, PubSub } from 'apollo-server';
// import { DirectiveLocation, GraphQLDirective } from 'graphql';
//
// export class IsPublishedDirective extends SchemaDirectiveVisitor {
//   static getDirectiveDeclaration(directiveName, schema) {
//     return new GraphQLDirective({
//       name: 'isPublished',
//       locations: [DirectiveLocation.FIELD_DEFINITION, DirectiveLocation.OBJECT]
//     });
//   }
//
//   visitObject(obj) {
//     const fields = obj.getFields();
//
//     Object.keys(fields).forEach((fieldName) => {
//       const field = fields[fieldName];
//       const next = field.resolve;
//
//       field.resolve = (result, args, context, info) => {
//         // console.log(args, ' Args')
//         console.log(context.req.body)
//         console.log(result, ' Result')
//         console.log(info, ' info')
//         return next(result, args, context, info);
//       }
//     })
//   }
//
//   visitFieldDefinition(field) {
//     const next = field.resolve;
//     console.log(field.astNode.type);
//
//     field.resolve = function(result, args, context, info) {
//       // console.log(result);
//       // console.log(args);
//       // console.log(context);
//       // console.log(info);
//       return next(result, args, context, info);
//     };
//   }
// }