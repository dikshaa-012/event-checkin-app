import { type FC } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import client from './graphql/client';
import LoginScreen from './screens/LoginScreen';
import EventListScreen from './screens/EventListScreen';
import EventDetailScreen from './screens/EventDetailScreen';
import AdminPanelScreen from './screens/AdminPanelScreen';
import PublicEventScreen from './screens/PublicEventScreen';
import MyEventsScreen from './screens/MyEventsScreen';
import ProfileScreen from './screens/ProfileScreen';
import { useStore } from './store/useStore';
import { PREVIEW_MODE } from './preview';
import './styles/App.css';

const queryClient = new QueryClient();

const App: FC = () => {
  const user = useStore((s) => s.user);
  const isAuthenticated = PREVIEW_MODE || user !== null;

  return (
    <ApolloProvider client={client}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginScreen />} />
            <Route path="/events" element={isAuthenticated ? <EventListScreen /> : <Navigate to="/login" />} />
            <Route path="/event/:eventId" element={isAuthenticated ? <EventDetailScreen /> : <Navigate to="/login" />} />
            <Route path="/events/:eventId" element={isAuthenticated ? <EventDetailScreen /> : <Navigate to="/login" />} />
            <Route path="/my-events" element={isAuthenticated ? <MyEventsScreen /> : <Navigate to="/login" />} />
            <Route path="/profile" element={isAuthenticated ? <ProfileScreen /> : <Navigate to="/login" />} />
            <Route path="/public/:slug" element={<PublicEventScreen />} />
            <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminPanelScreen /> : <Navigate to="/events" />} />
            <Route path="/" element={<Navigate to="/events" />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ApolloProvider>
  );
};

export default App;
