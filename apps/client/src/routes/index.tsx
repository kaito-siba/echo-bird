import { createFileRoute } from "@tanstack/react-router";
import {
  containerStyle,
  headerStyle,
  logoStyle,
  linkStyle,
} from "../styles/index.css";
import logo from "../logo.svg";

export const Route = createFileRoute("/")({
  component: App,
});

function App() {
  return (
    <div className={containerStyle}>
      <header className={headerStyle}>
        <img src={logo} className={logoStyle} alt="logo" />
        <p>
          Edit <code>src/routes/index.tsx</code> and save to reload.
        </p>
        <a
          className={linkStyle}
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <a
          className={linkStyle}
          href="https://tanstack.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn TanStack
        </a>
      </header>
    </div>
  );
}
