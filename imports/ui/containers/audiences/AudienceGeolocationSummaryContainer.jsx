import { Meteor } from "meteor/meteor";
import { ReactiveVar } from "meteor/reactive-var";
import { createContainer } from "meteor/react-meteor-data";
import AudienceGeolocationSummary from "/imports/ui/components/audiences/AudienceGeolocationSummary.jsx";

const geolocationSummary = new ReactiveVar([]);
const loading = new ReactiveVar(false);
let currentRoutePath = null;

export default createContainer(props => {
  // Reset vars when route has changed (ReactiveVar set without a check will cause state change)
  if (currentRoutePath !== FlowRouter.current().path) {
    currentRoutePath = FlowRouter.current().path;
    geolocationSummary.set([]);
    loading.set(true);
  }

  Meteor.call(
    "audiences.accountGeolocationSummary",
    {
      campaignId: props.campaignId,
      facebookAccountId: props.facebookAccountId
    },
    (error, data) => {
      if (error) {
        console.warn(error);
      }
      if (JSON.stringify(geolocationSummary.get()) !== JSON.stringify(data)) {
        geolocationSummary.set(data);
        loading.set(false);
      }
    }
  );

  return {
    loading: loading.get(),
    summary: geolocationSummary.get()
  };
}, AudienceGeolocationSummary);
