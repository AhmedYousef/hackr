import React, { useState, useEffect } from 'react';
import Layout from '../../../components/Layout';
import axios from 'axios';
import { showSuccessMessage, showErrorMessage } from '../../../helpers/alerts';
import { getCookie, isAuth } from '../../../helpers/auth';

const API = process.env.NEXT_PUBLIC_API;

const Create = ({ token }) => {
  const [state, setState] = useState({
    title: '',
    url: '',
    type: '',
    medium: '',
    categories: [],
    loadedCategories: [],
    success: '',
    error: '',
  });

  const { title, url, type, medium, categories, loadedCategories, success, error } = state;

  useEffect(() => {
    loadCategories();
  }, [success]);

  const loadCategories = async () => {
    const response = await axios.get(`${API}/categories`);
    setState({ ...state, loadedCategories: response.data });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API}/link`,
        { title, url, categories, type, medium },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setState({
        ...state,
        title: '',
        url: '',
        type: '',
        medium: '',
        success: 'Link is created',
        error: '',
        loadedCategories: [],
        categories: [],
      });
    } catch (error) {
      console.log('LINK SUBMIT ERROR', error);
      setState({ ...state, success: '', error: error.response.data.error });
    }
  };

  const handleTypeClick = (e) => {
    setState({ ...state, type: e.target.value, success: '', error: '' });
  };

  const handleMediumClick = (e) => {
    setState({ ...state, medium: e.target.value, success: '', error: '' });
  };

  const showTypes = () => (
    <React.Fragment>
      <div className="form-check pl-5">
        <label className="form-check-label">
          <input
            type="radio"
            onChange={handleTypeClick}
            checked={type === 'free'}
            value="free"
            className="form-check-input"
            name="type"
          />
          Free
        </label>
      </div>
      <div className="form-check pl-5">
        <label className="form-check-label">
          <input
            type="radio"
            onClick={handleTypeClick}
            checked={type === 'paid'}
            value="paid"
            className="form-check-input"
            name="type"
          />
          Paid
        </label>
      </div>
    </React.Fragment>
  );

  const showMedium = () => (
    <React.Fragment>
      <div className="form-check pl-5">
        <label className="form-check-label">
          <input
            type="radio"
            onClick={handleMediumClick}
            checked={medium === 'video'}
            value="video"
            className="form-check-input"
            name="medium"
          />
          Video
        </label>
      </div>
      <div className="form-check pl-5">
        <label className="form-check-label">
          <input
            type="radio"
            onClick={handleMediumClick}
            checked={medium === 'book'}
            value="book"
            className="form-check-input"
            name="medium"
          />
          Book
        </label>
      </div>
    </React.Fragment>
  );

  const handleTitleChange = (e) => {
    setState({ ...state, title: e.target.value, success: '', error: '' });
  };

  const handleURLChange = (e) => {
    setState({ ...state, url: e.target.value, success: '', error: '' });
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
      loadedCategories.map((category, index) => (
        <li className="list-unstyled" key={category._id}>
          <input type="checkbox" onChange={handleToggle(category._id)} className="mr-2" />
          <label className="form-check-label">{category.name}</label>
        </li>
      ))
    );
  };

  const submitLinkForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="text-muted">Title</label>
        <input type="text" className="form-control" onChange={handleTitleChange} value={title} />
      </div>
      <div className="form-group">
        <label className="text-muted">URL</label>
        <input type="url" className="form-control" onChange={handleURLChange} value={url} />
      </div>
      <div>
        <button disabled={!token} className="btn btn-outline-warning" type="submit">
          {isAuth() || token ? 'Post' : 'Login to post'}
        </button>
      </div>
    </form>
  );

  return (
    <Layout>
      <div className="row">
        <div className="col-md-12">
          <h1>Submit Link/URL</h1>
          <br />
        </div>
      </div>
      <div className="row">
        <div className="col-md-4">
          <div className="form-group">
            <label className="text-muted ml-4">Category</label>
            <ul style={{ maxHeight: '100px', overflowY: 'auto' }}>{showCategories()}</ul>
          </div>
          <div className="form-group">
            <label className="text-muted ml-4">Type</label>
            {showTypes()}
          </div>
          <div className="form-group">
            <label className="text-muted ml-4">Medium</label>
            {showMedium()}
          </div>
        </div>
        <div className="col-md-8">
          {success && showSuccessMessage(success)}
          {error && showErrorMessage(error)}
          {submitLinkForm()}
        </div>
      </div>
    </Layout>
  );
};

Create.getInitialProps = ({ req }) => {
  const token = getCookie('token', req);
  return { token };
};

export default Create;
