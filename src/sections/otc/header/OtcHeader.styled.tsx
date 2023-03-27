import styled from "@emotion/styled"
import { theme } from "theme"

export const SHeader = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  aligh-items: start;

  padding: 15px 12px;
  margin: -15px -12px 0;

  background: rgba(0, 5, 35, 0.2);

  @media (${theme.viewport.gte.sm}) {
    flex-direction: row;
    aligh-items: center;

    padding-bottom: 0 0 16px 0;

    background: transparent;
  }
`

export const STabs = styled.div`
  font-family: "ChakraPetch";
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 130%;
  color: #cccdd3;
  display: none;

  input[type="radio"] {
    position: absolute;
    left: -200vw;
  }

  label {
    position: relative;
    display: inline-block;
    padding: 15px 15px 15px;
    border-bottom: 0;
    cursor: pointer;
    font-weight: 600;
    opacity: 0.6;
  }

  label:hover,
  input:focus + label {
    color: #fff;
    opacity: 1;
  }

  label:hover::after {
    background: #fff;
    opacity: 1;
  }

  input:checked + label {
    opacity: 1;
    color: #fff;
  }

  input:checked + label::after {
    content: "";
    position: absolute;
    left: 15px;
    bottom: 10px;
    width: 22px;
    height: 4px;
    background: #85d1ff;
  }

  @media (${theme.viewport.gte.sm}) {
    display: flex;
    margin-left: -13px;
  }
`
