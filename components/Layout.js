import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Router from 'next/router';
import { isAuth, logout } from '../helpers/auth';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

Router.events.on('routeChangeStart', () => NProgress.start());
Router.events.on('routeChangeError', () => NProgress.done());
Router.events.on('routeChangeComplete', () => NProgress.done());

const Layout = ({ children }) => {
  const [user, setAuthUser] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAuthUser(isAuth());
    }
  }, []);
  const head = () => (
    <React.Fragment>
      <link
        rel="stylesheet"
        href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css"
        integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm"
        crossOrigin="anonymous"
      />
      <link rel="stylesheet" href="/static/css/styles.css" />
    </React.Fragment>
  );
  // ms-auto to float in bootstrap 5
  const nav = () => (
    <ul className="nav nav-tabs bg-primary bg-gradient">
      <li className="nav-item">
        <Link href="/" className="nav-link text-white">
          Home
        </Link>
      </li>
      <li className="nav-item">
        <Link href="/user/link/create" className="nav-link text-white btn btn-warning" style={{ borderRadius: '0px' }}>
          Submit a link
        </Link>
      </li>
      {process.browser && !user && (
        <React.Fragment>
          <li className="nav-item">
            <Link href="/login" className="nav-link text-white">
              Login
            </Link>
          </li>
          <li className="nav-item">
            <Link href="/register" className="nav-link text-white">
              Register
            </Link>
          </li>
        </React.Fragment>
      )}
      {process.browser && user && user.role === 'admin' && (
        <li className="nav-item ml-auto">
          <Link href="/admin" className="nav-link text-white">
            {isAuth().name}
          </Link>
        </li>
      )}
      {process.browser && user && user.role === 'subscriber' && (
        <li className="nav-item ml-auto">
          <Link href="/user" className="nav-link text-white">
            {isAuth().name}
          </Link>
        </li>
      )}
      {process.browser && user && (
        <li className="nav-item">
          <Link href="/" onClick={logout} className="btn nav-link text-white">
            Logout
          </Link>
        </li>
      )}
    </ul>
  );

  return (
    <React.Fragment>
      {head()} {nav()} <div className="container pt-5 pb-5">{children}</div>
    </React.Fragment>
  );
};

export default Layout;
