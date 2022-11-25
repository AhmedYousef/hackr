import Layout from '../../../components/Layout';
import withAdmin from '../../withAdmin';
import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { withRouter } from 'next/router';
import axios from 'axios';
import Resizer from 'react-image-file-resizer';
import { showSuccessMessage, showErrorMessage } from '../../../helpers/alerts';
import 'react-quill/dist/quill.bubble.css';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

const API = process.env.NEXT_PUBLIC_API;

const Update = ({ router, token }) => {
  const [state, setState] = useState({
    error: '',
    success: '',
    buttonText: 'Update',
    image: '',
  });
  const [content, setContent] = useState('');
  const [imageUploadButtonName, setImageUploadButtonName] = useState('Update image');
  const { name, success, error, image, buttonText, imagePreview } = state;
  const slug = router.query.slug;

  useEffect(() => {
    loadOldCategory(slug);
  }, []);

  const loadOldCategory = async (slug) => {
    const response = await axios.post(`${API}/category/${slug}`);
    const oldCategory = response.data.category;
    setState({ ...state, name: oldCategory.name, imagePreview: oldCategory.image.url });
    setContent(oldCategory.content);
  };

  const handleChange = (fieldName) => (e) => {
    setState({ ...state, [fieldName]: e.target.value, buttonText: 'Update', error: '', success: '' });
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
    setState((prevState) => ({ ...prevState, buttonText: 'Updating' }));
    try {
      const response = await axios.put(
        `${API}/category/${slug}`,
        { name, content, image },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      console.log('CATEGORY UPDATE RESPONSE', response);
      setState((prevState) => ({
        ...prevState,
        imagePreview: response.data.image.url,
        buttonText: 'Update',
        success: `${response.data.name} is Updated`,
      }));
    } catch (error) {
      console.log('CATEGORY UPDATE ERROR', error);
      setState({ ...state, buttonText: 'Update', error: error.response.data.error });
    }
  };

  const updateCategoryForm = () => (
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
          {imageUploadButtonName}{' '}
          <span>
            <img src={imagePreview} alt="image" height="20" />
          </span>
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
          <h1>Update Category</h1>
          <br />
          {success && showSuccessMessage(success)}
          {error && showErrorMessage(error)}
          {updateCategoryForm()}
        </div>
      </div>
    </Layout>
  );
};

export default withAdmin(withRouter(Update));
