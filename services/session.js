import RedisSession from 'telegraf-session-redis';
import { getAsync, setAsync } from './redis';
import log from './log';

const { debug, error } = log('session');

export default function ({ botId }) {

  const session = new RedisSession({
    store: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: process.env.REDIS_PORT || 6379,
      db: process.env.REDIS_DB || 0,
      enable_offline_queue: false,
    },
    getSessionKey: ctx => ctx.from && sessionKey(botId, ctx.from.id),
  });

  const { client } = session;

  client.on('connect', () => {
    debug('Redis connected');
  });

  client.on('error', e => {
    error('Redis', e.name, e.message);
  });

  return session;

}


export function sessionKey(botId, userId) {
  return `session_${botId}_${userId}`;
}

export function getSession(botId, userId) {
  return getAsync(sessionKey(botId, userId))
    .then(json => (json ? JSON.parse(json) : {}));
}


export function setSession(botId, userId, sessionData = {}) {
  return setAsync(sessionKey(botId, userId), JSON.stringify(sessionData));
}
