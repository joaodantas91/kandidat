import { autofill } from "@/core/autofill";

export default defineContentScript({
  matches: ['<all_urls>'],
  main () {
    autofill({
      profile: {
        name: "John Doe"
      }
    })
  },
});
