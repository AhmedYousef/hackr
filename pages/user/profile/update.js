import { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import axios from 'axios';
import { showSuccessMessage, showErrorMessage } from '../../../helpers/alerts';
import { updateUser } from '../../../helpers/auth';
import withUser from '../../withUser';

const API = process.env.NEXT_PUBLIC_API;

const Profile = ({ user, token }) => {
  const [state, setState] = useState({
    name: user.name,
    email: user.email,
    password: '',
    error: '',
    success: '',
    buttonText: 'Update',
    loadedCategories: [],
    categories: user.categories,
  });

  const { name, email, password, error, success, buttonText, loadedCategories, categories } = state;

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const response = await axios.get(`${API}/categories`);
    setState({ ...state, loadedCategories: response.data });
  };

  const handleToggle = (categoryId) => () => {
    // return the first index or -1
    const clickedCategory = categories.indexOf(categoryId);
    const all = [...categories];

    if (clickedCategory === -1) {
      all.push(categoryId);
    } else {
      all.splice(clickedCategory, 1);
    }

    setState({ ...state, categories: all, success: '', error: '' });
  };

  const showCategories = () => {
    return (
      loadedCategories &&
      loadedCategories.map((c, i) => (
        <li className="list-unstyled" key={c._id}>
          <input type="checkbox" onChange={handleToggle(c._id)} checked={categories.includes(c._id)} className="mr-2" />
          <label className="form-check-label">{c.name}</label>
        </li>
      ))
    );
  };

  const handleChange = (fieldName) => (e) => {
    setState({ ...state, [fieldName]: e.target.value, error: '', success: '', buttonText: 'Update' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setState({ ...state, buttonText: 'Updating' });
    try {
      const response = await axios.put(
        `${API}/user`,
        {
          name,
          password,
          categories,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      updateUser(response.data, () => {
        setState({
          ...state,
          buttonText: 'Updated',
          success: 'Profile updated successfully',
        });
      });
    } catch (error) {
      setState({
        ...state,
        buttonText: 'Update',
        error: error.response.data.error,
      });
    }
  };

  const updateFrom = () => (
    <form onSubmit={handleSubmit}>
      <div className="mb-3">
        <input
          required
          value={name}
          onChange={handleChange('name')}
          type="text"
          className="form-control"
          placeholder="Type your name"
        />
      </div>
      <div className="mb-3">
        <input
          required
          value={email}
          onChange={handleChange('email')}
          type="email"
          className="form-control"
          placeholder="Type your Email"
          disabled
        />
      </div>
      <div className="mb-3">
        <input
          value={password}
          onChange={handleChange('password')}
          type="password"
          className="form-control"
          placeholder="Type your password"
        />
      </div>
      <div className="form-group">
        <label className="text-muted ml-4">Category</label>
        <ul style={{ maxHeight: '100px', overflowY: 'auto' }}>{showCategories()}</ul>
      </div>
      <div className="mb-3">
        <button className="btn btn-outline-primary">{buttonText}</button>
      </div>
    </form>
  );

  return (
    <Layout>
      <div className="col-md-6 offset-md-3">
        <h1>Update Profile</h1>
        <br />
        {success && showSuccessMessage(success)}
        {error && showErrorMessage(error)}
        {updateFrom()}
      </div>
    </Layout>
  );
};

export default withUser(Profile);
