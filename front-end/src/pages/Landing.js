<<<<<<< Updated upstream
=======
// src/pages/Landing.js
import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
>>>>>>> Stashed changes
import { useNavigate } from "react-router-dom";

function Landing() {
  const navigate = useNavigate();

  const handleClick = () => {
    // TODO: 可在这里发请求到 Flask API，然后 navigate
    navigate("/result");
  };

  return (
    <div>
      <h1>Main Page</h1>
      <button onClick={handleClick}>Go to Result</button>
    </div>
  );
}

export default Landing;
