import axios from 'axios';
import { setError, setErrorRegistered } from './error';

const SET_USER = 'SET_USER';
const CLEAR_USER = 'CLEAR_USER'

export const setUser = user => {
  return {
    type: SET_USER,
    user
  }
};

const clearUser = () => {
  return {
    type: CLEAR_USER,
    user: {},
  }
};

export const userReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_USER:
      return action.user;
    case CLEAR_USER:
      return action.user;
    default:
      return state;
  }
};

export const createOrUpdateUser = body => {
  const { id, name, picture, email } = body;
  return dispatch => {
    axios.post('https://duette.herokuapp.com/api/user',
      {
        name,
        facebookId: id,
        email,
        pictureUrl: picture.url,
        pictureWidth: picture.width,
        pictureHeight: picture.height,
        lastLogin: Date.now(),
      })
      .then(user => {
        dispatch(setUser(user.data))
      })
      .catch(e => {
        console.log('error in setUser thunk: ', e)
        throw new Error('error in setUser thunk: ', e)
      });
  };
};

export const updateUser = (userId, body) => {
  return dispatch => {
    axios.put(`https://duette.herokuapp.com/api/user/${userId}`, body)
      .then(updated => {
        dispatch(setErrorRegistered());
        dispatch(setUser(updated.data))
      })
      .catch(e => {
        dispatch(setError(e));
        console.log('error in updateUser thunk: ', e)
      })
  }
}

export const fetchUser = facebookId => {
  return dispatch => {
    axios.get(`https://duette.herokuapp.com/api/user/facebookId/${facebookId}`)
      .then(user => dispatch(setUser(user.data)))
      .catch(e => {
        throw new Error('error in fetchUser thunk: ', e)
      });
  };
};

export const clearCurrentUser = () => {
  return dispatch => {
    return dispatch(clearUser())
  };
};
