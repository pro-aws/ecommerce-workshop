// TODO: #1 First, we need to create an sst.aws.Bus
// (EventBridge EventBus) that we can publish and subscribe
// to. Then we want to subsribe to a Lambda Function handler
// at "packages/functions/src/events/event.handler" where
// we'll process events that we care about.
//
// NOTE: We'll need to link some resources into subscriber
// so that the Lambda Function has permissions to take the
// actions we plan to implement. I'm going to give you those
// as you don't know what we're doing with the events, yet:
// `[secret.StripeSecret, secret.NeonDatabaseUrl, database, email]`
// (you'll need to import these).

// export const bus = ...
// bus.subscribe(...
