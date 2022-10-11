import { proxy } from 'valtio/vanilla'
import Store from '../store'
import type { ClusterSubscribeRequestMethods } from '../types/requests'
import { waitForOpenConnection } from './websocket'

export const ClusterFactory = (function () {
  let socket: WebSocket | undefined
  const listeners: Record<number, { callback: (params: any) => void; method: string; id: number }> =
    proxy({})
  const subIdToReqId: Record<number, number> = proxy({})
  async function setSocket() {
    const cluster = Store.getCluster()
    const {endpoint} = cluster
    socket = new WebSocket(endpoint.replace('http', 'ws'))
    await waitForOpenConnection(socket)

    socket.onmessage = ev => {
      const data = JSON.parse(ev.data)

      /*
       * If request is a subscribtion init notification
       * Copy data to new ID (request ID -> Subscribtion ID)
       */
      if (data.id) 
        subIdToReqId[data.result] = data.id
      

      if (data.params?.subscription) {
        console.log('Found subscription', data.params.subscription)
        listeners[subIdToReqId[data.params.subscription]].callback(data.params.result)
      }
    }
  }

  async function registerListener<Method extends keyof ClusterSubscribeRequestMethods>(
    method: Method,
    params: ClusterSubscribeRequestMethods[Method]['params'],
    callback: (params: any) => void
  ) {
    if (!socket) await setSocket()
    const id = Store.getNewRequestId()
    socket!.send(
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

  async function unregisterListener(id: number) {
    const { method } = listeners[id]
    const subscriptionId = Number(
      Object.entries(subIdToReqId).filter(([_, value]) => value === id)[0][0]
    )

    const unsubscribeMethod = method.replace('Subscribe', 'Unsubscribe')

    socket!.send(
      JSON.stringify({
        method: unsubscribeMethod,
        params: [subscriptionId],
        jsonrpc: '2.0',
        id: Store.getNewRequestId()
      })
    )
  }

  return {
    registerListener,
    unregisterListener,
    async getSocket () {
      if (!socket) 
        await setSocket()
      
      
return socket
    }
  }
})()
