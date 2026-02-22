import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { useStore } from '../store/useStore';
import { onError } from "@apollo/client/link/error";

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) console.log("GraphQL errors", graphQLErrors);
  if (networkError) console.log("Network error", networkError);
});

const httpLink = createHttpLink({
  uri: 'http://192.168.29.69:5000/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = useStore.getState().token;
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: errorLink.concat(authLink.concat(httpLink)),
  cache: new InMemoryCache(),
});

export default client;
