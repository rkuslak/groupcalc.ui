const SOCKET_URL: string = "ws://" + process.env.REACT_APP_WEBSOCKET_PATH
const PING_INTERVAL_IN_SECONDS: number = 10;

export interface Calculation {
    Result: string,
    User: string,
    Time: Date | string | null | undefined,
}

export enum ClientMessageType {
    OK = "OK",
    ERROR = "ERROR",
    RESULTS = "RESULTS",
    REFRESH = "REFRESH",
    PING = "PING",
    PONG = "PONG",
    CALCULATION = "CALCULATION",
}

export type ClientMessageTypes = "OK" | "ERROR" | "RESULTS" | "REFRESH" | "PING" | "PONG" | "CALCULATION"

export type CalculationArray = Calculation[] | null;

export interface ClientMessage {
    type: string
    message: string | null
    calculations: Calculation[] | null
}

export type ClientMessageCallback = (msg: ClientMessage) => void;

export default class WebsocketConection {
    socket: WebSocket;
    updateCallback: ClientMessageCallback[] = [];
    lastMessage: ClientMessage | null;
    lastResults: Calculation[] = [];
    lastPing: Date | null = null;

    constructor(callback: ClientMessageCallback | null = null, socket_url?: string) {
        var url = SOCKET_URL;
        this.lastMessage = null;

        this.socket = new WebSocket(socket_url || SOCKET_URL);
        console.log("Opening websocket connection to ", url);

        this.socket.onopen = (connection) => {
            this.refresh();
            setInterval(() => {
                this.ping();
            }, 1000 * PING_INTERVAL_IN_SECONDS);
            console.log("Websocket connection opened successfully.");
        };
        this.socket.onclose = () => { console.log("Websocket connection closed."); };
        this.socket.onmessage = (msg: MessageEvent) => { this.messageHandler(msg); }

        // Set up heart beat handlers:

        callback && this.addCallback(callback);
    }

    public onHeartbeatResponse() {
        console.log("Ping reply recieved")
    }

    public refresh() {
        const json = JSON.stringify({ type: "REFRESH" });
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(json);
        }
    }

    public addCallback(callback: ClientMessageCallback) {
        this.updateCallback.push(callback);
        if (this.socket.readyState === WebSocket.OPEN) {
            this.refresh();
        }
    }


    private messageHandler(msg: MessageEvent) {
        const data = JSON.parse(msg.data);

        // Respond instantly to ping requests from the endpoint
        // TODO: Timeout ping if no response recieved
        if (data && data.type && data.type === "PING") {
            const json = JSON.stringify({type: "PONG"})
            this.socket.send(json);
            return;
        }

        if (data && data.type && data.type === "PONG") {
            let responseTime = 0;

            if (this.lastPing) {
                responseTime = new Date().getTime() - this.lastPing.getTime();
            }
            console.log(responseTime, "ms - Ping reply received");
            this.lastPing = null;
            return;
        }

        this.lastMessage = data;
        this.lastResults = data.calculations || this.lastResults;
        this.updateCallback.forEach(callback => callback(data));
    }

    private ping() {
        if (!this.socket) return;

        // TODO: Handle timeout if last ping not replied to?
        this.lastPing = new Date();

        let msg: ClientMessage = {
            type: "PING",
            message: null,
            calculations: null,
        };
        let payload = JSON.stringify(msg);

        console.log("Sending ping...")
        this.socket.send(payload);
    }

    public sendCalculation(message: string) {
        const json = JSON.stringify({ type: "CALCULATION", message });
        this.socket.send(json);
    }
}

