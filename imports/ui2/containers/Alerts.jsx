import { Meteor } from "meteor/meteor";
import { withTracker } from "meteor/react-meteor-data";
import { ReactiveVar } from "meteor/reactive-var";

import Alerts from "../components/Alerts.jsx";

let count = 0;
const reactiveAlerts = new ReactiveVar([]);

class AlertStore {
  add(content, type, timeout = 3) {
    let alerts = reactiveAlerts.get().splice(0);
    const id = count;
    alerts.unshift({
      id,
      content,
      type
    });
    reactiveAlerts.set(alerts);
    setTimeout(() => {
      this.remove(id);
    }, timeout * 1000);
    count++;
  }
  remove(id) {
    let alerts = reactiveAlerts.get();
    alerts = alerts.filter(alert => alert.id !== id);
    reactiveAlerts.set(alerts);
  }
}

export const alertStore = new AlertStore();

export default withTracker(() => {
  return {
    alerts: reactiveAlerts.get()
  };
})(Alerts);
