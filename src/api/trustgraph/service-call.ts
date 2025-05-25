export const SOCKET_RECONNECTION_TIMEOUT = 2000;

export class ServiceCall {
  constructor(
    mid: string,
    msg: RequestMessage,
    success: (resp: Response) => void,
    error: (err: Error) => void,
    timeout: number,
    retries: number,
    socket: Socket,
  ) {
    this.mid = mid;
    this.msg = msg;
    this.success = success;
    this.error = error;
    this.timeout = timeout;
    this.retries = retries;
    this.socket = socket;
    this.complete = false;
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

    this.complete = true;

    //        console.log("Received for", this.mid);
    clearTimeout(this.timeoutId);
    this.timeoutId = null;
    delete this.socket.inflight[this.mid];
    this.success(resp);
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
    }

    if (this.socket.ws) {
      try {
        this.socket.ws.send(JSON.stringify(this.msg));
        this.timeoutId = setTimeout(this.onTimeout, this.timeout);

        return;
      } catch (e) {
        console.log("Error:", e);
        console.log("Message send failure, retry...");

        this.timeoutId = setTimeout(
          this.attempt,
          SOCKET_RECONNECTION_TIMEOUT,
        );

        console.log("Reopen...");
        this.socket.reopen();
      }
    } else {
      setTimeout(this.attempt, SOCKET_RECONNECTION_TIMEOUT);
    }
  }
}
