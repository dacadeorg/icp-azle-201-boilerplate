import React, { useCallback, useEffect, useState } from "react";
import { Container, Nav } from "react-bootstrap";
import "./App.css";
import coverImg from "./assets/img/sandwich.jpg"
//
import { balance as principalBalance } from "./utils/ledger";
import { login as iiLogin, logout as iiLogout } from "./utils/auth";
//
import Products from "./components/marketplace/Products";
import Wallet from "./components/Wallet";
import Cover from "./components/utils/Cover";
import { Notification } from "./components/utils/Notifications";


const App = function AppWrapper() {
  const isAuthenticated = window.auth.isAuthenticated; 
  const [balance, setBalance] = useState("0");

  console.log(`▶ App()`);
  
  // refresh balance
  // useEffect(() =>{
  // }, [])

  if (isAuthenticated) {
    console.log(`💲 updating balance`);
    principalBalance().then((updatedBalance) => setBalance(updatedBalance));
  }

  return (
      <>
        <Notification />

        {isAuthenticated ? (
          <Container fluid="md">
            <Nav className="justify-content-end pt-3 pb-5">
              <Nav.Item>
                <Wallet
                  balance={balance}
                  isAuthenticated={isAuthenticated}
                  iiLogout={iiLogout}
                />                
              </Nav.Item>
            </Nav>
            <main>
              <Products />
            </main>
          </Container>
        ) 
        : ( <Cover title="Street Food" login={iiLogin} coverImg={coverImg} />)}
      </>
  );
};

export default App;
