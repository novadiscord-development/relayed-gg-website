import PusherClient from "pusher-js";

let pusherClient;

export function getPusherClient() {
  if (!pusherClient) {
    pusherClient = new PusherClient(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
      forceTLS: true,
    });
  }

  return pusherClient;
}

export function getPusherConnectionState() {
  return pusherClient?.connection?.state || "initialized";
}

export function disconnectPusherClient() {
  if (!pusherClient) return;

  pusherClient.disconnect();
  pusherClient = null;
}
