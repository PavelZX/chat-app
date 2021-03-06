import { FETCH_ACTIVE_USER } from '../constants/user';
import { FETCH_MEMBERS } from '../constants/member';
import { CHANGE_CHAT_ROOM } from '../constants/chat-room';
import {
  SOCKET_BROADCAST_USER_LOGIN,
  SOCKET_BROADCAST_USER_LOGOUT
} from '../constants/auth';

const commonStateFlags = {
  loading: false,
  success: false,
  error: false,
  message: ''
};

const initialState = {
  fetch: {...commonStateFlags},
  activeUser: {},
  activeChatRoom: {
    data: {}
  },
  all: []
};

const member = (state=initialState, action) => {
  switch(action.type) {
    case `${FETCH_MEMBERS}_LOADING`:
      return {
        ...state,
        fetch: {
          ...state.fetch,
          loading: true
        }
      };
    case `${FETCH_MEMBERS}_SUCCESS`:
      var members = [...action.payload.data.members];
      var activeUser = {...state.activeUser};

      members = members.filter(singleMember =>
        singleMember._id !== activeUser._id
      );
      activeUser.isOnline = true;
      members.push(activeUser);

      return {
        ...state,
        fetch: {
          ...state.fetch,
          loading: false,
          success: true,
          error: false,
          message: action.payload.data.message
        },
        all: members
      };
    case `${FETCH_MEMBERS}_ERROR`:
      return {
        ...state,
        fetch: {
          ...state.fetch,
          loading: false,
          success: false,
          error: true,
          message: action.payload.response.data.message
        }
      };
    case `${FETCH_ACTIVE_USER}_SUCCESS`:
      return {
        ...state,
        activeUser: action.payload.data.user
      };
    case CHANGE_CHAT_ROOM:
      return {
        ...state,
        activeChatRoom: action.chatRoom
      };
    case SOCKET_BROADCAST_USER_LOGIN:
      var user = action.user;
      var userID = user._id;
      var activeChatRoom = {...state.activeChatRoom};
      var members = [...state.all];

      var memberIndex = members.findIndex(singleMember => singleMember._id === userID);

      if ( memberIndex > -1 ) {
        members[memberIndex].isOnline = true;
      }

      if ( activeChatRoom.data.chatType === 'public' && memberIndex === -1 ) {
        user.isOnline = true;
        members.push(user);
      }

      return {
        ...state,
        all: [...members]
      }
    case SOCKET_BROADCAST_USER_LOGOUT:
      var userID = action.userID;
      var members = [...state.all]

      var memberIndex = members.findIndex(singleMember => singleMember._id === userID);

      if ( memberIndex > -1 ) {
        members[memberIndex].isOnline = false;
      }

      return {
        ...state,
        all: [...members]
      }
    default:
      return state;
  }
}

export default member;
