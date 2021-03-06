import React, { Component } from 'react';
import { connect } from 'react-redux';
import MediaQuery from 'react-responsive';
import Popup from 'react-popup';
import Peer from 'simple-peer';
import mapDispatchToProps from '../../actions';
import { getMedia } from '../../../utils/media';
import {
  Header,
  LeftSideDrawer,
  RightSideDrawer
} from '../Common';
import {
  ChatBox,
  ChatPopUpWindow,
  ActiveChatRoom,
  ChatRoomsList,
  MembersList,
  VideoCallRequestModal,
  VideoCallWindow
} from '../Partial';
import {
  ChatInput,
  ChatAudioRecorder
} from '../../components/Chat';
import { NotificationPopUp } from '../../components/NotificationPopUp';
import {
  SOCKET_BROADCAST_REQUEST_VIDEO_CALL,
  SOCKET_BROADCAST_CANCEL_REQUEST_VIDEO_CALL,
  SOCKET_BROADCAST_REJECT_VIDEO_CALL,
  SOCKET_BROADCAST_ACCEPT_VIDEO_CALL,
  SOCKET_BROADCAST_END_VIDEO_CALL
} from '../../constants/video-call';
import socket from '../../../socket';
import '../../styles/Chat.scss';

class Chat extends Component {
  constructor(props) {
    super(props);

    this.peer = null;
    this.callerPeerID = null;

    this.state = {
      isLeftSideDrawerOpen: false,
      isRightSideDrawerOpen: false,
      activeChatPopUpWindow: -1,
      isAudioRecorderOpen: false,
      isDragDropBoxOpen: false,
      localVideoSource: {},
      remoteVideoSource: {},
      isVideoCallRequestModalOpen: false,
      isVideoCallWindowOpen: false
    };
  }
  componentWillMount() {
    const {
      user,
      socketUserLogin
    } = this.props;

    socketUserLogin(user.active);
    document.body.className = '';
    document.body.classList.add('chat-page');
  }
  componentDidMount() {
    ::this.calculateViewportHeight();
    window.addEventListener('onorientationchange', ::this.calculateViewportHeight, true);
    window.addEventListener('resize', ::this.calculateViewportHeight, true);

    socket.on('action', (action) => {
      switch (action.type) {
        case SOCKET_BROADCAST_REQUEST_VIDEO_CALL:
          this.callerPeerID = action.peerID;
          this.setState({isVideoCallRequestModalOpen: true});
          break;
        case SOCKET_BROADCAST_CANCEL_REQUEST_VIDEO_CALL:
          this.setState({isVideoCallRequestModalOpen: false});
          break;
        case SOCKET_BROADCAST_REJECT_VIDEO_CALL:
        case SOCKET_BROADCAST_END_VIDEO_CALL :
          this.setState({isVideoCallWindowOpen: false});
          break;
        case SOCKET_BROADCAST_ACCEPT_VIDEO_CALL:
          ::this.handleSignalPeer(action.peerID);
          break;
      }
    });
  }
  calculateViewportHeight() {
    var viewportHeight = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

    this.chatSection.setAttribute('style', 'height:' + viewportHeight + 'px;');
  }
  handleLeftSideDrawerRender() {
    const { isLeftSideDrawerOpen } = this.state;

    return (
      <MediaQuery query="(min-width: 768px)">
        {(matches) => {
          return (
            <LeftSideDrawer
              handleLeftSideDrawerToggleState={::this.handleLeftSideDrawerToggleState}
              isLeftSideDrawerOpen={matches ? true : isLeftSideDrawerOpen}
              noOverlay={matches ? true : false}
            >
              <ChatRoomsList
                handleLeftSideDrawerToggleEvent={::this.handleLeftSideDrawerToggleEvent}
                handleOpenPopUpChatRoom={::this.handleOpenPopUpChatRoom}
              />
            </LeftSideDrawer>
          )
        }}
      </MediaQuery>
    )
  }
  handleLeftSideDrawerToggleEvent(openTheDrawer=false) {
    this.setState({isLeftSideDrawerOpen: openTheDrawer});
  }
  handleLeftSideDrawerToggleState(state) {
    this.setState({isLeftSideDrawerOpen: state.isOpen});
  }
  handleRightSideDrawerToggleEvent(openTheDrawer=false) {
    this.setState({isRightSideDrawerOpen: openTheDrawer});
  }
  handleRightSideDrawerToggleState(state) {
    this.setState({isRightSideDrawerOpen: state.isOpen});
  }
  handleOpenPopUpChatRoom(selectedChatRoom) {
    const {
      user,
      chatRoom,
      popUpChatRoom,
      openPopUpChatRoom,
      closePopUpChatRoom
    } = this.props;
    const activeUser = user.active;
    const activeChatRoom = chatRoom.active;
    const allPopUpChatRooms = popUpChatRoom.all;
    var chatRoomFound = false;
    var popUpIndex = -1;

    for ( var i = 0; i < allPopUpChatRooms.length; i++ ) {
      var singleChatRoom = allPopUpChatRooms[i];

      if ( singleChatRoom.data._id === selectedChatRoom.data._id ) {
        chatRoomFound = true;
        popUpIndex = i;
        break;
      }
    }

    if ( ! chatRoomFound ) {
      if ( allPopUpChatRooms.length >= 5 ) {
        closePopUpChatRoom(allPopUpChatRooms[0].data._id);
      }

      openPopUpChatRoom(selectedChatRoom, activeUser._id, activeChatRoom.data._id);
      this.setState({activeChatPopUpWindow: allPopUpChatRooms.length});
    } else {
      this.setState({activeChatPopUpWindow: popUpIndex});
    }
  }
  handleActiveChatPopUpWindow(popUpIndex) {
    this.setState({activeChatPopUpWindow: popUpIndex});
  }
  handleAudioRecorderToggle(event) {
    event.preventDefault();

    this.setState({isAudioRecorderOpen: !this.state.isAudioRecorderOpen});
  }
  handleDragDropBoxToggle(openTheDragDropBox=false) {
    this.setState({isDragDropBoxOpen: openTheDragDropBox});
  }
  handleSendTextMessage(newMessageID, text, chatRoomID) {
    const {
      user,
      sendTextMessage
    } = this.props;

    sendTextMessage(newMessageID, text, user.active, chatRoomID);
  }
  handleSendAudioMessage(newMessageID, text, audio, chatRoomID) {
    const {
      user,
      sendAudioMessage
    } = this.props;
    const audioLength = new Date(audio.stopTime) - new Date(audio.startTime);

    if ( audioLength > ( 60 * 1000 ) ) {
      Popup.alert('Maximum of 1 minute audio only');
    } else {
      sendAudioMessage(newMessageID, text, audio.blob, user.active, chatRoomID);
    }
  }
  handleVideoCallError() {
    Popup.alert('Camera is not supported on your device!');
  }
  handleSignalPeer(peerID) {
    if ( this.peer ) {
      this.peer.signal(peerID);

      this.peer.on('stream', (remoteStream) => {
        this.setState({remoteVideoSource: remoteStream});
      });
    }
  }
  handleRequestVideoCall(chatRoom) {
    const {
      user,
      requestVideoCall
    } = this.props;
    const activeUser = user.active;
    const chatRoomMembers = chatRoom.data.members;

    if ( chatRoom.data.chatType === 'direct' ) {
      var memberIndex = chatRoomMembers.findIndex(singleMember => singleMember._id !== activeUser._id);

      if ( memberIndex > -1 ) {
        getMedia(
          (stream) => {
            this.peer = new Peer({
              initiator: true,
              trickle: false,
              stream: stream
            });

            this.peer.on('signal', (signal) => {
              requestVideoCall(activeUser._id, chatRoomMembers[memberIndex], signal);
            });

            this.setState({
              localVideoSource: stream,
              remoteVideoSource: {},
              isVideoCallWindowOpen: true
            });
          },
          ::this.handleVideoCallError
        );
      }
    }
  }
  handleCancelRequestVideoCall(receiverID) {
    const { cancelRequestVideoCall } = this.props;

    cancelRequestVideoCall(receiverID);
    this.setState({isVideoCallWindowOpen: false});
  }
  handleAcceptVideoCall(callerID) {
    const { acceptVideoCall } = this.props;

    getMedia(
      (stream) => {
        this.peer = new Peer({
          initiator: false,
          trickle: false,
          stream: stream
        });

        ::this.handleSignalPeer(this.callerPeerID);

        this.peer.on('signal', (signal) => {
          acceptVideoCall(callerID, signal);
        });

        this.setState({
          localVideoSource: stream,
          isVideoCallRequestModalOpen: false,
          isVideoCallWindowOpen: true
        });
      },
      () => {
        ::this.handleRejectVideoCall();
        ::this.handleVideoCallError();
      }
    );
  }
  handleRejectVideoCall() {
    const {
      videoCall,
      rejectVideoCall
    } = this.props;
    const peerUser = videoCall.peerUser;

    rejectVideoCall(peerUser._id);
    this.setState({isVideoCallRequestModalOpen: false});
  }
  handleEndVideoCall(peerUserID) {
    const { endVideoCall } = this.props;

    endVideoCall(peerUserID);
    this.setState({isVideoCallWindowOpen: false});
  }
  handleNotificationViewMessage(chatRoomObj, mobile) {
    const {
      user,
      chatRoom,
      changeChatRoom
    } = this.props;

    if ( mobile ) {
      changeChatRoom(chatRoomObj, user.active._id, chatRoom.active.data._id);
      ::this.handleLeftSideDrawerToggleEvent();
      ::this.handleRightSideDrawerToggleEvent();
    } else {
      ::this.handleOpenPopUpChatRoom(chatRoomObj);
    }
  }
  render() {
    const {
      user,
      typer,
      chatRoom,
      popUpChatRoom,
      message,
      videoCall,
      isTyping,
      isNotTyping
    } = this.props;
    const {
      isRightSideDrawerOpen,
      activeChatPopUpWindow,
      isAudioRecorderOpen,
      isDragDropBoxOpen,
      localVideoSource,
      remoteVideoSource,
      isVideoCallRequestModalOpen,
      isVideoCallWindowOpen
    } = this.state;
    const activeChatRoom = chatRoom.active;
    const isChatInputDisabled = chatRoom.fetch.loading || message.fetchNew.loading || isDragDropBoxOpen;

    return (
      <div className="chat-section" ref={(element) => { this.chatSection = element; }}>
        {::this.handleLeftSideDrawerRender()}
        <RightSideDrawer
          handleRightSideDrawerToggleState={::this.handleRightSideDrawerToggleState}
          isRightSideDrawerOpen={isRightSideDrawerOpen}
        >
          <MembersList
            handleRightSideDrawerToggleEvent={::this.handleRightSideDrawerToggleEvent}
            handleOpenPopUpChatRoom={::this.handleOpenPopUpChatRoom}
          />
        </RightSideDrawer>
        <Header
          handleLeftSideDrawerToggleEvent={::this.handleLeftSideDrawerToggleEvent}
          handleOpenPopUpChatRoom={::this.handleOpenPopUpChatRoom}
          handleRequestVideoCall={::this.handleRequestVideoCall}
        >
          <ActiveChatRoom
            handleRightSideDrawerToggleEvent={::this.handleRightSideDrawerToggleEvent}
          />
        </Header>
        <div className={"chat-box-wrapper " + (isAudioRecorderOpen ? 'audio-recorder-open' : '')}>
          <MediaQuery query="(min-width: 768px)">
            {
              popUpChatRoom.all.length > 0 &&
              <div className="chat-popup-window-wrapper">
                {
                  popUpChatRoom.all.map((singlePopUpChatRoom, i) =>
                    <ChatPopUpWindow
                      key={i}
                      index={i}
                      popUpChatRoom={singlePopUpChatRoom}
                      handleSendTextMessage={::this.handleSendTextMessage}
                      handleSendAudioMessage={::this.handleSendAudioMessage}
                      handleDragDropBoxToggle={::this.handleDragDropBoxToggle}
                      handleRequestVideoCall={::this.handleRequestVideoCall}
                      handleActiveChatPopUpWindow={::this.handleActiveChatPopUpWindow}
                      active={activeChatPopUpWindow === i}
                    />
                  )
                }
              </div>
            }
          </MediaQuery>
          <ChatBox
            chatRoom={activeChatRoom}
            message={message}
            typers={typer.all}
            handleDragDropBoxToggle={(::this.handleDragDropBoxToggle)}
            isDragDropBoxOpen={isDragDropBoxOpen}
            fetchNewLoading={message.fetchNew.loading}
            fetchOldLoading={message.fetchOld.loading}
          />
        </div>
        {
          !isAudioRecorderOpen
            ?
            <ChatInput
              user={user.active}
              chatRoom={activeChatRoom}
              handleIsTyping={isTyping}
              handleIsNotTyping={isNotTyping}
              handleSendTextMessage={::this.handleSendTextMessage}
              handleAudioRecorderToggle={::this.handleAudioRecorderToggle}
              handleDragDropBoxToggle={::this.handleDragDropBoxToggle}
              disabled={isChatInputDisabled}
            />
            :
            <ChatAudioRecorder
              chatRoom={activeChatRoom}
              handleAudioRecorderToggle={::this.handleAudioRecorderToggle}
              handleSendAudioMessage={::this.handleSendAudioMessage}
            />
        }
        <MediaQuery query="(max-width: 767px)">
          {(matches) => {
            return (
              <NotificationPopUp
                handleViewMessage={::this.handleNotificationViewMessage}
                mobile={matches}
              />
            )
          }}
        </MediaQuery>
        {
          isVideoCallRequestModalOpen &&
          <VideoCallRequestModal
            isModalOpen={isVideoCallRequestModalOpen}
            handleAcceptVideoCall={::this.handleAcceptVideoCall}
            handleRejectVideoCall={::this.handleRejectVideoCall}
          />
        }
        {
          isVideoCallWindowOpen &&
          <VideoCallWindow
            localVideoSource={localVideoSource}
            remoteVideoSource={remoteVideoSource}
            handleCancelRequestVideoCall={::this.handleCancelRequestVideoCall}
            handleEndVideoCall={::this.handleEndVideoCall}
          />
        }
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    typer: state.typer,
    chatRoom: state.chatRoom,
    popUpChatRoom: state.popUpChatRoom,
    message: state.message,
    videoCall: state.videoCall
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Chat);
