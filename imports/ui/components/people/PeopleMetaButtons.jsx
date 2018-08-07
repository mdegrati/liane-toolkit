import React from "react";
import { Popup, Icon } from "semantic-ui-react";
import { Alerts } from "/imports/ui/utils/Alerts.js";

export default class PeopleMetaButtons extends React.Component {
  constructor(props) {
    super(props);
    this._handleClick = this._handleClick.bind(this);
  }
  _handleClick(key) {
    let { person, onChange } = this.props;
    person.campaignMeta = person.campaignMeta || {};
    const personId = person.personId || person.__originalId || person._id;
    return ev => {
      const data = {
        personId,
        metaKey: key,
        metaValue: person.campaignMeta[key] ? false : true
      };
      Meteor.call("facebook.people.updatePersonMeta", data, error => {
        if (error) {
          Alerts.error(error);
        } else {
          if (onChange) {
            onChange(data);
          }
          person.campaignMeta[key] = data.metaValue;
          Alerts.success("Person updated successfully");
        }
      });
    };
  }
  _hasMeta(data = {}, key) {
    return !!data[key];
  }
  _metaIconName(key) {
    switch (key) {
      case "supporter":
        return "star";
      case "volunteer":
        return "hand point up";
      case "mobilizer":
        return "users";
      case "donor":
        return "currency";
      case "influencer":
        return "certificate";
      case "troll":
        return "dont";
    }
  }
  _metaIconColor(key) {
    switch (key) {
      case "supporter":
        return "blue";
      case "volunteer":
        return "orange";
      case "mobilizer":
        return "yellow";
      case "donor":
        return "green";
      case "influencer":
        return "pink";
      case "troll":
        return "red";
    }
  }
  _metaIconLabel(key) {
    switch (key) {
      case "supporter":
        return "Up for sharing online content";
      case "volunteer":
        return "Willing to work on one-off tasks";
      case "mobilizer":
        return "Can take bigger responsibilities";
      case "donor":
        return "Donated or potential donors";
      case "influencer":
        return "Has a lot of followers";
      case "troll":
        return "Not waste time responding";
    }
  }
  _metaButton(data = {}, key) {
    const { size } = this.props;
    const iconName = this._metaIconName(key);
    const iconColor = this._metaIconColor(key);
    const iconLabel = this._metaIconLabel(key);
    const hasMeta = this._hasMeta(data, key);
    const style = {
      cursor: "pointer",
      opacity: hasMeta ? 1 : 0.2
    };
    return (
      <Popup
        trigger={
          <Icon
            color={iconColor}
            size={size}
            name={iconName}
            style={style}
            onClick={this._handleClick(key)}
          />
        }
        content={iconLabel}
      />
    );
  }
  render() {
    const { person, ...props } = this.props;
    if (person) {
      return (
        <span {...props}>
          {this._metaButton(person.campaignMeta || {}, "supporter")}
          {this._metaButton(person.campaignMeta || {}, "volunteer")}
          {this._metaButton(person.campaignMeta || {}, "mobilizer")}
          {this._metaButton(person.campaignMeta || {}, "donor")}
          {this._metaButton(person.campaignMeta || {}, "influencer")}
          {this._metaButton(person.campaignMeta || {}, "troll")}
        </span>
      );
    }
    return null;
  }
}
