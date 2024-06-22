import { b as pop, p as push } from './index-CLMi6z2J.js';

/* empty css               */
function _layout($$payload, $$props) {
  push();
  let { children } = $$props;
  $$payload.out += `<!--[-->`;
  children($$payload);
  $$payload.out += `<!--]-->`;
  pop();
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-C1YzkOD-.js.map
