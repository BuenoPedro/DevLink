import { Router } from 'express';
import { myConnections, myRequests, requestConnection, respondConnection } from '../controllers/connections.controller';
import { requireAuth } from '../middlewares/auth';

const r = Router();

r.post('/', requireAuth, requestConnection);
r.post('/:id/respond', requireAuth, respondConnection);
r.get('/me', requireAuth, myConnections);
r.get('/me/requests', requireAuth, myRequests);

export default r;
