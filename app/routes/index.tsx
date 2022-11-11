import { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { useOptionalUser } from "~/utils";
import indexStylesUrl from "../styles/index.css";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: indexStylesUrl }];
};

export default function Index() {
  const user = useOptionalUser();
  return (
    <main className="wrapper">
      <header className="header">
        <Link to="/" className="header-link">
          ZHAOXNI
        </Link>
        <nav className="nav">
          <div className="nav-entry">
            <div className="nav-entry-bg">
              <span>Info</span>
            </div>
          </div>
          <div className="nav-entry">
            <div className="nav-entry-bg">
              <span>Portfolio</span>
            </div>
          </div>
          <div className="nav-entry">
            <div className="nav-entry-bg">
              <span>Contact</span>
            </div>
          </div>
        </nav>
      </header>
      <div id="Info" className="section">
        <div className="container">
          <h2>Info</h2>
        </div>
      </div>
    </main>
  );
}
