import axios from 'axios';
import { setLoaded } from './dataLoaded';

const SET_CATS = 'SET_CATS';

const setCats = cats => {
  return {
    type: SET_CATS,
    cats
  }

};

export const catsReducer = (state = {}, action) => {
  switch (action.type) {
    case SET_CATS:
      return action.cats;
    default:
      return state;
  }
}

export const loadCats = (isFinal) => {
  return dispatch => {
    axios.get('https://api.thecatapi.com/v1/images/search', { headers: { 'x-api-key': '80e64f48-d071-46c7-8fea-96cdf578c1de' }, params: { limit: 100, size: 'full' } })
      .then(cats => {
        return cats.data.map(cat => (
          {
            source: {
              uri: cat.url
            }
          }
        ))
      })
      .then(data => {
        dispatch(setCats(data));
        if (isFinal) dispatch(setLoaded(true));
      })
      .catch(e => {
        throw new Error('error in cats thunk: ', e)
      })
  };
};

