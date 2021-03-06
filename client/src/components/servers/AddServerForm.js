import { gql, useMutation, useQuery } from '@apollo/client';
import { GET_USER_SERVERS } from './ServerList';
import icon0 from '../../img/corgi-server-0.jpg';
import icon1 from '../../img/corgi-server-1.jpg';
import icon2 from '../../img/corgi-server-2.jpg';
import icon3 from '../../img/corgi-server-3.jpg';
import icon4 from '../../img/corgi-server-4.jpg';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

const serverIcons = [
  { id: '0', src: icon0 },
  { id: '1', src: icon1 },
  { id: '2', src: icon2 },
  { id: '3', src: icon3 },
  { id: '4', src: icon4 },
];

const CREATE_SERVER = gql`
  mutation CreateServer($createServerData: CreateServerInput) {
    createServer(data: $createServerData) {
      id
      name
      icon
      channels {
        id
      }
    }
  }
`;

const GET_USERNAME = gql`
  query getUsername {
    getUser @client {
      name
    }
  }
`;

const AddServerForm = ({ setState, setIsOpen }) => {
  let input;
  const history = useHistory();

  const [iconId, setIcon] = useState('0');

  const { data } = useQuery(GET_USERNAME);

  const [createServer] = useMutation(CREATE_SERVER, {
    update(cache, { data: { createServer } }) {
      const newServerFromResponse = { ...createServer, role: 'ADMIN' };
      const existingServers = cache.readQuery({
        query: GET_USER_SERVERS,
      });

      cache.writeQuery({
        query: GET_USER_SERVERS,
        data: {
          userServers: existingServers.userServers.concat(
            newServerFromResponse
          ),
        },
      });
    },
    onCompleted({ createServer }) {
      history.push(
        `/channels/${createServer.id}/${createServer.channels[0].id}`
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newServerName = input.value
      ? input.value
      : data.getUser.name + `'s server`;
    createServer({
      variables: {
        createServerData: { serverName: newServerName, icon: iconId },
      },
    });
    input.value = '';
    setIcon('0');
    setIsOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ textAlign: 'center', marginBottom: '.5em' }}>
        <h2 style={{ marginBottom: '.5em' }}>Customize your server</h2>
        <p>Give your server a personality with a unique name and icon.</p>
      </div>

      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '.5em',
          }}
        >
          {serverIcons.map(({ id, src }) => (
            <img
              alt={`icon ${id}`}
              onClick={() => setIcon(id)}
              key={id}
              src={src}
              id={id}
              className={`server-icon ${iconId === id ? 'active' : ''}`}
            />
          ))}
        </div>

        <form id='create-server' onSubmit={handleSubmit}>
          <label htmlFor='servername'>SERVER NAME</label>
          <br />
          <input
            placeholder={`${data.getUser.name}'s server`}
            type='text'
            name='servername'
            maxLength='35'
            style={{ padding: '10px' }}
            ref={(node) => {
              input = node;
            }}
          />
        </form>
      </div>
      <div style={{ marginTop: 'auto', display: 'flex' }}>
        <button className='back-button' onClick={() => setState('main')}>
          Back
        </button>
        <button className='submit-button' form='create-server'>
          Create
        </button>
      </div>
    </div>
  );
};

export default AddServerForm;
