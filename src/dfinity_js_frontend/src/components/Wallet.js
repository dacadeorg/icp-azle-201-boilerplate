import React from "react";
import { Dropdown, Stack } from "react-bootstrap";


const Wallet = ({ balance, isAuthenticated, iiLogout }) => {
  if (isAuthenticated) {
    const symbol= "LICP"
    const principal = window.auth.principalText;

    

    // const getBalance = useCallback(async () => {
    //   console.log(`💲 getBalance`);

    //   if (isAuthenticated) {
    //     const newBalance = await principalBalance();
    //     console.log(`oldBalance: ${balance}. newBalance. ${newBalance}`);

    //     setBalance(newBalance);
    //   }
    // }, [principalBalance]);

    console.log(`✈ wallet setup complete`);

    // useEffect(() => {
      
    // });    

    return (
      <>
        <Dropdown>
          <Dropdown.Toggle
            variant="light"
            align="end"
            id="dropdown-basic"
            className="d-flex align-items-center border rounded-pill py-1"
          >
            {balance} <span className="ms-1"> {symbol}</span>
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-lg border-0">
            <Dropdown.Item>
              <Stack direction="horizontal" gap={2}>
                <i className="bi bi-person-circle fs-4" />
                <span className="font-monospace">{principal}</span>
              </Stack>
            </Dropdown.Item>

            <Dropdown.Divider />

            <Dropdown.Item
              as="button"
              className="d-flex align-items-center"
              onClick={() => {
                iiLogout();
              }}
            >
              <i className="bi bi-box-arrow-right me-2 fs-4" />
              Logout
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </>
    );
  }

  return null;
};

export default Wallet;
