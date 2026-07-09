import type { FastifyInstance } from 'fastify';
import { authenticate } from '../../plugins/authenticate.js';
import { askDocument, getChatHistory } from './chat.service.js';

export const chatRoutes = async (app: FastifyInstance): Promise<void> => {
  app.addHook('preHandler', authenticate);

  // Streams the answer back using server-sent events
  app.post('/:id/ask', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { question } = req.body as { question: string };

    if (!question) {
      return reply.status(400).send({ message: 'question is required' });
    }

    let headersSent = false;

    try {
      await askDocument({
        userId:     req.user.id,
        documentId: id,
        question,
        onToken: (token: string) => {
          if (!headersSent) {
            reply.raw.writeHead(200, {
              'Content-Type':      'text/event-stream',
              'Cache-Control':     'no-cache',
              'Connection':        'keep-alive',
              'X-Accel-Buffering': 'no',
            });
            headersSent = true;
          }
          reply.raw.write(`data: ${JSON.stringify({ token })}\n\n`);
        },
        onComplete: (chatId: string, chunks: unknown) => {
          if (!headersSent) {
            reply.raw.writeHead(200, {
              'Content-Type':      'text/event-stream',
              'Cache-Control':     'no-cache',
              'Connection':        'keep-alive',
              'X-Accel-Buffering': 'no',
            });
            headersSent = true;
          }
          reply.raw.write(`data: ${JSON.stringify({ done: true, chatId, chunks })}\n\n`);
          reply.raw.end();
        },
      });
    } catch (err: any) {
      console.error('Error in askDocument stream:', err);
      if (!headersSent) {
        const statusCode = err.statusCode || 500;
        return reply.status(statusCode).send({ message: err.message || 'Internal Server Error' });
      } else {
        reply.raw.write(`data: ${JSON.stringify({ error: err.message || 'Stream error occurred' })}\n\n`);
        reply.raw.end();
      }
    }
  });

  app.get('/:id/chats', async (req, reply) => {
    const { id } = req.params as { id: string };
    const history = await getChatHistory(req.user.id, id);
    return reply.send(history);
  });
};
