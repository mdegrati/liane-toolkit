import React, { Component } from "react";
import { Meteor } from "meteor/meteor";
import PropTypes from "prop-types";
import { isFbLogged } from "/imports/ui/utils/utils.jsx";
import { Alerts } from "/imports/ui/utils/Alerts.js";

import { Menu, Dropdown, Container, Icon } from "semantic-ui-react";

export default class AppBar extends React.Component {
  constructor(props) {
    super(props);
    this._handleItemClick = this._handleItemClick.bind(this);
  }

  _handleItemClick() {
    const { currentUser } = this.props;
    if (currentUser && isFbLogged(currentUser)) {
      FlowRouter.go("App.addCampaign");
    } else {
      Alerts.error("You need to login with facebook first");
      return;
    }
  }
  _getUserInfo(currentUser) {
    if (isFbLogged(currentUser)) {
      return currentUser.services.facebook.name;
    } else {
      return currentUser.emails[0].address;
    }
  }
  _getAdminMenu() {
    const { currentUser } = this.props;
    if (Roles.userIsInRole(currentUser, ["admin"])) {
      return (
        <Dropdown item simple text="Admin">
          <Dropdown.Menu>
            <Dropdown.Item as="a" href={FlowRouter.path("App.admin.jobs")}>
              <Icon name="tasks" /> Backend Jobs
            </Dropdown.Item>
            <Dropdown.Item as="a" href={FlowRouter.path("App.admin.contexts")}>
              <Icon name="circle outline" /> Contexts
            </Dropdown.Item>
            <Dropdown.Item
              as="a"
              href={FlowRouter.path("App.admin.geolocations")}
            >
              <Icon name="world" /> Geolocations
            </Dropdown.Item>
            <Dropdown.Item
              as="a"
              href={FlowRouter.path("App.admin.audienceCategories")}
            >
              <Icon name="cubes" /> Audience Categories
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      );
    } else {
      return null;
    }
  }
  render() {
    const { loading, currentUser, logout } = this.props;

    return (
      <Menu fixed="top" pointing id="appBar" size="large" inverted>
        <Container>
          <Menu.Item as="a" href={FlowRouter.path("App.dashboard")} header>
            {Meteor.settings.public.appName}
          </Menu.Item>
          <Menu.Menu position="right">
            <Menu.Item name="signup" onClick={this._handleItemClick}>
              <Icon name="plus" /> {i18n.__("components.userMenu.newCampaign")}
            </Menu.Item>
            {this._getAdminMenu()}
            <Dropdown
              item
              simple
              text={currentUser ? this._getUserInfo(currentUser) : ""}
            >
              <Dropdown.Menu>
                <Dropdown.Item onClick={logout}>
                  <Icon name="sign out" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Menu.Menu>
        </Container>
      </Menu>
    );
  }
}
