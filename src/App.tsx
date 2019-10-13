import React, { useState, useEffect } from 'react';
import { Navbar, Row, Col, Container, Table } from "react-bootstrap";

import WebsocketConnection, { ClientMessage } from "Websocket";
import CalculationInput from "CalculationInput";
import 'App.css';


export const ws: WebsocketConnection = new WebsocketConnection()

function ResultsList() {
    const [calculations, setCalculations] = useState(ws.lastResults);

    useEffect(() => {
        function websocketUpdate(msg: ClientMessage) {
            var { type, calculations } = msg;
            if (type === "RESULTS") {
                calculations = calculations || [];
                setCalculations(calculations);
            }
        }
        ws.addCallback(websocketUpdate);
    }, [])

    var index = calculations.length;
    var keyedCalcs = calculations.map(calc => {
        return {
            key: index--,
            result: calc
        };
    })
    return (
        <Table striped={true} bordered={true}>
            <tbody>
                {
                    keyedCalcs.reverse().map((calc) => (
                        <tr>
                            <td key={calc.key}>{calc.result}</td>
                        </tr>
                    ))
                }
            </tbody>
        </Table>
    )
}

export default function App() {
    return (
        <>
            <Navbar bg="light" expand="lg">
                <Navbar.Brand>Group Calc</Navbar.Brand>
            </Navbar>
            <Container>
                <Row>
                    <Col xs={{ order: 2, span: 12 }} md={{ order: 1, span: 6 }} >
                        <h3>Current calculations</h3>
                        <ResultsList />
                    </Col>
                    <Col xs={{ order: 1, span: 12 }} md={{ order: 1, span: 6 }}> <CalculationInput /> </Col>
                </Row>
            </Container>
        </>
    );
}
