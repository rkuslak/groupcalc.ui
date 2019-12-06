import 'bootstrap/dist/css/bootstrap.min.css';

import React, { useState, useEffect } from 'react';
import { Navbar, Row, Col, Container, Table, Nav } from "react-bootstrap";

import WebsocketConnection, { ClientMessage } from "Websocket";
import CalculationInput from "CalculationInput";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faLinkedin, faGithubSquare } from '@fortawesome/free-brands-svg-icons';

import 'App.css';

export const ws: WebsocketConnection = new WebsocketConnection()

function ResultsList() {
    const [calculations, setCalculations] = useState(ws.lastResults);

    useEffect(() => {
        function websocketUpdate(msg: ClientMessage) {
            var { type, calculations } = msg;
            if (type === "RESULTS") {
                calculations = calculations || [];
                console.log(calculations)
                setCalculations(calculations);
            }
        }
        ws.addCallback(websocketUpdate);
    }, [])

    return (
        <Table striped={true} bordered={true} variant="dark">
            <thead>
                <th>Calculation</th>
                <th>By</th>
                <th>At</th>
            </thead>
            <tbody>
                {
                    calculations.reverse().map((calc, index) => (
                        <tr key={"calculation" + index}>
                            <td>{calc.Result}</td>
                            <td>{calc.User}</td>
                            <td>{calc.Time}</td>
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
            <Navbar bg="dark" variant="dark">
                <Navbar.Brand>RonKuslak.com - Group Calc</Navbar.Brand>
                <Nav className="mr-auto">
                    <Nav.Link href="/">Home</Nav.Link>
                    <Nav.Link href="/resume">Resume</Nav.Link>
                </Nav>
                <Nav className="h3">
                    <Nav.Link href="https://linkedin/in/ronkuslak">
                        <FontAwesomeIcon icon={faLinkedin}></FontAwesomeIcon>
                    </Nav.Link>
                    <Nav.Link href="https://github.com/rkuslak">
                        <FontAwesomeIcon icon={faGithubSquare}></FontAwesomeIcon>
                    </Nav.Link>
                </Nav>
            </Navbar>
            <Container fluid={true} style={{marginTop: "6px"}}>
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
