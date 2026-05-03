import { createYoga, createSchema, YogaInitialContext } from 'graphql-yoga';
import { typeDefs } from '@/graphql/schema';
import { resolvers } from '@/graphql/resolvers';
import { createContext, GraphQLContext } from '@/graphql/context';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const { handleRequest } = createYoga<NextRequest, GraphQLContext>({
  schema: createSchema<NextRequest & YogaInitialContext & GraphQLContext>({
    typeDefs,
    resolvers,
  }),
  context: createContext,
  graphqlEndpoint: '/api/graphql',
  fetchAPI: { Response },
});

export async function GET(request: NextRequest) {
  return handleRequest(request, {} as any);
}

export async function POST(request: NextRequest) {
  return handleRequest(request, {} as any);
}

export async function OPTIONS(request: NextRequest) {
  return handleRequest(request, {} as any);
}
