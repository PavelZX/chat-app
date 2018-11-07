import React, { Component } from 'react';
import PropTypes from 'prop-types';
import MediaQuery from 'react-responsive';
import ContentEditable from 'react-simple-contenteditable';
import { Button } from 'muicss/react';
import emojione from 'emojione';
import EmojiPicker from 'emojione-picker';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Popup from 'react-popup';
import uuidv4 from 'uuid/v4';
import 'emojione-picker/css/picker.css';
import './styles.scss';

class ChatInput extends Component {
  constructor(props) {
    super(props);

    this.state = {
      caretPosition: null,
      message: '',
      typing: false,
      emojiPicker: false,
      validMessage: false,
      maxLengthReached: false
    };
  }
  onMessageChange(event, value) {
    event.preventDefault();

    const messageValue = value;

    this.setState({message: messageValue});
    ::this.handleMessageTextLength();
  }
  onMessageKeyPress(event) {
    const { maxLengthReached } = this.state;
    const messageTextLength = ::this.handleMessageText('length');

    if ( event.key === 'Enter' ) {
      event.preventDefault();
    }

    if ( maxLengthReached || messageTextLength >= 160 ) {
      Popup.alert('Sorry, maximum of 160 characters only!');
    }
  }
  onMessageKeyUp(event) {
    const {
      user,
      activeChatRoom,
      handleIsTyping,
      handleIsNotTyping
    } = this.props;
    const {
      message,
      typing,
      validMessage,
      maxLengthReached
    } = this.state;
    const chatInputText = document.getElementById('chat-input').innerHTML;

    if (
      message.trim().length > 0 &&
      !typing &&
      !validMessage &&
      chatInputText.trim().length > 0
    ) {
      this.setState({
        typing: true,
        validMessage: true
      });

      handleIsTyping(user, activeChatRoom.data._id);
    }

    if (
      message.trim().length === 0 &&
      typing &&
      validMessage &&
      chatInputText.trim().length === 0
    ) {
      this.setState({
        typing: false,
        validMessage: false
      });

      handleIsNotTyping(user, activeChatRoom.data._id);
    }

    if ( (event.key === 'Enter') && validMessage && !maxLengthReached ) {
      ::this.handleSendTextMessageOnChange(event);

      this.setState({
        message: '',
        typing: false,
        emojiPicker: false,
        validMessage: false
      });
    }
    ::this.handleSaveCaretPosition(event);
  }
  onMessagePaste(event) {
    const messageTextLength = ::this.handleMessageText('length');
    const maxLengthLeft = 160 - messageTextLength;

    if ( maxLengthLeft <= 0 ) {
      Popup.alert('Sorry, maximum of 160 characters only!');
    }
  }
  handleSaveCaretPosition(event) {
    event.preventDefault();

    if ( window.getSelection ) {
      var selection = window.getSelection();
      if ( selection.getRangeAt && selection.rangeCount ) {
        this.setState({caretPosition: selection.getRangeAt(0)});
      }
    } else if ( document.selection && document.selection.createRange ) {
      this.setState({caretPosition: document.selection.createRange()});
    } else {
      this.setState({caretPosition: null});
    }
  }
  handleEmojiPickerToggle(event) {
    event.preventDefault();

    this.setState({emojiPicker: !this.state.emojiPicker});
  }
  handleEmojiPickerSelect(emoji) {
    const {
      user,
      activeChatRoom,
      handleIsTyping
    } = this.props;
    const {
      caretPosition,
      typing,
      validMessage,
      maxLengthReached
    } = this.state;
    const messageTextLength = ::this.handleMessageText('length');

    var emojiSelect = emojione.toImage(emoji.shortname);

    if ( caretPosition ) {
      if ( window.getSelection ) {
        var selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(caretPosition);
      } else if ( document.selection && caretPosition.select ) {
        caretPosition.select();
      }
    }

    document.getElementById('chat-input').focus();

    if ( maxLengthReached || messageTextLength >= 159 ) {
      Popup.alert('Sorry, maximum of 160 characters only!');
    } else {
      ::this.handleInsertEmoji(emojiSelect);
    }

    if ( !typing && !validMessage ) {
      this.setState({
        typing: true,
        validMessage: true
      });

      handleIsTyping(user, activeChatRoom.data._id);
    }
  }
  handleInsertEmoji(emoji) {
    if ( window.getSelection ) {
      var selection = window.getSelection();
      if ( selection.getRangeAt && selection.rangeCount ) {
        var range = selection.getRangeAt(0);
        range.deleteContents();

        var element = document.createElement("div");
        element.innerHTML = emoji;

        var fragment = document.createDocumentFragment(), node, lastNode;
        while ( (node = element.firstChild) ) {
          lastNode = fragment.appendChild(node);
        }

        var firstNode = fragment.firstChild;
        range.insertNode(fragment);

        if ( lastNode ) {
          range = range.cloneRange();
          range.setStartAfter(lastNode);
          range.collapse(true);
          selection.removeAllRanges();
          selection.addRange(range);
        }

        this.setState({caretPosition: selection.getRangeAt(0)});
      }
    } else if ( document.selection && document.selection.createRange ) {
      var range = document.selection.createRange();
      range.pasteHTML(emoji);
      range.select();

      this.setState({caretPosition: document.selection.createRange()});
    }
  }
  handleMessageTextLength() {
    const messageTextLength = ::this.handleMessageText('length');

    if ( messageTextLength > 160 ) {
      this.setState({maxLengthReached: true});
    } else {
      this.setState({maxLengthReached: false});
    }
  }
  handleMessageText(type) {
    var emojis = document.getElementById('chat-input').getElementsByClassName('emojione');
    var chatInputText = document.getElementById('chat-input').innerHTML;

    var nth = 0;
    chatInputText = chatInputText.replace(/<img class="emojione" alt="(.*?)" title="(.*?)" src="(.*?)"[^>]*>/g, (match, i, original) => {
      nth++;
      return emojis[nth - 1].alt;
    });

    var element = document.createElement('div');
    element.innerHTML = chatInputText;

    var messageText = element.textContent || element.innerText || "";
    messageText = messageText.trim();

    if ( type === 'text' ) {
      return messageText;
    } else if ( type === 'length' ) {
      return messageText.length;
    }
  }
  handleSendTextMessageOnChange(event) {
    const {
      user,
      activeChatRoom,
      handleIsNotTyping,
      handleSendTextMessage
    } = this.props;
    const messageText = ::this.handleMessageText('text');
    const newMessageID = uuidv4();

    document.getElementById('chat-input').innerHTML = '';
    handleIsNotTyping(user, activeChatRoom.data._id);
    handleSendTextMessage(newMessageID, messageText);
  }
  handleSendTextMessageOnClick(event) {
    event.preventDefault();

    const {
      user,
      activeChatRoom,
      handleIsNotTyping,
      handleSendTextMessage
    } = this.props;
    const {
      validMessage,
      maxLengthReached
    } = this.state;
    const messageText = ::this.handleMessageText('text');
    const newMessageID = uuidv4();

    if ( validMessage && !maxLengthReached ) {
      document.getElementById('chat-input').innerHTML = '';
      document.getElementById('chat-input').focus();
      handleIsNotTyping(user, activeChatRoom.data._id);
      handleSendTextMessage(newMessageID, messageText);

      this.setState({
        message: '',
        typing: false,
        emojiPicker: false,
        validMessage: false
      });
    }
  }
  handleDragDropBoxToggle(event) {
    event.preventDefault();

    const { handleDragDropBoxToggle } = this.props;

    handleDragDropBoxToggle(true);
  }
  render() {
    const {
      handleAudioRecorderToggle,
      disabled
    } = this.props;
    const {
      message,
      emojiPicker,
      validMessage,
      maxLengthReached
    } = this.state;

    return (
      <div className={"chat-input-wrapper " + (disabled ? 'disabled' : '')}>
        <MediaQuery query="(min-width: 768px)">
          <div>
            {
              emojiPicker &&
              <div>
                <EmojiPicker onChange={::this.handleEmojiPickerSelect} search />
                <div className="emoji-picker-overlay" onClick={::this.handleEmojiPickerToggle} />
              </div>
            }
          </div>
        </MediaQuery>
        <div className="chat-input">
          <ContentEditable
            className="textfield single-line"
            id="chat-input"
            placeholder="Type here"
            autoComplete="off"
            html={message}
            tagName="span"
            onClick={::this.handleSaveCaretPosition}
            onChange={::this.onMessageChange}
            onKeyPress={::this.onMessageKeyPress}
            onKeyUp={::this.onMessageKeyUp}
            onPaste={::this.onMessagePaste}
            contentEditable="plaintext-only"
          />
          <div className="extras">
            <div className="extra-buttons">
              <div
                className="audio-button"
                onClick={handleAudioRecorderToggle}
                title="Send Voice Message"
              >
                <FontAwesomeIcon icon="microphone" />
              </div>
              <div
                className="file-button"
                onClick={::this.handleDragDropBoxToggle}
                title="Add a File"
              >
                <FontAwesomeIcon icon="paperclip" />
              </div>
              <MediaQuery query="(min-width: 768px)">
                <div
                  className="emoji-button"
                  onClick={::this.handleEmojiPickerToggle}
                  title="Add Emoji"
                >
                  <FontAwesomeIcon icon={["far", "smile"]} />
                </div>
              </MediaQuery>
            </div>
            <div className="extra-notes">
              <div className="note">
                <b>*bold*</b>
              </div>
              <div className="note">
                <i>_italic_</i>
              </div>
              <div className="note">
                ~strike~
              </div>
            </div>
          </div>
        </div>
        <Button
          className="button button-primary send-button"
          onClick={::this.handleSendTextMessageOnClick}
          disabled={!validMessage || maxLengthReached}
        >
          <div className="send-icon">
            <FontAwesomeIcon icon={["far", "paper-plane"]} size="2x" />
          </div>
        </Button>
      </div>
    )
  }
}

ChatInput.propTypes = {
  user: PropTypes.object.isRequired,
  activeChatRoom: PropTypes.object.isRequired,
  handleIsTyping: PropTypes.func.isRequired,
  handleIsNotTyping: PropTypes.func.isRequired,
  handleSendTextMessage: PropTypes.func.isRequired,
  handleAudioRecorderToggle: PropTypes.func.isRequired,
  handleDragDropBoxToggle: PropTypes.func.isRequired,
  disabled: PropTypes.bool
}

ChatInput.defaultProps = {
  disabled: false
}

export default ChatInput;
