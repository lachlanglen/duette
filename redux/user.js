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

export const createOrUpdateUser = ({ oAuthId, name, email, isApple, onSuccess, onFailure }) => {
  return dispatch => {
    axios.post('https://duette.herokuapp.com/api/user',
      {
        name,
        oAuthId,
        email,
        lastLogin: Date.now(),
        isApple,
      })
      .then(user => {
        dispatch(setUser(user.data));
        if (onSuccess) onSuccess()
      })
      .catch(e => {
        console.log('error in setUser thunk: ', e)
        if (onFailure) onFailure();
        throw new Error('error in setUser thunk: ', e)
      });
  };
};

export const updateUser = (userId, body, { onSuccess, onFailure, onEmailAlreadyExists }) => {
  return dispatch => {
    // TODO: change below back to duette.herokuapp.com
    // axios.put(`http://192.168.0.6:5000/api/user/${userId}`, body)
    axios.put(`https://duette.herokuapp.com/api/user/${userId}`, body)
      .then(updated => {
        // dispatch(setErrorRegistered());
        dispatch(setUser(updated.data));
        if (onSuccess) onSuccess();
      })
      .catch(e => {
        // dispatch(setError(e));
        console.log('error in updateUser thunk: ', e);
        if (onEmailAlreadyExists) onEmailAlreadyExists();
        else if (onFailure) onFailure();
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
