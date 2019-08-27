import React, { useState, useEffect } from "react";
import { Form, InputGroup, FormControl, Button } from "react-bootstrap";

import { ws } from "@/App";
import { ClientMessage } from "@/Websocket";

export default function CalculationInput(props: any) {
    const [calculation, setCalculation] = useState("");
    const [error, setError] = useState("");

    const onSubmit = (event: any) => {
        setError("")

        if (event && event.preventDefault) { event.preventDefault(); }
        if (calculation) { ws.send(calculation); }

        setCalculation("");
    }

    function onChange(e: any) {
        setError("");
        setCalculation(e.target.value);
    }

    useEffect(() => {
        function websocketUpdate(msg: ClientMessage) {
            var { type, message } = msg;
            if (type === "ERROR" && message) { setError(message); }
        }

        ws.addCallback(websocketUpdate);
    }, [])

    return (
        <>
            <Form onSubmit={onSubmit}>
                <InputGroup>
                    <FormControl placeholder="Calculation" onSubmit={onSubmit} value={calculation} onChange={onChange}>
                    </FormControl>
                    <Button type="submit" variant="outline-dark">=</Button>
                </InputGroup>
            </Form>
            <p className="text-danger">{error}</p>
        </>
    );
}
