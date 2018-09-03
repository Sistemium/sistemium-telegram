import debugLib from 'debug';

const { DEBUG_NAMESPACE = 'stm:tgb' } = process.env;
const { ERROR_NAMESPACE = 'laa:tgb:error' } = process.env;

export default function (ns) {

  return {
    debug: debug(ns),
    error: error(ns),
  };

}

export function debug(ns) {

  const log = debugLib(`${DEBUG_NAMESPACE}:${ns}`);
  // eslint-disable-next-line
  log.log = console.log.bind(console);
  return log;

}

export function error(ns) {

  return debugLib(`${ERROR_NAMESPACE}:${ns}`);

}
