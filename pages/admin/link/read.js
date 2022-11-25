import { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';
import Link from 'next/link';
import withAdmin from '../../withAdmin';
import Layout from '../../../components/Layout';

const API = process.env.NEXT_PUBLIC_API;

const LinkPage = ({ token }) => {
  const [allLinks, setAllLinks] = useState([]);
  const [limit, setLimit] = useState(0);
  const [skip, setSkip] = useState(0);
  const [size, setSize] = useState(0);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    let skip = 0;
    let limit = 2;

    const response = await axios.post(
      `${API}/links`,
      { skip, limit },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    setAllLinks(response.data);
    setLimit(limit);
    setSkip(skip);
    setSize(response.data.length);
  };

  const confirmDelete = (e, id) => {
    e.preventDefault();
    let isToDelete = window.confirm('Are you sure you want to delete?');
    if (isToDelete) {
      handleDelete(id);
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(`${API}/link/admin/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('LINK DELETE SUCCESS', response);
      process.browser && window.location.reload();
    } catch (error) {
      console.log('LINK DELETE ', error);
    }
  };

  const listOfLinks = () =>
    allLinks.map((l, i) => (
      <div key={i} className="row alert alert-primary p-2">
        <div className="col-md-8" onClick={(e) => handleClick(l._id)}>
          <Link href={l.url} target="_blank">
            <h5 className="pt-2">{l.title}</h5>
            <h5 className="pt-2 text-danger" style={{ fontSize: '12px' }}>
              {l.url}
            </h5>
          </Link>
        </div>
        <div className="col-md-4 pt-2">
          <span className="pull-right">
            {moment(l.createdAt).fromNow()} by {l.postedBy.name}
          </span>
        </div>
        <div className="col-md-12">
          <span className="badge text-dark">
            {l.type} / {l.medium}
          </span>
          {l.categories.map((c, i) => (
            <span className="badge text-success">{c.name}</span>
          ))}
          <Link href={`/user/link/${l._id}`}>
            <span className="badge text-warning pull-right">Update</span>
          </Link>
          <span onClick={(e) => confirmDelete(e, l._id)} className="btn badge text-danger pull-right">
            Delete
          </span>
        </div>
      </div>
    ));

  const loadMore = async () => {
    let toSkip = skip + limit;
    const response = await axios.post(
      `${API}/links`,
      { skip: toSkip, limit },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    setAllLinks([...allLinks, ...response.data]);
    setSize(response.data.length);
    setSkip(toSkip);
  };

  return (
    <Layout>
      <div className="row">
        <div className="col-md-12">
          <h1 className="display-4 font-weight-bold">All Links</h1>
        </div>
      </div>
      <br />
      <InfiniteScroll
        pageStart={0}
        loadMore={loadMore}
        hasMore={size > 0 && size >= limit}
        loader={<img key={0} src="/static/images/loading.gif" alt="loading" />}
      >
        <div className="row">
          <div className="col-md-12">{listOfLinks()}</div>
        </div>
      </InfiniteScroll>
    </Layout>
  );
};

export default withAdmin(LinkPage);
