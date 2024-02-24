import React, { useCallback, useEffect, useState } from "react";
import { Container, Nav } from "react-bootstrap";
import "./App.css";
import coverImg from "./assets/img/sandwich.jpg"
//
import { login, logout as destroy } from "./utils/auth";
import { balance as principalBalance } from "./utils/ledger";
//
import Products from "./components/marketplace/Products";
import Wallet from "./components/Wallet";
import Cover from "./components/utils/Cover";
import { Notification } from "./components/utils/Notifications";


const App = function AppWrapper() {
  const isAuthenticated = window.auth.isAuthenticated; 
  const principal = window.auth.principalText;

  const [balance, setBalance] = useState("0");

  const getBalance = useCallback(async () => {
    if (isAuthenticated) {
      setBalance(await principalBalance());
    }
  });

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  return (
      <>
        <Notification />

        {isAuthenticated ? (
          <Container fluid="md">
            <Nav className="justify-content-end pt-3 pb-5">
              <Nav.Item>
                <Wallet
                  principal={principal}
                  balance={balance}
                  symbol={"LICP"}
                  isAuthenticated={isAuthenticated}
                  destroy={destroy}
                />
              </Nav.Item>
            </Nav>
            <main>
              <Products />
            </main>
          </Container>
        ) 
        : ( <Cover name="Street Food" login={login} coverImg={coverImg} />)}

        <h1 className="text-center">ICP 201 Boilerplate</h1>
      </>
  );
};

export default App;
