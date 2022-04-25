import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const StyledButton = styled.button`
  background: rgb(214, 123, 90);
  font-weight: 800;
  border: 4px solid rgb(2, 30, 52);
  box-shadow: rgb(2 30 52) 4px 4px 0px;
  border-radius: 16px;
  color: rgb(2, 30, 52);
  cursor: pointer;
  animation: 1s ease 0s infinite normal none running cursor;
  overflow: hidden;
  width: 100%;
  height: 60px;
  position: relative;
  transition: box-shadow 0.1s ease-in-out 0s, transform 0.1s ease-in-out 0s;
`;

export const SwapContainer = styled.div`
  border: 1px solid;
  padding: 50px;
  height: 600px;
  width: 500px;
  border-radius: 56px;
  background: rgb(22, 56, 97);
`;
