import { mount } from 'svelte';
import Options from './Options.svelte';
import '../popup/app.css';
import '@/styles/tokens.css';
import '@/styles/components.css';

const app = mount(Options, {
  target: document.getElementById('app')!,
});

export default app;
