import dynamic from 'next/dynamic';
import { useState } from 'react';
import axios from 'axios';
import Resizer from 'react-image-file-resizer';
import { showSuccessMessage, showErrorMessage } from '../../../helpers/alerts';
import Layout from '../../../components/Layout';
import withAdmin from '../../withAdmin';
import 'react-quill/dist/quill.bubble.css';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const API = process.env.NEXT_PUBLIC_API;

const Create = ({ user, token }) => {
  const [state, setState] = useState({
    name: '',
    error: '',
    success: '',
    buttonText: 'Create',
    image: '',
  });
  const [content, setContent] = useState('');
  const [imageUploadButtonName, setImageUploadButtonName] = useState('Upload image');

  const { name, success, error, image, buttonText } = state;

  const handleChange = (fieldName) => (e) => {
    setState({ ...state, [fieldName]: e.target.value, buttonText: 'Create', error: '', success: '' });
  };

  const handleContent = (e) => {
    setContent(e);
    setState({ ...state, success: '', error: '' });
  };

  const handleImage = (e) => {
    let fileInput = false;
    if (e.target.files[0]) {
      fileInput = true;
    }

    setImageUploadButtonName(e.target.files[0] && e.target.files[0].name);

    if (fileInput) {
      try {
        Resizer.imageFileResizer(
          e.target.files[0],
          300,
          300,
          'JPEG',
          100,
          0,
          (uri) => {
            setState({ ...state, image: uri, succes: '', error: '' });
          },
          'base64',
        );
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState((prevState) => ({ ...prevState, buttonText: 'Creating' }));
    try {
      const response = await axios.post(
        `${API}/category`,
        { name, content, image },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setImageUploadButtonName('Upload image');
      setContent('');
      setState((prevState) => ({
        ...prevState,
        name: '',
        formData: process.browser && new FormData(),
        buttonText: 'Created',
        success: `${response.data.name} is created`,
        image: '',
      }));
    } catch (error) {
      console.log('CATEGORY CREATE ERROR', error);
      setState({ ...state, buttonText: 'Create', error: error.response.data.error });
    }
  };

  const createCategoryForm = () => (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label className="test-muted">Name</label>
        <input onChange={handleChange('name')} value={name} type="text" className="form-control" required />
      </div>
      <div className="form-group">
        <label className="test-muted">Content</label>
        <ReactQuill
          onChange={handleContent}
          value={content}
          placeholder="Write something..."
          theme="bubble"
          className="pb-5 mb-3"
          style={{ border: '1px solid #666' }}
        />
      </div>
      <div className="form-group">
        <label className="btn btn-outline-secondary">
          {imageUploadButtonName}
          <input onChange={handleImage} type="file" accept="image/*" className="form-control" hidden />
        </label>
      </div>
      <div>
        <button className="btn btn-outline-warning">{buttonText} </button>
      </div>
    </form>
  );

  return (
    <Layout>
      <div className="row">
        <div className="col-md-6 offset-md-3">
          <h1>Create Category</h1>
          <br />
          {success && showSuccessMessage(success)}
          {error && showErrorMessage(error)}
          {createCategoryForm()}
        </div>
      </div>
    </Layout>
  );
};

export default withAdmin(Create);
