type Autofill = {
  root?: Document | Element,
  profile: {
    name: string
  }
}

export const autofill = ({ root = document, profile }: Autofill) => {
  const input = root.querySelector<HTMLInputElement>("#name")
  if (input) {
    input.value = profile.name
  }
}