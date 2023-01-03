import http from "k6/http";
import { check } from "k6";
import { Counter } from "k6/metrics";

const PublishFailures = new Counter("publish_failures");

export const options = {
  discardResponseBodies: true,
  thresholds: {
    publish_failures: ["count==0"],
  },
  scenarios: {
    pubsub: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "5s", target: 1000 },
        { duration: "5s", target: 3000 },
        { duration: "5s", target: 5000 },
      ],
      gracefulRampDown: "0s",
    },
  },
};

const DAPR_ADDRESS = `http://127.0.0.1:${__ENV.DAPR_HTTP_PORT}/v1.0`;

function callPublishMethod() {
  return http.post(
    `${DAPR_ADDRESS}/publish/kafka-messagebus/test-topic`,
    JSON.stringify({
      message: "test",
    })
  );
}
export default function () {
  const result = callPublishMethod();
  if (result.status != 204) {
    PublishFailures.add(1);
  }
}

export function teardown(_) {
  const shutdownResult = http.post(`${DAPR_ADDRESS}/shutdown`);
  check(shutdownResult, {
    "shutdown response status code is 2xx":
      shutdownResult.status >= 200 && shutdownResult.status < 300,
  });
}

export function handleSummary(data) {
  return {
    stdout: JSON.stringify(data),
  };
}
