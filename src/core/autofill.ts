type Autofill = {
  root?: Document | Element,
  profile: {
    name: string
  }
}

export const autofill = ({ root = document, profile }: Autofill) => {
  console.log('Hello content.');
  console.log('Kandidat is active in:', window.location.hostname);
  const input = root.querySelector<HTMLInputElement>("#nome")
  if (input) {
    input.value = profile.name
  }
}