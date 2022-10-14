import { proxy } from 'valtio/vanilla'
import { getCluster, getNewRequestId } from '../store'
import type { ClusterSubscribeRequestMethods } from '../types/requests'
import { waitForOpenConnection } from './websocket'

type Listeners = Record<number, { callback: (params: unknown) => void; method: string; id: number }>
let socket: WebSocket | undefined = undefined
const listeners: Listeners = proxy<Listeners>({})
const subIdToReqId: Record<number, number> = proxy<Record<number, number>>({})

export async function setSocket() {
  const cluster = getCluster()
  const { endpoint } = cluster
  socket = new WebSocket(endpoint.replace('http', 'ws'))
  await waitForOpenConnection(socket)

  socket.onmessage = ev => {
    const data = JSON.parse(ev.data)

    /*
     * If request is a subscribtion init notification
     * Copy data to new ID (request ID -> Subscribtion ID)
     */
    if (data.id) subIdToReqId[data.result] = data.id

    if (data.params?.subscription) {
      console.log('Found subscription', data.params.subscription)
      listeners[subIdToReqId[data.params.subscription]].callback(data.params.result)
    }
  }

  return socket
}

export function unregisterListener(id: number) {
  const { method } = listeners[id]
  const subscriptionId = Number(
    Object.entries(subIdToReqId).filter(([_, value]) => value === id)[0][0]
  )

  const unsubscribeMethod = method.replace('Subscribe', 'Unsubscribe')

  if (!socket) throw new Error('Socket not initalized')

  socket.send(
    JSON.stringify({
      method: unsubscribeMethod,
      params: [subscriptionId],
      jsonrpc: '2.0',
      id: getNewRequestId()
    })
  )
}

export async function registerListener<Method extends keyof ClusterSubscribeRequestMethods>(
  method: Method,
  params: ClusterSubscribeRequestMethods[Method]['params'],
  callback: (params: ClusterSubscribeRequestMethods[Method]['returns']) => void
) {
  if (!socket) await setSocket()
  const id = getNewRequestId()

  if (!socket) throw new Error('Socket not initialized')

  socket.send(
    JSON.stringify({
      method,
      params,
      jsonrpc: '2.0',
      id
    })
  )

  listeners[id] = { method, callback, id }

  return id
}
