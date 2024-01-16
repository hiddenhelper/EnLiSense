
export const addStyle = (key, style) => {
  const styleNode = document.getElementById(key);
  if (!styleNode) return;

  const { firstChild } = styleNode;
  const node = document.createTextNode(style);
  if (firstChild) styleNode.replaceChild(node, firstChild);
  else styleNode.appendChild(node);
};
