export function injectLeadFormSkin(theme?: { primaryColor: string; secondaryColor: string }, rootNode?: ShadowRoot) {
  const primary = theme?.primaryColor || "rgba(131,80,242,1)";
  const secondary = theme?.secondaryColor || "rgba(61,125,243,1)";
  
  const CSS = `
.lsdk-form.lsdk-form :where(input,select,textarea){
  width:100% !important;
  padding:12px !important;
  background:#f9f9f9 !important;
  border:1px solid #e5e5e5 !important;
  border-radius:4px !important;
  line-height:1.4 !important;
  color:#272727 !important;
  transition:border-color .25s ease,box-shadow .25s ease !important;
}
.lsdk-form.lsdk-form :where(input,select,textarea):focus{
  outline:none !important;
  border-color:${secondary} !important;
  box-shadow:0 0 0 3px ${secondary.replace("1)", "0.25)")} !important;
}
.lsdk-form h4{
  margin:0 0 8px;
  font-weight:600;
  color:${primary};
  font-size:14px;
}
.lsdk-input-group--icon input:focus + .lsdk-input-icon::after{background:${secondary}}
.lsdk-segment>label.lsdk-radio:checked + label{background:${secondary};color:#fff;border-color:${secondary}}
.lsdk-checkbox:checked + label::before{background:${secondary};border-color:${secondary}}
`;

  const STYLE_ID = "lead-form-skin";

  const styleTarget = rootNode ?? document.head;
  let styleEl = styleTarget.querySelector<HTMLStyleElement>(`#${STYLE_ID}`);
  if (!styleEl) {
    styleEl = document.createElement("style");
    styleEl.id = STYLE_ID;
    styleTarget.appendChild(styleEl);
  }
  styleEl.textContent = CSS;
}
