import axios from 'axios';

const SET_DUETTES = 'SET_DUETTES';

export const setDuettes = duettes => {
  return {
    type: SET_DUETTES,
    duettes
  }

};

export const userDuettesReducer = (state = [], action) => {
  switch (action.type) {
    case SET_DUETTES:
      return action.duettes;
    default:
      return state;
  }
}

export const fetchDuettes = (userId) => {
  return dispatch => {
    axios.get(`https://duette.herokuapp.com/api/duette/byUserId/${userId}`)
      .then(duettes => dispatch(setDuettes(duettes.data)))
      .catch(e => {
        throw new Error('error in fetchDuettes thunk: ', e)
      })
  };
};

export const postDuette = (details) => {
  return dispatch => {
    axios.post('https://duette.herokuapp.com/api/duette', details)
      .then(() => dispatch(fetchDuettes(details.userId)))
      .catch(e => {
        throw new Error('error in postDuette thunk: ', e)
      })
  };
};

