import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Appbar,
  Container
} from 'muicss/react/';
import { logout } from "../../actions/auth";
import { OptionsDropdown } from '../../components';

class Header extends Component {
  constructor(props) {
    super(props);
  }
  handleLogout() {
    this.props.dispatch(logout());
  }
  render() {
    const { user } = this.props;

    return (
      <Appbar className="header">
        <Container>
          <table width="100%">
            <tbody>
              <tr style={{verticalAlign: 'middle'}}>
                <td className="mui--appbar-height">
                  <h1>Chat App</h1>
                </td>
                <td className="mui--appbar-height mui--text-right">
                  <OptionsDropdown 
                    userData={user.userData}
                    handleLogout={::this.handleLogout} 
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </Container>
      </Appbar>
    )
  }
}

const mapStateToProps = (state) => {  
  return {
    user: state.user
  }
}

export default connect(
  mapStateToProps
)(Header);
