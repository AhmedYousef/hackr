import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Router from 'next/router';
import axios from 'axios';
import { showSuccessMessage, showErrorMessage } from '../helpers/alerts';
import { authenticate, isAuth } from '../helpers/auth';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API;

const Login = () => {
  const [state, setState] = useState({
    email: '',
    password: '',
    error: '',
    success: '',
    buttonText: 'Login',
  });

  useEffect(() => {
    isAuth() && Router.push('/');
  }, []);

  const { email, password, error, success, buttonText } = state;

  const handleChange = (fieldName) => (e) => {
    setState({ ...state, [fieldName]: e.target.value, error: '', success: '', buttonText: 'Login' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState({ ...state, buttonText: 'Logging in ' });
    try {
      const response = await axios.post(`${API}/login`, {
        email,
        password,
      });
      authenticate(response, () =>
        isAuth() && isAuth().role === 'admin' ? Router.push('/admin') : Router.push('/user'),
      );
    } catch (error) {
      setState({
        ...state,
        buttonText: 'Login',
        error: error.response.data.error,
      });
    }
  };

  const loginForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <input
          required
          value={email}
          onChange={handleChange('email')}
          type="email"
          className="form-control"
          placeholder="Type your Email"
        />
      </div>
      <div className="mb-3">
        <input
          required
          value={password}
          onChange={handleChange('password')}
          type="password"
          className="form-control"
          placeholder="Type your password"
        />
      </div>
      <div className="mb-3">
        <button className="btn btn-outline-primary">{buttonText}</button>
      </div>
    </form>
  );

  return (
    <Layout>
      <div className="col-md-6 offset-md-3">
        <h1>Login</h1>
        <br />
        {success && showSuccessMessage(success)}
        {error && showErrorMessage(error)}
        {loginForm()}
        <Link href="/auth/password/forgot" className="text-danger float-right">
          Forgot Password
        </Link>
      </div>
    </Layout>
  );
};

export default Login;
