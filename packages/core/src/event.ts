import { event as evt } from "sst/event";
import { ZodValidator } from "sst/event/validator";
import { useActor } from "./actor";

// TODO: #6 Here we define a helper for creating new
// events with a type validator. SST also ships a
// Valibot validator, but we'll gloss over this for now.
export const event = evt.builder({
  validator: ZodValidator,
  metadata: () => ({
    actor: useActor(),
  }),
});
