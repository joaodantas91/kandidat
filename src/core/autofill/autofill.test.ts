import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { autofill } from "./autofill";



describe("autofill", () => {
  beforeEach(() => {
    document.body.innerHTML = '<input id="name" />'
  })
  it("should fill name", () => {
    autofill({
      profile: {
        name: "John Doe"
      },
      root: document
    })

    const input = document.querySelector<HTMLInputElement>("#name")
    expect(input?.value).toBe("John Doe")
  })
})