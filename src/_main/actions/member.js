import axios from 'axios';
import { FETCH_MEMBERS } from '../constants/member';
import { getBaseURL } from '../../utils/url';

const baseURL = getBaseURL();

/**
 * Fetch members
 * @param {string} chatRoomID
 * @param {string} userID
 */
export function fetchMembers(chatRoomID, userID) {
  let data = {
    chatRoomID,
    userID
  };

  return dispatch => {
    return dispatch({
      type: FETCH_MEMBERS,
      payload: axios.post(baseURL + '/api/member', data)
    })
    .catch((error) => {
      if (error instanceof Error) {
        console.log(error);
      }
    });
  }
}
