/* const SOCKET_URL: string = process.env.NODE_ENV === "production" ? "ws://ronkuslak.com/ws_groupcalc/" : "ws://localhost/ws_groupcalc/"; */
const SOCKET_URL: string = "ws://" + window.location.hostname + "/ws_groupcalc/";

export interface ClientMessage {
    type: string
    message: string | null
    calculations: string[] | null
}

export type ClientMessageCallback = (msg: ClientMessage) => void;

export default class WebsocketConection {
    socket: WebSocket;
    updateCallback: ClientMessageCallback[] = [];
    lastMessage: ClientMessage | null;
    lastResults: string[] = [];

    constructor(callback: ((msg: MessageEvent) => void) | null = null) {
        var url = SOCKET_URL;
        this.lastMessage = null;
        this.socket = new WebSocket(SOCKET_URL);
        console.log("Opening websocket connection to ", url);

        this.socket.onopen = () => {
            this.refresh();
            console.log("Websocket connection opened successfully.");
        };
        this.socket.onclose = () => { console.log("Websocket connection closed."); };
        this.socket.onmessage = (msg: MessageEvent) => { this.messageHandler(msg); }
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
        if (data.type === "PING") {
            const json = JSON.stringify({type: "PONG"})
            this.socket.send(json);
            return;
        }

        this.lastMessage = data;
        this.lastResults = data.calculations || this.lastResults;
        this.updateCallback.forEach(callback => callback(data));
    }

    public sendCalculation(message: string) {
        const json = JSON.stringify({ type: "CALCULATION", message });
        this.socket.send(json);
    }
}

