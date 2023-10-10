import { BrowserAgent } from "@newrelic/browser-agent/loaders/browser-agent";

// Populate using values in copy-paste JavaScript snippet.
const options = {
  init: {
    distributed_tracing: { enabled: true },
    privacy: { cookies_enabled: true },
    ajax: { deny_list: ["bam.eu01.nr-data.net"] },
  }, // NREUM.init
  info: {
    beacon: "bam.eu01.nr-data.net",
    errorBeacon: "bam.eu01.nr-data.net",
    licenseKey: "NRJS-a5a9889158babc78df9",
    applicationID: "538519415",
    sa: 1,
  }, // NREUM.info
  loader_config: {
    accountID: "4183964",
    trustKey: "4183964",
    agentID: "538519415",
    licenseKey: "NRJS-a5a9889158babc78df9",
    applicationID: "538519415",
  }, // NREUM.loader_config
};

// The agent loader code executes immediately on instantiation.
// eslint-disable-next-line
new BrowserAgent(options);
