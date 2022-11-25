import axios from 'axios';
import { getCookie } from '../helpers/auth';

const API = process.env.NEXT_PUBLIC_API;

const withUser = (Page) => {
  const WithAuthUser = (props) => <Page {...props} />;
  WithAuthUser.getInitialProps = async (context) => {
    const token = getCookie('token', context.req);
    let user = null;
    let userLinks = [];

    if (token) {
      try {
        const response = await axios.get(`${API}/user`, {
          headers: {
            authorization: `Bearer ${token}`,
            contentType: 'application/json',
          },
        });
        console.log('response in withUser', response.data);
        user = response.data.user;
        userLinks = response.data.links;
      } catch (error) {
        if (error.response.status === 401) {
          user = null;
        }
      }
    }

    if (user === null) {
      // redirect
      context.res.writeHead(302, {
        Location: '/',
      });
      context.res.end();
    } else {
      return {
        ...(Page.getInitalProps ? await Page.getInitalProps(context) : {}),
        user,
        token,
        userLinks,
      };
    }
  };
  return WithAuthUser;
};

export default withUser;
