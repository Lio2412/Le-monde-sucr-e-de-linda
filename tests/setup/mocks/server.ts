import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// Configuration du serveur MSW avec nos handlers
export const server = setupServer(...handlers);

// Assurez-vous que le serveur gère les erreurs non interceptées
server.events.on('unhandled-request', ({ method, url }) => {
  console.error(`[MSW] Requête non gérée ${method} ${url}`);
}); 