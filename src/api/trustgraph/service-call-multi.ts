// Constant defining the delay before attempting to reconnect a WebSocket
// (2 seconds)
export const SOCKET_RECONNECTION_TIMEOUT = 2000;

export class ServiceCallMulti {
  constructor(
    mid: string,
    msg: RequestMessage,
    success: (resp: Response) => void,
    error: (err: Error) => void,
    timeout: number,
    retries: number,
    socket: Socket,
    receiver,
  ) {
    this.mid = mid;
    this.msg = msg;
    this.success = success;
    this.error = error;
    this.timeout = timeout;
    this.retries = retries;
    this.socket = socket;
    this.complete = false;
    this.receiver = receiver;
  }

  mid: string;
  success: (resp: object) => void; // FIXME: any
  error: (err: object | string) => void; // FIXME: any
  timeoutId: Timeout;
  timeout: number;
  retries: number;
  socket: Socket;
  complete: boolean;

  start() {
    this.socket.inflight[this.mid] = this;
    this.attempt();
  }

  onReceived(resp: object) {
    if (this.complete == true)
      console.log(this.mid, "should not happen, request is already complete");

    const fin = this.receiver(resp);

    if (fin) {
      this.complete = true;

      //        console.log("Received for", this.mid);
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
      delete this.socket.inflight[this.mid];
      this.success(resp);
    }
  }

  onTimeout() {
    if (this.complete == true)
      console.log(
        this.mid,
        "timeout should not happen, request is already complete",
      );

    console.log("Request", this.mid, "timed out");
    clearTimeout(this.timeoutId);
    this.attempt();
  }

  attempt() {
    //        console.log("attempt:", this.mid);

    if (this.complete == true)
      console.log(
        this.mid,
        "attempt should not be called, request is already complete",
      );

    this.retries--;

    if (this.retries < 0) {
      console.log("Request", this.mid, "ran out of retries");

      clearTimeout(this.timeoutId);
      delete this.socket.inflight[this.mid];

      this.error("Ran out of retries");
      return; // Exit early - no more attempts
    }

    // Check if WebSocket connection is available and ready
    if (this.socket.ws && this.socket.ws.readyState === WebSocket.OPEN) {
      try {
        this.socket.ws.send(JSON.stringify(this.msg));
        this.timeoutId = setTimeout(this.onTimeout.bind(this), this.timeout);

        return;
      } catch (e) {
        console.log("Error:", e);
        console.log("Message send failure, retry...");

        // Calculate backoff delay with jitter
        const backoffDelay = Math.min(
          SOCKET_RECONNECTION_TIMEOUT * Math.pow(2, 3 - this.retries) +
            Math.random() * 1000,
          30000, // Max 30 seconds
        );

        this.timeoutId = setTimeout(this.attempt.bind(this), backoffDelay);

        console.log("Reopen...");
        // Attempt to reopen the WebSocket connection
        this.socket.reopen();
      }
    } else {
      // No WebSocket connection available or not ready
      // Check if socket is connecting
      if (
        this.socket.ws &&
        this.socket.ws.readyState === WebSocket.CONNECTING
      ) {
        // Wait a bit longer for connection to establish
        setTimeout(this.attempt.bind(this), 500);
      } else {
        // Socket is closed or closing, trigger reopen
        console.log("Socket not ready, reopening...");
        this.socket.reopen();

        // Calculate backoff delay
        const backoffDelay = Math.min(
          SOCKET_RECONNECTION_TIMEOUT * Math.pow(2, 3 - this.retries) +
            Math.random() * 1000,
          30000,
        );

        setTimeout(this.attempt.bind(this), backoffDelay);
      }
    }
  }
}
