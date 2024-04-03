import React from 'react';
import './App.css';
import { Container } from "react-bootstrap";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import PaymentForm from "./Store/paiment";

function App() {
    return (
        <Router>
            <Container className="mb-4">
                <Routes>
                    <Route path="/payment" element={<PaymentForm />} />
                </Routes>
            </Container>
        </Router>
    );
}

export default App;
