import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Draggable from 'react-draggable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import mapDispatchToProps from '../../../actions';
import { handleChatRoomAvatarBadges } from '../../../../utils/avatar';
import { isDirectChatRoomMemberOnline } from '../../../../utils/member';
import { LoadingAnimation } from '../../../../components/LoadingAnimation';
import { Avatar } from '../../../../components/Avatar';
import { ChatBox } from '../ChatBox';
import {
  ChatInput,
  ChatAudioRecorder
} from '../../../components/Chat';
import './styles.scss';

class ChatPopUpWindow extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isAudioRecorderOpen: false,
      isDragDropBoxOpen: false
    };
  }
  handleActiveChatPopUpWindow(event) {
    event.preventDefault();

    const {
      index,
      handleActiveChatPopUpWindow
    } = this.props;

    handleActiveChatPopUpWindow(index);
  }
  handleRequestVideoCall(event) {
    event.preventDefault();

    if ( event.stopPropagation ) {
      event.stopPropagation();
    }

    const {
      popUpChatRoom,
      handleRequestVideoCall
    } = this.props;

    if ( popUpChatRoom.data.chatType === 'direct' ) {
      handleRequestVideoCall(popUpChatRoom);
    }
  }
  handleClosePopUpChatRoom(event) {
    event.preventDefault();

    const {
      popUpChatRoom,
      closePopUpChatRoom
    } = this.props;

    closePopUpChatRoom(popUpChatRoom.data._id);
  }
  handleAudioRecorderToggle(event) {
    event.preventDefault();

    this.setState({isAudioRecorderOpen: !this.state.isAudioRecorderOpen});
  }
  handleDragDropBoxToggle(openTheDragDropBox=false) {
    this.setState({isDragDropBoxOpen: openTheDragDropBox});
  }
  render() {
    const {
      index,
      user,
      isTyping,
      isNotTyping,
      popUpChatRoom,
      handleSendTextMessage,
      handleSendAudioMessage,
      active
    } = this.props;
    const {
      isAudioRecorderOpen,
      isDragDropBoxOpen
    } = this.state;
    const activeUser = user.active;
    const isChatInputDisabled = popUpChatRoom.message.fetchNew.loading;

    return (
      <Draggable bounds="parent" handle=".popup-header" onDrag={::this.handleActiveChatPopUpWindow}>
        <div className={"chat-popup-window " + (active ? 'active' : '')}>
          <div className="popup-header" onClick={::this.handleActiveChatPopUpWindow}>
            <Avatar
              image={popUpChatRoom.data.chatIcon}
              name={popUpChatRoom.data.name}
              roleChatType={handleChatRoomAvatarBadges(popUpChatRoom.data, activeUser, 'role-chat')}
              accountType={handleChatRoomAvatarBadges(popUpChatRoom.data, activeUser)}
            />
            <div className="chat-room-name">
              {popUpChatRoom.data.name}
              {
                popUpChatRoom.data.chatType === 'private' &&
                <span className="you-label">(you)</span>
              }
            </div>
            {
              popUpChatRoom.data.chatType === 'direct' &&
              isDirectChatRoomMemberOnline(popUpChatRoom.data.members, user.active._id) &&
              <div
                className="popup-header-icon video-cam-icon"
                title="Start Video Call"
                onClick={::this.handleRequestVideoCall}
              >
                <FontAwesomeIcon icon="video" />
              </div>
            }
            <div
              className="popup-header-icon close-icon"
              title="Close"
              onClick={::this.handleClosePopUpChatRoom}
            >
              <FontAwesomeIcon icon="times" />
            </div>
          </div>
          <div className={"popup-body " + (isAudioRecorderOpen ? 'audio-recorder-open' : '')}>
            <ChatBox
              chatRoom={popUpChatRoom}
              message={popUpChatRoom.message}
              typers={popUpChatRoom.typer.all}
              handleDragDropBoxToggle={(::this.handleDragDropBoxToggle)}
              isDragDropBoxOpen={isDragDropBoxOpen}
              fetchNewLoading={popUpChatRoom.message.fetchNew.loading}
              fetchOldLoading={popUpChatRoom.message.fetchOld.loading}
              small
            />
          </div>
          <div className="popup-footer">
            {
              !isAudioRecorderOpen
                ?
                <ChatInput
                  id={"popup-" + index}
                  user={user.active}
                  chatRoom={popUpChatRoom}
                  handleIsTyping={isTyping}
                  handleIsNotTyping={isNotTyping}
                  handleSendTextMessage={handleSendTextMessage}
                  handleAudioRecorderToggle={::this.handleAudioRecorderToggle}
                  handleDragDropBoxToggle={::this.handleDragDropBoxToggle}
                  disabled={isChatInputDisabled}
                  small
                />
                :
                <ChatAudioRecorder
                  chatRoom={popUpChatRoom}
                  handleAudioRecorderToggle={::this.handleAudioRecorderToggle}
                  handleSendAudioMessage={handleSendAudioMessage}
                  small
                />
            }
          </div>
        </div>
      </Draggable>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    typer: state.typer
  }
}

ChatPopUpWindow.propTypes = {
  index: PropTypes.number.isRequired,
  popUpChatRoom: PropTypes.object.isRequired,
  handleSendTextMessage: PropTypes.func.isRequired,
  handleSendAudioMessage: PropTypes.func.isRequired,
  handleRequestVideoCall: PropTypes.func.isRequired,
  handleActiveChatPopUpWindow: PropTypes.func.isRequired,
  active: PropTypes.bool
}

ChatPopUpWindow.defaultProps = {
  active: false
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ChatPopUpWindow);
